
'use server';

import { revalidatePath } from 'next/cache';
import * as documentTypeService from '@/services/documentTypeService';
import type { DocumentType } from '@/types/DocumentType';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const documentTypeSchema = z.object({
  name: z.string().min(3, "Nome do tipo de documento deve ter pelo menos 3 caracteres."),
  code: z.string().min(1, "Código do tipo de documento é obrigatório."),
  disciplineId: z.string().min(1, "A disciplina é obrigatória."),
  requiresCriticalAnalysis: z.boolean().default(false),
  criticalAnalysisDays: z.coerce.number().int().min(0).default(0),
}).refine(data => {
    if (data.requiresCriticalAnalysis) {
        return data.criticalAnalysisDays && data.criticalAnalysisDays > 0;
    }
    return true;
}, {
    message: "O prazo em dias é obrigatório se a análise crítica for requerida.",
    path: ["criticalAnalysisDays"],
});


export async function createDocumentType(data: Partial<DocumentType>) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    const validatedData = documentTypeSchema.parse(data);
    const dataWithTenant = { 
        ...validatedData, 
        tenantId: user.tenantId, 
        requiredFields: ['description', 'code'],
        criticalAnalysisDays: validatedData.requiresCriticalAnalysis ? validatedData.criticalAnalysisDays : 0,
    };

    await documentTypeService.create(dataWithTenant);

    revalidatePath('/document-types');
    return { success: true, message: 'Tipo de documento criado com sucesso!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao criar tipo de documento.';
    return { success: false, message: errorMessage };
  }
}

export async function updateDocumentType(id: string, data: Partial<DocumentType>) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    const validatedData = documentTypeSchema.parse(data);
    const dataWithTenant = { 
        ...validatedData, 
        tenantId: user.tenantId, 
        requiredFields: ['description', 'code'],
        criticalAnalysisDays: validatedData.requiresCriticalAnalysis ? validatedData.criticalAnalysisDays : 0,
    };

    await documentTypeService.update(id, dataWithTenant);

    revalidatePath('/document-types');
    return { success: true, message: 'Tipo de documento atualizado com sucesso!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar tipo de documento.';
    return { success: false, message: errorMessage };
  }
}

export async function deleteDocumentType(id: string) {
  try {
    await documentTypeService.remove(id);
    revalidatePath('/document-types');
    return { success: true, message: 'Tipo de documento excluído com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir tipo de documento.';
    return { success: false, message: errorMessage };
  }
}
export async function getAllDocumentTypes() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'Usuário não autenticado.' };
    }

    const tenantId = (user as any).tenantId;
    const types = await documentTypeService.findAll(tenantId);
    return { success: true, data: types };
  } catch (error) {
    console.error('Erro em getAllDocumentTypes action:', error);
    const message = error instanceof Error ? error.message : 'Falha ao listar tipos de documento.';
    return { success: false, message };
  }
}
