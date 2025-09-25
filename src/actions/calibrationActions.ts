
'use server';

import { revalidatePath } from 'next/cache';
import * as calibrationService from '@/services/calibrationInstrumentService';
import { z } from 'zod';
import type { CalibrationInstrument, CalibrationInstrumentAttachment } from '@/types/Calibration';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const attachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileLink: z.string().url(),
  uploadedAt: z.string(),
});

const calibrationInstrumentSchema = z.object({
  tag: z.string().min(1, "TAG é obrigatória."),
  description: z.string().min(3, "Descrição é obrigatória."),
  equipmentType: z.string().min(1, "Tipo de equipamento é obrigatório."),
  location: z.string().min(1, "Localização é obrigatória."),
  brand: z.string().min(1, "Marca é obrigatória."),
  model: z.string().min(1, "Modelo é obrigatório."),
  serialNumber: z.string().min(1, "Número de série é obrigatório."),
  calibrationFrequency: z.coerce.number().int().min(1, "Frequência deve ser ao menos 1 dia."),
  lastCalibrationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data da última calibração é inválida." }),
  nextCalibrationDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Data da próxima calibração é inválida." }),
  status: z.enum(['active', 'inactive', 'maintenance']),
  attachments: z.array(attachmentSchema).optional(),
});


export async function createCalibrationInstrument(data: Partial<CalibrationInstrument>) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    const validatedData = calibrationInstrumentSchema.parse(data);
    
    const newInstrument: CalibrationInstrument = {
      id: uuidv4(),
      ...validatedData,
      tenantId: user.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: []
    };

    // Aqui você salvaria no banco de dados
    // await calibrationService.create(newInstrument);

    return { success: true, message: 'Instrumento de calibração criado com sucesso!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao criar instrumento de calibração.';
    return { success: false, message: errorMessage };
  }
}

export async function upsertCalibrationInstrument(
  data: Omit<CalibrationInstrument, 'id'|'_id'|'createdAt'|'updatedAt'|'tenantId'> & { id?: string },
  filesToUpload: { name: string, size: number, type: string, dataUrl: string }[] = []
): Promise<{ success: boolean; message: string; data?: CalibrationInstrument; errors?: z.ZodError['formErrors']['fieldErrors'] }> {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    const validatedData = calibrationInstrumentSchema.parse(data);
    const tenantId = user.tenantId;

    // Process new file uploads
    const newAttachments: CalibrationInstrumentAttachment[] = filesToUpload.map(file => ({
        id: uuidv4(),
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        // In a real app, this would be a URL from a storage service like S3 or GCS
        fileLink: file.dataUrl,
        uploadedAt: new Date().toISOString(),
    }));
    
    const finalAttachments = [...(data.attachments || []), ...newAttachments];

    const payload = {
      ...validatedData,
      tenantId,
      attachments: finalAttachments,
    };

    let savedInstrument;
    if (data.id) {
      // Update
      savedInstrument = await calibrationService.update(data.id, payload);
    } else {
      // Create
      savedInstrument = await calibrationService.create(payload);
    }

    if (!savedInstrument) {
      throw new Error("Falha ao salvar o instrumento no banco de dados.");
    }
    
    revalidatePath('/quality-modules/equipment-control');
    if (data.id) revalidatePath(`/quality-modules/equipment-control/${data.id}/edit`);
    
    return { success: true, message: `Instrumento "${savedInstrument.tag}" salvo com sucesso!`, data: savedInstrument };

  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.flatten().fieldErrors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao salvar o instrumento.';
    console.error("Error in upsertCalibrationInstrument action:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

export async function deleteCalibrationInstrument(id: string) {
  try {
    z.string().min(1).parse(id);
    await calibrationService.remove(id);
    revalidatePath('/quality-modules/equipment-control');
    return { success: true, message: 'Instrumento excluído com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir o instrumento.';
    return { success: false, message: errorMessage };
  }
}
