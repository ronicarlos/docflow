
'use server';
/**
 * @fileOverview An AI agent that analyzes contract compliance by cross-referencing documents.
 * It uses a tool to dynamically search for relevant evidence documents.
 * - intelligentAnalysisFlow - A function that performs the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import type { Contract, Document } from '@/types';
import * as documentService from '@/services/documentService';
import { getCurrentUser } from '@/lib/auth';
import type { AnalysisDeviation, AnalysisAlert } from '@/types/AnalysisResult';

// Define the schema for the tool's input
const findDocumentsToolSchema = z.object({
  contractId: z.string().describe("The ID of the contract to search within."),
  searchQuery: z.string().optional().describe("A keyword or code to search for within document content or metadata."),
  documentTypeIds: z.array(z.string()).optional().describe("An array of document type IDs to filter by."),
  area: z.string().optional().describe("The specific area/discipline to filter documents by."),
  dateFilterType: z.enum(['elaborationDate', 'approvalDate']).optional().describe("The date field to filter on."),
  startDate: z.string().optional().describe("The start date for the filter range (YYYY-MM-DD)."),
  endDate: z.string().optional().describe("The end date for the filter range (YYYY-MM-DD)."),
});

// Define the document search tool that the AI can call
const findDocumentsTool = ai.defineTool(
  {
    name: 'findDocumentsTool',
    description: 'Searches and retrieves a list of evidence documents for a specific contract based on given criteria. Use this tool to find evidence to support or contradict the contract rules.',
    inputSchema: findDocumentsToolSchema,
    outputSchema: z.array(z.object({
        id: z.string(),
        code: z.string(),
        description: z.string(),
        textContent: z.string().optional(),
    })),
  },
  async (input) => {
    const user = await getCurrentUser();
    if (!user || !user.tenantId) {
      throw new Error('Usuário não autenticado');
    }
    
    // Call the existing document service to perform the search in the database.
    const documents = await documentService.findByFilters(user.tenantId, {
      search: input.searchQuery,
      contractId: input.contractId,
      documentTypeIds: input.documentTypeIds,
      area: input.area,
      dateFilterType: input.dateFilterType,
      startDate: input.startDate,
      endDate: input.endDate,
    });
    
    // Return a simplified list of documents for the AI to analyze.
    return documents.map(doc => ({
      id: doc.id,
      code: doc.code,
      description: doc.description,
      textContent: doc.currentRevision?.textContent,
    }));
  }
);

// The main input schema for the flow
const IntelligentAnalysisInputSchema = z.object({
  contract: z.any().describe("The main contract object containing rules and base documents."),
  dateRange: z.object({
      from: z.string().optional(),
      to: z.string().optional(),
  }).optional().describe("The date range for filtering evidence documents."),
});
type IntelligentAnalysisInput = z.infer<typeof IntelligentAnalysisInputSchema>;

// Updated output schema with structured findings including page numbers
const IntelligentAnalysisOutputSchema = z.object({
  summary: z.string().describe("A brief, high-level summary of the analysis findings."),
  conformityPoints: z.array(z.string()).describe("A list of points where evidence documents are in compliance with the contract."),
  deviations: z.array(z.object({
    finding: z.string().describe("Description of the specific conflict or deviation found."),
    documentCode: z.string().describe("The code of the document where the deviation was found."),
    documentId: z.string().describe("The ID of the document where the deviation was found."),
    pageNumber: z.number().optional().describe("The page number within the document where the finding was located."),
  })).describe("A structured list of clear conflicts or deviations found between the evidence and the contract."),
  triggeredAlerts: z.array(z.object({
    finding: z.string().describe("Description of the alert, including the keyword found."),
    documentCode: z.string().describe("The code of the document where the alert keyword was found."),
    documentId: z.string().describe("The ID of the document where the alert keyword was found."),
    pageNumber: z.number().optional().describe("The page number within the document where the alert was triggered."),
  })).describe("A structured list of alerts triggered by finding specific 'alertKeywords' in the evidence documents."),
});
export type IntelligentAnalysisOutput = z.infer<typeof IntelligentAnalysisOutputSchema>;


// The exported function that calls the flow.
export async function intelligentAnalysisFlow(input: { contract: Contract; dateRange?: { from?: string; to?: string; } }): Promise<IntelligentAnalysisOutput> {
  return await analysisFlow(input);
}

// The Genkit prompt definition, now with the tool enabled and updated output instructions
const prompt = ai.definePrompt({
  name: 'intelligentAnalysisPrompt',
  model: gemini15Flash,
  tools: [findDocumentsTool],
  input: { schema: IntelligentAnalysisInputSchema },
  output: { schema: IntelligentAnalysisOutputSchema },
  prompt: `
    You are an expert compliance auditor for engineering and construction projects. Your task is to perform a detailed risk analysis by cross-referencing a main contract and its base documents against a set of evidence documents that you will search for using the provided tools.

    **CONTEXT:**
    - **Contract ID:** {{{contract.id}}}
    - **Contract Name:** {{{contract.name}}}
    - **Contract Scope:** {{{contract.scope}}}
    - **Common Risks to Watch For:** {{#if contract.commonRisks}} {{join contract.commonRisks ", "}} {{else}} N/A {{/if}}
    - **Red-Flag Alert Keywords:** {{#if contract.alertKeywords}} {{join contract.alertKeywords ", "}} {{else}} N/A {{/if}}
    - **Date Range for Analysis:** {{#if dateRange.from}}{{dateRange.from}}{{else}}N/A{{/if}} to {{#if dateRange.to}}{{dateRange.to}}{{else}}N/A{{/if}}

    **THE TRUTH (Base Documents):**
    These documents represent the rules and ground truth for the project. Analyze them first to understand what needs to be verified.
    {{#each contract.baseDocuments}}
    - **{{fileName}}:** {{media url=fileLink}}
    {{/each}}
    
    **YOUR TASK:**
    1.  **Understand the Rules:** First, carefully analyze the provided Contract Scope, Risks, Keywords, and Base Documents to understand the project's rules and what you need to verify.
    2.  **Search for Evidence:** Based on your understanding, decide what evidence you need. Use the \`findDocumentsTool\` to search for relevant documents within the specified date range. You MUST provide the \`contractId\` parameter in your tool call, using the Contract ID provided above. You can also search by keywords or filter by area or document type IDs. Be strategic in your searches. The document types to be considered for evidence are: {{#if contract.analysisDocumentTypeIds}}{{join contract.analysisDocumentTypeIds ", "}}{{else}}No specific document types configured{{/if}}.
    3.  **Analyze and Report:** Once you have the evidence from the tool, perform the analysis and generate a report with the following structure. **CRITICAL: For every item in 'deviations' and 'triggeredAlerts', you MUST include the 'documentId', 'documentCode', and the 'pageNumber' from the evidence document where the finding was made. If the page number cannot be determined, omit the field.**
        - **Summary:** A high-level overview of your findings.
        - **Conformity Points:** A list of examples where the evidence you found complies with the contract rules.
        - **Deviations:** A structured list of clear conflicts or rule violations.
        - **Triggered Alerts:** A structured list of instances where a "Red-Flag Alert Keyword" was found.

    Be precise and objective. Your analysis is crucial for risk management.
  `,
});

// The Genkit flow definition
const analysisFlow = ai.defineFlow(
  {
    name: 'analysisFlow',
    inputSchema: IntelligentAnalysisInputSchema,
    outputSchema: IntelligentAnalysisOutputSchema,
  },
  async (input, context) => {
    const { output } = await prompt(input, context);
    if (!output) {
      throw new Error("A IA não conseguiu gerar uma resposta.");
    }
    return output;
  }
);
