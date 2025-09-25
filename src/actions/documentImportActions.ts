
'use server';

import { getCurrentUser } from '@/lib/auth';
import * as documentService from '@/services/documentService';
import * as documentTypeService from '@/services/documentTypeService';
import * as disciplineService from '@/services/disciplineService';
import { findAllUsers } from '@/services/userService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { redirect } from 'next/navigation';
import type { Document } from '@/types/Document';
import type { User } from '@/types/User';
import type { DocumentType } from '@/types/DocumentType';
import type { Discipline } from '@/types/Discipline';
import type { Contract } from '@/types/Contract';
import { v4 as uuidv4 } from 'uuid';

interface ParsedSheetRow {
  rowIndex: number;
  codigo_documento?: string;
  revisao?: string;
  descricao?: string;
  data_elaboracao?: string;
  disciplina_area_setor?: string;
  tipo_documento_codigo?: string;
  usuario_responsavel_email?: string;
  localizacao_codigo?: string;
  sub_localizacao_codigo?: string;
  errors?: string[];
}

export async function importDocumentsFromSheet(
  dataToImport: ParsedSheetRow[],
  selectedContractId: string
): Promise<{ success: number, failed: number, importId: string, validationErrors: Record<number, string[]> }> {
  try {
    const importId = `import-${uuidv4()}`;
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      redirect('/login');
    }
    
    // Verificar se o usuário tem permissão para importar documentos
    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error("Usuário não tem permissão para importar documentos.");
    }
    
    const currentTenantId = currentUser.tenantId;
    
    let importedCount = 0;
    let failedCount = 0;
    const validationErrors: Record<number, string[]> = {};
    
    // Buscar dados necessários do PostgreSQL
    const [tenantDocTypes, tenantDisciplines, tenantUsers, contracts, allExistingDocuments] = await Promise.all([
      documentTypeService.findAll(currentTenantId),
      disciplineService.findAll(currentTenantId),
      findAllUsers(currentTenantId),
      ContractDrizzleService.findAll(currentTenantId),
      documentService.findAll(currentTenantId)
    ]);
    
    const selectedContract = contracts.find(c => c.id === selectedContractId);
    if (!selectedContract) {
      throw new Error("Contrato selecionado inválido.");
    }

    const documentsToAdd: any[] = [];

    for (const row of dataToImport) {
      let isValid = true;
      let errors: string[] = [];

      // Validação de campos obrigatórios
      if (!row.codigo_documento || !row.revisao || !row.descricao || !row.data_elaboracao || !row.disciplina_area_setor || !row.tipo_documento_codigo || !row.usuario_responsavel_email) {
        isValid = false;
        errors.push("Campos obrigatórios faltando.");
      }

      // Validar tipo de documento
      const docTypeExists = tenantDocTypes.find(dt => dt.code === row.tipo_documento_codigo);
      if (!docTypeExists) {
        isValid = false;
        errors.push(`Tipo de documento com código '${row.tipo_documento_codigo}' não encontrado.`);
      }

      // Validar disciplina
      const disciplineExists = tenantDisciplines.find(d => d.name === row.disciplina_area_setor);
      if (!disciplineExists) {
        isValid = false;
        errors.push(`Disciplina '${row.disciplina_area_setor}' não encontrada.`);
      }

      // Validar usuário responsável
      const responsibleUserExists = tenantUsers.find(u => u.email === row.usuario_responsavel_email);
      if (!responsibleUserExists) {
        isValid = false;
        errors.push(`Usuário responsável com email '${row.usuario_responsavel_email}' não encontrado.`);
      }

      // Verificar duplicatas
      const isDuplicate = allExistingDocuments.some(doc => {
        return doc.contract === selectedContractId &&
          doc.code === row.codigo_documento &&
          doc.currentRevision === row.revisao;
      });
      if (isDuplicate) {
        isValid = false;
        errors.push("Documento duplicado (contrato + código + revisão já existe).");
      }

      if (isValid && docTypeExists && disciplineExists && responsibleUserExists) {
        const newDocument = {
          tenantId: currentTenantId,
          contractId: selectedContract.id,
          documentTypeId: docTypeExists.id,
          disciplineId: disciplineExists.id,
          code: row.codigo_documento!,
          description: row.descricao!,
          currentRevision: row.revisao!,
          responsibleUserId: responsibleUserExists.id,
          createdById: currentUser.id,
          elaborationDate: new Date(row.data_elaboracao!),
          status: 'PENDING_APPROVAL',
          importId: importId,
          fileLink: `/uploads/placeholder_${row.codigo_documento}_${row.revisao}.pdf`,
          fileName: `placeholder_${row.codigo_documento}_${row.revisao}.pdf`,
          fileType: 'application/pdf',
          fileSize: 0,
          textContent: `Conteúdo importado para ${row.codigo_documento} - ${row.descricao}`,
        };
        
        documentsToAdd.push(newDocument);
        importedCount++;
      } else {
        failedCount++;
        validationErrors[row.rowIndex] = errors;
        console.warn(`Falha ao importar linha ${row.rowIndex + 1}: ${errors.join('; ')}`);
      }
    }

    // Salvar documentos no PostgreSQL
    if (documentsToAdd.length > 0) {
      for (const doc of documentsToAdd) {
        await documentService.create(doc);
      }
    }

    return { success: importedCount, failed: failedCount, importId, validationErrors };
  } catch (error) {
    console.error('Erro ao importar documentos:', error);
    throw error;
  }
}
