'use server';

import { z } from "zod";

const suggestionSchema = z.object({
  category: z.enum(['bug', 'improvement', 'idea', 'interface']),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  screenshotInfo: z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
  }).optional(),
});

type SuggestionFormDataForAction = z.infer<typeof suggestionSchema>;

export async function submitSuggestion(data: SuggestionFormDataForAction): Promise<{ success: boolean; message: string }> {
  // Simulates sending the suggestion to a backend service.
  // In a real app, this would save to a database, send an email, create a ticket, etc.
  try {
    const validatedData = suggestionSchema.parse(data);
    
    // Log the validated data to the server console for now
    console.log("Nova sugestão recebida:", validatedData);

    // No revalidatePath is needed as there's no page displaying suggestions yet.

    return { success: true, message: "Obrigado! Sua contribuição é muito importante para melhorarmos o DocFlow." };
  } catch (error) {
    console.error("Erro ao processar sugestão:", error);
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados da sugestão são inválidos.' };
    }
    return { success: false, message: 'Falha ao enviar a sugestão.' };
  }
}
