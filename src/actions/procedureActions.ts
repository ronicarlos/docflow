
'use server';

import { revalidatePath } from 'next/cache';
import * as procedureService from '@/services/procedureService';
import * as userService from '@/services/userService';
import { z } from 'zod';
import type { Procedure, ProcedureAttachment } from '@/types/Procedure';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { generateProcedureContent, GenerateProcedureInputSchema } from '@/flows/generate-procedure-content';

const attachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileLink: z.string(),
  uploadedAt: z.string(),
});

const procedureSchema = z.object({
  title: z.string().min(5, "Título é obrigatório (mínimo 5 caracteres)."),
  code: z.string().min(3, "Código é obrigatório (mínimo 3 caracteres)."),
  category: z.enum(['corporate', 'area', 'contract'], { required_error: "Categoria é obrigatória."}),
  area: z.string().optional(),
  contractId: z.string().optional(),
  content: z.string().min(10, "Conteúdo é obrigatório (mínimo 10 caracteres)."),
  version: z.string().min(1, "Versão é obrigatória."),
  status: z.enum(['draft', 'published', 'archived']),
  attachments: z.array(attachmentSchema).optional(),
  responsibleUserId: z.string().min(1, "O responsável é obrigatório."),
  approverUserId: z.string().optional(),
  associatedRisks: z.array(z.string()).optional(), // Novo campo
}).refine(data => data.category !== 'area' || (data.area && data.area !== ''), {
  message: "A Área é obrigatória para a categoria 'Por Área'.",
  path: ['area'],
}).refine(data => data.category !== 'contract' || (data.contractId && data.contractId !== ''), {
  message: "O Contrato é obrigatório para a categoria 'Por Contrato'.",
  path: ['contractId'],
});


export async function upsertProcedure(
  data: Omit<Procedure, 'id'|'_id'|'createdAt'|'updatedAt'|'tenantId'|'responsibleUser'|'approverUser'> & { id?: string, responsibleUserId: string, approverUserId?: string },
  filesToUpload: { name: string, size: number, type: string, dataUrl: string }[] = []
): Promise<{ success: boolean; message: string; data?: Procedure; errors?: z.ZodError['formErrors']['fieldErrors'] }> {
  try {
    const validatedData = procedureSchema.parse(data);
    
    const user = await getCurrentUser();
    const tenantId = user?.tenantId;
    
    if (!tenantId) {
        throw new Error("Usuário não autenticado ou sem tenant válido.");
    }
    
    const [responsibleUser, approverUser] = await Promise.all([
        userService.findUserById(validatedData.responsibleUserId),
        validatedData.approverUserId && validatedData.approverUserId !== '_NONE_' 
            ? userService.findUserById(validatedData.approverUserId) 
            : Promise.resolve(null),
    ]);

    if (!responsibleUser) throw new Error("Usuário responsável não encontrado.");

    const newAttachments: ProcedureAttachment[] = filesToUpload.map(file => ({
        id: uuidv4(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        fileLink: file.dataUrl,
        uploadedAt: new Date().toISOString(),
    }));
    
    const finalAttachments = [...(data.attachments || []), ...newAttachments];

    const payload: Partial<Procedure> = {
      ...validatedData,
      tenantId,
      attachments: finalAttachments,
      responsibleUser: { id: responsibleUser.id, name: responsibleUser.name, email: responsibleUser.email },
      approverUser: approverUser ? { id: approverUser.id, name: approverUser.name, email: approverUser.email } : undefined,
    };
    
    let savedProcedure;
    if (data.id) {
      const originalProcedure = await procedureService.findById(data.id);
      if (!originalProcedure) throw new Error("Procedimento original não encontrado para atualização.");
      
      // Logic for versioning: if editing a published procedure, archive it and create a new draft.
      if (originalProcedure.status === 'published' && data.status !== 'archived') {
        // 1. Archive the current procedure
        await procedureService.update(originalProcedure.id, { status: 'archived' });
        
        // 2. Create a new version number
        const currentVersionParts = originalProcedure.version.split('.').map(part => parseInt(part, 10)).filter(num => !isNaN(num));
        const newVersion = currentVersionParts.length > 1 ? `${currentVersionParts[0]}.${(currentVersionParts[1] || 0) + 1}` : '1.0';
        
        // 3. Create a new procedure as a draft version
        const newProcedurePayload = { ...payload, version: newVersion, status: 'draft' };
        delete (newProcedurePayload as any).id; // Remove ID to ensure a new document is created
        savedProcedure = await procedureService.create(newProcedurePayload as Procedure);
        
        return { success: true, message: `Procedimento versionado com sucesso! Versão ${originalProcedure.version} arquivada. Nova versão ${newVersion} criada como rascunho.`, data: savedProcedure };
      } else {
        // Only set publicationDate if status is changing TO published
        if (data.status === 'published' && originalProcedure.status !== 'published') {
            payload.publicationDate = new Date().toISOString();
        }
        savedProcedure = await procedureService.update(data.id, payload);
      }
    } else {
      if (payload.status === 'published') {
        payload.publicationDate = new Date().toISOString();
      }
      savedProcedure = await procedureService.create(payload as Procedure);
    }

    if (!savedProcedure) {
      throw new Error("Falha ao salvar o procedimento no banco de dados.");
    }
    
    revalidatePath('/dashboard');
    
    return { success: true, message: `Procedimento "${savedProcedure.title}" (v${savedProcedure.version}) salvo com sucesso!`, data: savedProcedure };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.flatten().fieldErrors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao salvar o procedimento.';
    console.error("Error in upsertProcedure action:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

export async function deleteProcedure(id: string) {
  try {
    z.string().min(1).parse(id);
    await procedureService.remove(id);
    revalidatePath('/dashboard');
    return { success: true, message: 'Procedimento excluído com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir o procedimento.';
    return { success: false, message: errorMessage };
  }
}

export async function generateProcedureContentAction(
  data: z.infer<typeof GenerateProcedureInputSchema>
): Promise<{ success: boolean; content?: string; message: string }> {
  try {
    const validatedData = GenerateProcedureInputSchema.parse(data);
    const result = await generateProcedureContent(validatedData);
    return { success: true, content: result.content, message: 'Conteúdo gerado com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao gerar conteúdo com IA.';
    console.error("Error in generateProcedureContentAction:", errorMessage);
    return { success: false, message: errorMessage };
  }
}
