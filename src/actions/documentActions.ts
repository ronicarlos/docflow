

'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as documentService from '@/services/documentService';
import * as distributionService from '@/services/distributionService';
import { getCurrentUser } from '@/lib/auth';
import type { Document, Revision, DocumentStatus, ApprovalEvent } from '@/types/Document';
import type { User } from '@/types/User';
import { DOCUMENT_STATUSES } from '@/lib/constants';
import { format, isValid, parseISO, addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { suggestDocumentTags } from '@/flows/suggest-document-tags'; // Importar o fluxo de IA
// Schema for the main document creation form (upload page)
const documentCreateSchema = z.object({
  contractId: z.string().min(1, "Contrato é obrigatório"),
  documentTypeId: z.string().min(1, "Tipo de documento é obrigatório"),
  code: z.string().min(1, "Código do documento é obrigatório"),
  revision: z.string().min(1, "Revisão é obrigatória").default('R00'),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  aiPrompt: z.string().optional(),
  area: z.string().min(1, "Área/Setor (Disciplina) é obrigatória"),
  responsibleUserId: z.string().min(1, "Usuário responsável é obrigatório"),
  approvingUserId: z.string().optional(),
  elaborationDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de elaboração inválida." }),
  locationAreaId: z.string().optional().nullable(),
  locationSubAreaId: z.string().optional().nullable(),
  requiresContinuousImprovement: z.boolean().optional().default(false),
  validityDays: z.coerce.number().int().min(0).optional().nullable(),
  nextReviewDate: z.string().optional(),
  textContent: z.string().optional(), // Este campo pode ser preenchido pela geração manual de IA
});

type DocumentCreateFormData = z.infer<typeof documentCreateSchema>;

// Schema for the document edit form
const documentEditSchema = documentCreateSchema.extend({
  status: z.enum(Object.keys(DOCUMENT_STATUSES) as [DocumentStatus, ...DocumentStatus[]]).default('draft'),
});

type DocumentEditFormData = z.infer<typeof documentEditSchema>;

const NONE_VALUE = "_NONE_"; // Constant for 'no selection'

// Helper to validate string IDs
const isValidId = (id: string | null | undefined): boolean => {
    return !!(id && id !== NONE_VALUE && id.trim().length > 0);
};


export async function createDocument(
  data: DocumentCreateFormData,
  fileData: { fileName: string; fileSize: number; fileType: string; fileDataUrl: string; }
) {
  try {
    const validatedData = documentCreateSchema.parse(data);
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Fallback text content in case OCR fails or isn't applicable
    let extractedText = `Conteúdo do arquivo: ${fileData.fileName}. Detalhes: ${validatedData.description}.`;
    
    try {
        const ocrResult = await suggestDocumentTags({
            documentContent: validatedData.description,
            imageDataUri: fileData.fileDataUrl.startsWith('data:image') ? fileData.fileDataUrl : undefined,
            documentDataUri: !fileData.fileDataUrl.startsWith('data:image') ? fileData.fileDataUrl : undefined,
        });
        if (ocrResult.extractedText) {
            extractedText = ocrResult.extractedText;
        }
    } catch (ocrError) {
        console.warn("Falha no OCR automático, usando texto de fallback:", ocrError);
    }
    const finalContent = data.textContent || extractedText;


    const elaborationIsoDate = new Date(validatedData.elaborationDate).toISOString();
    
    const validApproverId = validatedData.approvingUserId && validatedData.approvingUserId !== NONE_VALUE ? validatedData.approvingUserId : undefined;

    const newRevision: Omit<Revision, 'id'> = {
      tenantId: user.tenantId,
      revisionNumber: validatedData.revision,
      date: elaborationIsoDate,
      user: { id: user.id, name: user.name, email: user.email },
      observation: `Revisão inicial ${validatedData.revision} criada durante o upload.`,
      status: 'draft',
      fileLink: fileData.fileDataUrl,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      fileType: fileData.fileType,
      textContent: finalContent,
      approvingUserId: validApproverId,
    };
    
    const newApprovalEvent: ApprovalEvent = {
        user: { id: user.id, name: user.name, email: user.email },
        date: new Date().toISOString(),
        status: 'draft',
        observation: `Documento ${validatedData.code} (Rev: ${validatedData.revision}) criado e salvo como '${DOCUMENT_STATUSES['draft'].label}' por ${user.name}.`
    };

    const newDocumentData: Partial<Document> = {
        tenantId: user.tenantId,
        contract: validatedData.contractId,
        documentType: validatedData.documentTypeId,
        code: validatedData.code,
        description: validatedData.description,
        aiPrompt: validatedData.aiPrompt,
        area: validatedData.area,
        createdBy: { id: user.id, name: user.name, email: user.email },
        responsibleUser: validatedData.responsibleUserId,
        elaborationDate: elaborationIsoDate,
        lastStatusChangeDate: new Date().toISOString(),
        status: 'draft',
        approvalHistory: [newApprovalEvent],
        revisions: [newRevision as Revision],
        currentRevision: newRevision as Revision,
        fileLink: fileData.fileDataUrl,
        isDeleted: false,
        requiresContinuousImprovement: validatedData.requiresContinuousImprovement,
        validityDays: validatedData.validityDays ?? undefined,
        nextReviewDate: validatedData.nextReviewDate,
        locationArea: validatedData.locationAreaId ?? undefined,
        locationSubArea: validatedData.locationSubAreaId ?? undefined,
        textContent: finalContent, 
    };
    
    await documentService.create(newDocumentData);
    revalidatePath('/dashboard');
    return { success: true, message: `Documento "${validatedData.code}" salvo como rascunho.` };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      const formattedErrors = Object.entries(error.flatten().fieldErrors).map(([field, messages]) => `${field}: ${messages?.join(', ') || 'Erro desconhecido'}`).join('; ');
      return { success: false, message: `Erro de validação do formulário: ${formattedErrors}`, errors: error.flatten().fieldErrors };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Falha desconhecida ao criar documento.';
    console.error("Error in createDocument action:", errorMessage, error);
    return { success: false, message: errorMessage };
  }
}

export async function updateDocumentMetadata(
  documentId: string,
  data: DocumentEditFormData,
  fileData?: { fileName: string; fileSize: number; fileType: string; fileDataUrl: string; }
) {
  try {
    if (!documentId) {
        throw new Error("O ID do documento para atualização é inválido.");
    }

    const validatedData = documentEditSchema.parse(data);
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Usuário não autenticado.");

    const originalDocument = await documentService.findById(documentId);
    if (!originalDocument) {
        throw new Error(`Documento original com ID ${documentId} não foi encontrado.`);
    }

    const elaborationIsoDate = new Date(validatedData.elaborationDate).toISOString();
    
    let fileHasChanged = false;
    let newTextContent = originalDocument.currentRevision?.textContent;
    const validApproverId = validatedData.approvingUserId && validatedData.approvingUserId !== NONE_VALUE ? validatedData.approvingUserId : undefined;

    const updatedDocument: Partial<Document> = { 
        ...validatedData,
        validityDays: validatedData.validityDays ?? undefined,
        elaborationDate: elaborationIsoDate,
        contract: validatedData.contractId,
        documentType: validatedData.documentTypeId,
        responsibleUser: validatedData.responsibleUserId,
        locationArea: validatedData.locationAreaId ?? undefined,
        locationSubArea: validatedData.locationSubAreaId ?? undefined,
    };
    
    const currentRevision = { ...originalDocument.currentRevision };

    if (fileData) {
        if (originalDocument.status !== 'draft') {
            throw new Error("Não é possível substituir o arquivo de uma revisão que não está em rascunho. Por favor, crie uma nova revisão.");
        }
        currentRevision.fileLink = fileData.fileDataUrl;
        currentRevision.fileName = fileData.fileName;
        currentRevision.fileSize = fileData.fileSize;
        currentRevision.fileType = fileData.fileType;
        
        try {
            const ocrResult = await suggestDocumentTags({
                documentContent: validatedData.description,
                imageDataUri: fileData.fileDataUrl.startsWith('data:image') ? fileData.fileDataUrl : undefined,
                documentDataUri: !fileData.fileDataUrl.startsWith('data:image') ? fileData.fileDataUrl : undefined,
            });
            newTextContent = ocrResult.extractedText || `Conteúdo atualizado para: ${fileData.fileName}`;
        } catch (ocrError) {
            console.warn("Falha no OCR ao atualizar arquivo, usando texto de fallback:", ocrError);
            newTextContent = `Conteúdo atualizado simulado para o arquivo: ${fileData.fileName}.`;
        }

        fileHasChanged = true;
    }
    
    currentRevision.revisionNumber = validatedData.revision;
    currentRevision.status = validatedData.status;
    currentRevision.textContent = newTextContent;
    currentRevision.approvingUserId = validApproverId;


    updatedDocument.revisions = originalDocument.revisions.map(rev => 
        rev.id === currentRevision.id ? currentRevision : rev
    ) as Revision[];
    updatedDocument.currentRevision = currentRevision as Revision;
    updatedDocument.fileLink = currentRevision.fileLink;
    updatedDocument.textContent = newTextContent; // Atualiza no nível do documento

    if (originalDocument.status !== validatedData.status || fileHasChanged) {
        updatedDocument.lastStatusChangeDate = new Date().toISOString();
        const newHistory: ApprovalEvent = {
            user: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
            date: updatedDocument.lastStatusChangeDate,
            status: validatedData.status,
            observation: `Status ou arquivo da revisão ${validatedData.revision} alterado para ${DOCUMENT_STATUSES[validatedData.status].label} por ${currentUser.name} via edição.`
        };
        updatedDocument.approvalHistory = [...(originalDocument.approvalHistory || []), newHistory];
    }
    
    if (validatedData.status !== 'approved') {
        updatedDocument.approver = undefined;
    }

    await documentService.update(documentId, updatedDocument);
    
    revalidatePath('/dashboard');

    return { success: true, message: `Documento "${validatedData.code}" atualizado com sucesso.` };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.flatten().fieldErrors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar documento.';
    console.error("Error in updateDocumentMetadata action:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

export async function createNewRevision(
  documentId: string,
  observation: string,
  fileData: { fileName: string; fileSize: number; fileType: string; fileDataUrl: string; }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) throw new Error("Usuário não autenticado.");

        const originalDocument = await documentService.findById(documentId);
        if (!originalDocument) throw new Error("Documento original não encontrado.");
        if (!originalDocument.currentRevision) throw new Error("Documento não possui revisão atual.");

        const nextRevisionNumber = `R${String(parseInt(originalDocument.currentRevision.revisionNumber.replace('R',''), 10) + 1).padStart(2, '0')}`;

        let extractedText = `Conteúdo da nova revisão ${nextRevisionNumber}: ${observation}`; // Fallback
        try {
            const ocrResult = await suggestDocumentTags({
                documentContent: observation,
                imageDataUri: fileData.fileDataUrl.startsWith('data:image') ? fileData.fileDataUrl : undefined,
                documentDataUri: !fileData.fileDataUrl.startsWith('data:image') ? fileData.fileDataUrl : undefined,
            });
            if (ocrResult.extractedText) {
                extractedText = ocrResult.extractedText;
            }
        } catch (ocrError) {
            console.warn("Falha no OCR da nova revisão, usando texto de fallback:", ocrError);
        }

        const newRevision: Revision = {
            id: `rev-${uuidv4()}`,
            tenantId: originalDocument.tenantId,
            revisionNumber: nextRevisionNumber,
            date: new Date().toISOString(),
            user: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
            observation,
            status: 'pending_approval', 
            fileLink: fileData.fileDataUrl,
            fileName: fileData.fileName,
            fileSize: fileData.fileSize,
            fileType: fileData.fileType,
            textContent: extractedText,
            approvingUserId: originalDocument.currentRevision.approvingUserId, 
        };
        
        await documentService.addRevision(documentId, newRevision);

        revalidatePath(`/documentos/${documentId}`);
        revalidatePath('/dashboard');
        
        return { success: true, message: `Nova revisão ${nextRevisionNumber} criada e submetida para aprovação.`};
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Falha ao criar nova revisão.';
        console.error("Error in createNewRevision action:", errorMessage);
        return { success: false, message: errorMessage };
    }
}


const idSchema = z.string().min(1, 'ID do documento é obrigatório.');

export async function softDeleteDocument(id: string) {
  try {
    idSchema.parse(id);
    await documentService.softDelete(id);
    revalidatePath('/dashboard');
    revalidatePath('/lixeira');
    return { success: true, message: 'Documento movido para a lixeira.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao mover documento para a lixeira.';
    return { success: false, message: errorMessage };
  }
}

export async function restoreDocument(id: string) {
  try {
    idSchema.parse(id);
    await documentService.restore(id);
    revalidatePath('/dashboard');
    revalidatePath('/lixeira');
    return { success: true, message: 'Documento restaurado com sucesso.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao restaurar documento.';
    return { success: false, message: errorMessage };
  }
}

export async function permanentlyDeleteDocument(id: string) {
  try {
    idSchema.parse(id);
    await documentService.remove(id);
    revalidatePath('/lixeira');
    return { success: true, message: 'Documento excluído permanentemente.' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir o documento permanentemente.';
    return { success: false, message: errorMessage };
  }
}

export async function updateDocumentStatus(
  documentId: string,
  newStatus: DocumentStatus,
  observation: string
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("Usuário não autenticado.");

    const document = await documentService.findById(documentId);
    if (!document) throw new Error("Documento não encontrado.");
    if (!document.currentRevision) throw new Error("Documento não possui revisão atual.");

    const now = new Date();
    const currentRevisionIndex = document.revisions.findIndex(rev => rev.id === document.currentRevision!.id);
    if (currentRevisionIndex === -1) throw new Error("Revisão atual não encontrada no documento.");

    const updatedRevision = { ...document.revisions[currentRevisionIndex] };
    updatedRevision.status = newStatus;
    updatedRevision.approverObservation = observation;
    if (newStatus === 'approved') {
      updatedRevision.approvedByUserId = currentUser.id;
      updatedRevision.approvalDate = now.toISOString();
    }

    const newApprovalEvent: ApprovalEvent = {
      user: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
      status: newStatus,
      date: now.toISOString(),
      observation: observation || DOCUMENT_STATUSES[newStatus].label,
    };

    const docToUpdate: Partial<Document> = {};
    docToUpdate.status = newStatus;
    docToUpdate.revisions = [...document.revisions];
    docToUpdate.revisions[currentRevisionIndex] = updatedRevision;
    docToUpdate.currentRevision = updatedRevision;
    docToUpdate.approvalHistory = [...(document.approvalHistory || []), newApprovalEvent];
    docToUpdate.lastStatusChangeDate = now.toISOString();

    if (newStatus === 'approved') {
        docToUpdate.approver = { id: currentUser.id, name: currentUser.name, email: currentUser.email };
    } else {
        docToUpdate.approver = undefined; // Garante que o aprovador seja limpo se não for 'approved'
    }

    await documentService.update(documentId, docToUpdate);

    if (newStatus === 'approved') {
        const notificationsSentCount = await distributionService.notifyRelevantUsers(document);
        revalidatePath(`/documentos/${documentId}`);
        revalidatePath('/dashboard');
        return { success: true, message: `Status atualizado para '${DOCUMENT_STATUSES[newStatus].label}'. ${notificationsSentCount} notificações de distribuição enviadas.`, notificationsSent: notificationsSentCount };
    }
    
    revalidatePath(`/documentos/${documentId}`);
    revalidatePath('/dashboard');
    return { success: true, message: `Status atualizado para '${DOCUMENT_STATUSES[newStatus].label}'.`, notificationsSent: 0 };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar status do documento.';
    console.error("Error in updateDocumentStatus action:", errorMessage);
    return { success: false, message: errorMessage, notificationsSent: 0 };
  }
}

const masterListFiltersSchema = z.object({
  search: z.string().optional(),
  contractId: z.string().optional(),
  documentTypeId: z.string().optional(),
  area: z.string().optional(),
  status: z.string().optional(),
});
type MasterListFilters = z.infer<typeof masterListFiltersSchema>;

export async function generateMasterList(filters: MasterListFilters): Promise<Document[]> {
    try {
        const user = await getCurrentUser();
        if (!user || !user.tenantId) {
            throw new Error('Usuário não autenticado');
        }
        
        const documents = await documentService.findByFilters(user.tenantId, {
            ...filters,
            documentTypeIds: filters.documentTypeId ? [filters.documentTypeId] : undefined
        });
        return documents;
    } catch(error) {
        console.error("Error in generateMasterList action:", error);
        throw new Error("Falha ao gerar a Lista Mestra.");
    }
}
