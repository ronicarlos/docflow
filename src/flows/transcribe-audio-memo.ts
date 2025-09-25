
// src/ai/flows/transcribe-audio-memo.ts
'use server';
/**
 * @fileOverview An AI agent that transcribes audio memos into structured meeting minutes.
 *
 * - transcribeAudioMemo - A function that returns structured meeting minutes from an audio file.
 * - TranscribeAudioMemoInput - The input type for the function.
 * - TranscribeAudioMemoOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { gemini15Flash } from '@genkit-ai/googleai';

const TranscribeAudioMemoInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "An audio file of a meeting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioMemoInput = z.infer<typeof TranscribeAudioMemoInputSchema>;

const TranscribeAudioMemoOutputSchema = z.object({
  meetingMinutes: z.string().describe('A formatted meeting minute document based on the audio content, including topics, decisions, and action items, written in Markdown format.'),
});
export type TranscribeAudioMemoOutput = z.infer<typeof TranscribeAudioMemoOutputSchema>;

export async function transcribeAudioMemo(input: TranscribeAudioMemoInput): Promise<TranscribeAudioMemoOutput> {
  return transcribeAudioMemoFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateMeetingMinutesPrompt',
    model: gemini15Flash,
    input: { schema: TranscribeAudioMemoInputSchema },
    output: { schema: TranscribeAudioMemoOutputSchema },
    prompt: `You are an expert administrative assistant specializing in creating formal meeting minutes ("Ata de Reunião") from audio recordings. Your task is to analyze the provided audio and generate a comprehensive, well-structured meeting minute document in Markdown format.

    Listen to the audio recording of a meeting and perform the following actions:
    1.  **Transcribe** the entire conversation.
    2.  **Analyze the content semantically** to identify key information.
    3.  **Generate the document** with the following specific sections, using Markdown for formatting:

    ---
    
    # Ata de Reunião
    
    ## Título da Reunião
    *Infer a concise title for the meeting based on its main subject.*
    
    ## Data e Horário
    *Identify the date and time mentioned. If not mentioned, state that it needs to be added manually.*
    
    ## Participantes
    *List all participants mentioned by name. If names are not explicitly stated, list them as "Participante 1", "Participante 2", etc.*
    
    ## Pauta da Reunião (Tópicos Discutidos)
    *Summarize the main topics and discussions in a clear, bulleted list. Each bullet point should represent a distinct subject discussed.*
    
    ## Decisões Tomadas
    *Create a numbered list of all explicit decisions that were made during the meeting. Each item should be a clear statement of a decision.*
    
    ## Itens de Ação (Ações a Serem Tomadas)
    *This is the most critical section. Create a table in Markdown format with the columns: "Ação", "Responsável", and "Prazo".
    - Identify every task or action item assigned.
    - Identify the person responsible for each action.
    - Identify any deadlines mentioned for each action. If no deadline is mentioned, write 'A definir'.
    Example of the table format:
    | Ação                                   | Responsável      | Prazo      |
    | -------------------------------------- | ---------------- | ---------- |
    | Enviar o relatório financeiro revisado | Carolina Dantas  | 25/07/2024 |
    | Agendar reunião de follow-up           | Roberto          | A definir  |*
    
    ## Observações Gerais
    *Include any other relevant information, open points, or general comments that don't fit into the other sections.*
    ---
    
    **Audio to be transcribed and summarized:** {{media url=audioDataUri}}
    
    Produce the final output as a single, well-formatted Markdown document.
    `,
});


const transcribeAudioMemoFlow = ai.defineFlow(
  {
    name: 'transcribeAudioMemoFlow',
    inputSchema: TranscribeAudioMemoInputSchema,
    outputSchema: TranscribeAudioMemoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return {
      meetingMinutes: output!.meetingMinutes,
    };
  }
);
