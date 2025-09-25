
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import * as meetingMinuteService from '@/services/meetingMinuteService';
import { getCurrentUser } from '@/lib/auth';
import { transcribeAudioMemo } from '@/flows/transcribe-audio-memo';
import type { IMeetingMinute, MeetingMinuteStatus, IMeetingMinuteAttachment } from '@/types';
import { MEETING_MINUTE_STATUSES } from '@/lib/constants';

// Schema for creating a minute from audio
const createFromAudioSchema = z.object({
  audioDataUri: z.string().min(1, "Data URI do áudio é obrigatório."),
  contractId: z.string().min(1, "Contrato é obrigatório."),
});

// Schema for updating a minute
const updateMinuteSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  meetingDate: z.string().refine((val) => !isNaN(Date.parse(val)), "Data inválida."),
  status: z.enum(Object.keys(MEETING_MINUTE_STATUSES) as [MeetingMinuteStatus, ...MeetingMinuteStatus[]]),
  contractId: z.string().min(1, "O contrato é obrigatório."),
  generatedMarkdown: z.string().min(10, "O conteúdo da ata não pode estar vazio."),
});

// Server Action to create a meeting minute from an audio file using AI
export async function createMeetingMinuteFromAudio(data: z.infer<typeof createFromAudioSchema>) {
  try {
    const validatedData = createFromAudioSchema.parse(data);
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    // Call the AI flow to transcribe and summarize
    const aiResult = await transcribeAudioMemo({ audioDataUri: validatedData.audioDataUri });
    const titleMatch = aiResult.meetingMinutes.match(/## Título da Reunião\n(.+)/);
    const meetingTitle = titleMatch && titleMatch[1] ? titleMatch[1].trim() : `Ata de Reunião - ${new Date().toLocaleDateString('pt-BR')}`;
    
    // Create the new meeting minute object
    const newMinuteData = {
      tenantId: user.tenantId,
      contractId: validatedData.contractId,
      contractName: '', // This will be populated by the service
      title: meetingTitle,
      meetingDate: new Date(),
      generatedMarkdown: aiResult.meetingMinutes,
      status: 'Em Andamento' as MeetingMinuteStatus,
      attachments: [] as IMeetingMinuteAttachment[],
      createdByUserId: user.id,
    };

    const createdMinute = await meetingMinuteService.create(newMinuteData);

    revalidatePath('/meeting-minutes');
    return { success: true, message: 'Ata gerada e salva como rascunho com sucesso!', data: createdMinute };
  } catch (error) {
    console.error("Error creating meeting minute from audio:", error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao processar o áudio.';
    return { success: false, message: errorMessage };
  }
}

// Server Action to update an existing meeting minute
export async function updateMeetingMinute(id: string, data: z.infer<typeof updateMinuteSchema>, attachments: IMeetingMinuteAttachment[]) {
  try {
    const validatedData = updateMinuteSchema.parse(data);
    await meetingMinuteService.update(id, { 
      ...validatedData, 
      meetingDate: new Date(validatedData.meetingDate),
      attachments 
    } as Partial<IMeetingMinute>);
    
    revalidatePath(`/meeting-minutes/${id}/edit`);
    revalidatePath('/meeting-minutes');
    return { success: true, message: 'Ata atualizada com sucesso!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.flatten().fieldErrors };
    }
    console.error("Error updating meeting minute:", error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar ata.';
    return { success: false, message: errorMessage };
  }
}

// Server Action to delete a meeting minute
export async function deleteMeetingMinute(id: string) {
  try {
    await meetingMinuteService.remove(id);
    revalidatePath('/meeting-minutes');
    return { success: true, message: 'Ata excluída com sucesso!' };
  } catch (error) {
    console.error("Error deleting meeting minute:", error);
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir ata.';
    return { success: false, message: errorMessage };
  }
}
