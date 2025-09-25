
'use server';
/**
 * @fileOverview An AI agent that generates content for Quality Management System (QMS) procedures.
 *
 * - generateProcedureContent - A function that generates procedure content based on a title and context.
 * - GenerateProcedureInput - The input type for the function.
 * - GenerateProcedureOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import { getCurrentUser } from '@/lib/auth';
import { findTenantById } from '@/services/tenantService';
import type { ProcedureAttachment } from '@/types';

// Input Schema from the client
export const GenerateProcedureInputSchema = z.object({
  title: z.string().describe("The title of the procedure, e.g., 'Manual da Qualidade' or 'Procedimento de Controle de Documentos'."),
  category: z.enum(['corporate', 'area', 'contract']).describe("The category of the procedure."),
  area: z.string().optional().describe("The specific area if the category is 'area'."),
  contractName: z.string().optional().describe("The name of the contract if the category is 'contract'."),
  aiPrompt: z.string().optional().describe("Detailed user instructions for the AI on what to generate."),
  attachments: z.array(z.object({ fileLink: z.string(), fileName: z.string(), fileType: z.string() })).optional().describe("An array of attachments for the AI to study for context."),
});
export type GenerateProcedureInput = z.infer<typeof GenerateProcedureInputSchema>;

// Output Schema for the final result
export const GenerateProcedureOutputSchema = z.object({
  content: z.string().describe("The generated procedure content in Markdown format."),
});
export type GenerateProcedureOutput = z.infer<typeof GenerateProcedureOutputSchema>;


// This is the main exported function that the client calls.
export async function generateProcedureContent(input: GenerateProcedureInput): Promise<GenerateProcedureOutput> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  const tenantDetails = await findTenantById(currentUser.tenantId);
  if (!tenantDetails) {
    throw new Error('Detalhes da empresa não encontrados');
  }
  
  return generateProcedureContentFlow({
    procedureTitle: input.title,
    category: input.category,
    area: input.area,
    contractName: input.contractName,
    companyName: tenantDetails.name || 'N/A',
    companyBusiness: 'Desenvolvimento e licenciamento de software para gestão de processos e conformidade.',
    aiPrompt: input.aiPrompt,
    attachments: input.attachments,
  });
}

const attachmentSchemaForPrompt = z.object({
  fileLink: z.string(),
  fileName: z.string(),
  fileType: z.string(),
});

// Define the prompt with a more complex input schema
const prompt = ai.definePrompt({
  name: 'generateProcedureContentPrompt',
  model: gemini15Flash,
  input: { schema: z.object({
    procedureTitle: z.string(),
    category: z.string(),
    area: z.string().optional(),
    contractName: z.string().optional(),
    companyName: z.string(),
    companyBusiness: z.string(),
    aiPrompt: z.string().optional(),
    attachments: z.array(attachmentSchemaForPrompt).optional(),
  }) },
  output: { schema: GenerateProcedureOutputSchema },
  prompt: `Você é um especialista em SGQ e vai gerar o conteúdo de um procedimento a partir das informações fornecidas.
Estruture a saída em Markdown, seguindo as seções abaixo. Seja claro e objetivo.

Metadados do Procedimento
- Título: {{{procedureTitle}}}
- Categoria: {{{category}}}
- Objetivo: {{{objective}}}
- Área Específica: {{{area}}}
- Contrato Específico: {{{contractName}}}

Instruções Gerais
1. Utilize linguagem formal e precisa.
2. Estruture em seções com títulos de nível 2 e 3.
3. Inclua listas numeradas e tópicos quando pertinente.
4. Referencie normas ISO 9001 quando aplicável.

Seções do Procedimento
## 1. Objetivo
Descreva o objetivo do procedimento de forma clara e direta.

## 2. Escopo
Defina o escopo de aplicação deste procedimento.

## 3. Referências
Liste normas, documentos e legislações aplicáveis.

## 4. Definições
Inclua termos e definições relevantes para entendimento do procedimento.

## 5. Responsabilidades
Detalhe as responsabilidades por função ou área.

## 6. Descrição do Processo
Apresente o passo a passo do processo, com subtítulos e etapas.

## 7. Registros e Evidências
Liste os registros gerados, responsáveis e tempos de retenção.

## 8. Indicadores de Desempenho (se aplicável)
Defina indicadores para monitorar a eficácia do processo.

## 9. Anexos (se houver)
Liste anexos relacionados.
`
});

// Define the flow that orchestrates the analysis.
const generateProcedureContentFlow = ai.defineFlow(
  {
    name: 'generateProcedureContentFlow',
    inputSchema: z.object({
      procedureTitle: z.string(),
      category: z.string(),
      area: z.string().optional(),
      contractName: z.string().optional(),
      companyName: z.string(),
      companyBusiness: z.string(),
      aiPrompt: z.string().optional(),
      attachments: z.array(attachmentSchemaForPrompt).optional(),
    }),
    outputSchema: GenerateProcedureOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
