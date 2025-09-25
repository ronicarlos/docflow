
'use server';
/**
 * @fileOverview An AI agent that acts as a help assistant for the DocFlow application.
 *
 * - helpChat - A function that provides answers based on the user manual and context.
 * - HelpChatInput - The input type for the helpChat function.
 * - HelpChatOutput - The return type for the helpChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { aiKnowledgeBaseService } from '@/services/aiKnowledgeBaseService';
// Import the ISO contexts
import { helpContexts } from '@/lib/help-contexts';
import { gemini15Flash } from '@genkit-ai/googleai';


const HelpChatInputSchema = z.object({
  question: z.string().describe('The user\'s question about the DocFlow system.'),
  pageContext: z.string().describe('The current page or context the user is on, like "/dashboard" or "/upload".'),
  imageDataUri: z.string().optional().describe('An optional image provided by the user, as a data URI.'),
  audioDataUri: z.string().optional().describe('An optional audio memo provided by the user, as a data URI.'),
  documentDataUri: z.string().optional().describe("An optional document (PDF, TXT, DOCX) provided by the user, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  tenantId: z.string().describe('The tenant ID to get the knowledge base for.'),
});
export type HelpChatInput = z.infer<typeof HelpChatInputSchema>;

const HelpChatOutputSchema = z.object({
  answer: z.string().describe('A helpful and concise answer to the user\'s question.'),
});
export type HelpChatOutput = z.infer<typeof HelpChatOutputSchema>;

export async function helpChat(input: HelpChatInput): Promise<HelpChatOutput> {
  return helpChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'helpChatPrompt',
  model: gemini15Flash,
  // Add the new context fields to the prompt's input schema
  input: {schema: HelpChatInputSchema.extend({
    manualContent: z.string(),
    isoContextContent: z.string(),
  })},
  output: {schema: HelpChatOutputSchema}, 
  prompt: `Você é um assistente virtual especialista no sistema DocFlow e na norma ISO 9001. Sua missão é ajudar os usuários a entender e utilizar a plataforma de forma eficiente, **sempre conectando as funcionalidades do sistema aos requisitos da ISO 9001**.

  **INSTRUÇÃO PRINCIPAL:** Ao responder qualquer pergunta sobre uma funcionalidade ou campo do sistema, você **DEVE OBRIGATORIAMENTE** explicar qual requisito da ISO 9001 está sendo atendido. Utilize a base de conhecimento sobre ISO 9001 fornecida abaixo para fazer essa conexão.

  --- BASE DE CONHECIMENTO ISO 9001 ---
  {{{isoContextContent}}}
  --- FIM DA BASE ISO 9001 ---

  --- MANUAL GERAL DO SISTEMA ---
  {{{manualContent}}}
  --- FIM DO MANUAL ---

  {{#if imageDataUri}}
  O usuário também forneceu a seguinte imagem para análise. Se a pergunta for sobre a imagem, descreva o que você vê nela e use-a como contexto principal para a resposta.
  Imagem: {{media url=imageDataUri}}
  {{/if}}

  {{#if audioDataUri}}
  O usuário também forneceu um áudio. Transcreva o áudio e use a transcrição como contexto para a resposta.
  Áudio: {{media url=audioDataUri}}
  {{/if}}

  {{#if documentDataUri}}
  O usuário também forneceu o seguinte documento para análise. Se a pergunta for sobre o documento, analise seu conteúdo e use-o como contexto principal para a resposta.
  Documento: {{media url=documentDataUri}}
  {{/if}}

  O usuário está atualmente na seguinte página do sistema: '{{{pageContext}}}'.
  A pergunta do usuário é: '{{{question}}}'.

  Com base no manual, no contexto da página, na pergunta e em qualquer imagem ou áudio fornecido, e **principalmente, na base de conhecimento da ISO 9001**, forneça uma resposta clara e útil. Estruture sua resposta para primeiro explicar como usar a funcionalidade e, em seguida, explicar o "porquê", mencionando o requisito ISO 9001 correspondente e a importância para auditorias. Se a pergunta for sobre algo não abordado, admita que não tem essa informação e sugira que o usuário utilize a tela de "Sugestões e Melhorias".
  `,
});


const helpChatFlow = ai.defineFlow(
  {
    name: 'helpChatFlow',
    inputSchema: HelpChatInputSchema,
    outputSchema: HelpChatOutputSchema,
  },
  async (input, context) => {
    try {
      const manualContent = await aiKnowledgeBaseService.getActiveKnowledgeBase(input.tenantId);
      const isoContextContent = JSON.stringify(helpContexts, null, 2);
      
      const {output} = await prompt({
        ...input,
        manualContent: manualContent,
        isoContextContent: isoContextContent,
      }, context);

      if (!output?.answer) {
          throw new Error("A IA não conseguiu gerar uma resposta em texto.");
      }
      
      return {
          answer: output.answer,
      };
    } catch (error) {
      console.error('Erro ao buscar base de conhecimento:', error);
      // Fallback para conteúdo padrão se houver erro
      const {output} = await prompt({
        ...input,
        manualContent: "Base de conhecimento não disponível no momento.",
        isoContextContent: JSON.stringify(helpContexts, null, 2),
      }, context);

      return {
          answer: output?.answer || "Desculpe, não foi possível processar sua pergunta no momento. Tente novamente mais tarde.",
      };
    }
  }
);
