
'use server';
/**
 * @fileOverview An AI agent that suggests relevant document types and categories and extracts text content from a file.
 *
 * - suggestDocumentTags - A function that suggests document tags and extracts text based on the document content.
 * - SuggestDocumentTagsInput - The input type for the suggestDocumentTags function.
 * - SuggestDocumentTagsOutput - The return type for the suggestDocumentTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { gemini15Flash } from '@genkit-ai/googleai';

const SuggestDocumentTagsInputSchema = z.object({
  documentContent: z
    .string()
    .describe('A brief description or content of the document to suggest tags for.'),
  imageDataUri: z.string().optional().describe(
    "An optional image of the document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
  documentDataUri: z.string().optional().describe("An optional document (like PDF) to extract text from, as a data URI."),
});
export type SuggestDocumentTagsInput = z.infer<typeof SuggestDocumentTagsInputSchema>;

const SuggestDocumentTagsOutputSchema = z.object({
  suggestedDocumentTypes: z
    .array(z.string())
    .describe('Suggested document types based on the content.'),
  suggestedCategories: z
    .array(z.string())
    .describe('Suggested categories for the document based on the content.'),
  extractedText: z
    .string()
    .optional()
    .describe("The full text content extracted from the provided image or document file."),
});
export type SuggestDocumentTagsOutput = z.infer<typeof SuggestDocumentTagsOutputSchema>;

export async function suggestDocumentTags(input: SuggestDocumentTagsInput): Promise<SuggestDocumentTagsOutput> {
  return suggestDocumentTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestDocumentTagsPrompt',
  model: gemini15Flash,
  input: {schema: SuggestDocumentTagsInputSchema},
  output: {schema: SuggestDocumentTagsOutputSchema},
  prompt: `You are an expert document classifier and text extractor.
  
  Your tasks are:
  1.  **Extract Text**: Fully extract all text from the provided file (image or document). If no file is provided, use the documentContent as the primary text.
  2.  **Classify**: Based on the extracted text and the initial description, suggest relevant document types and categories.

  **Initial Description**: {{{documentContent}}}
  
  {{#if imageDataUri}}
  **Image File to Process**: {{media url=imageDataUri}}
  {{else if documentDataUri}}
  **Document File to Process**: {{media url=documentDataUri}}
  {{/if}}

  Provide the full extracted text in the 'extractedText' field.
  Provide your classification suggestions in the 'suggestedDocumentTypes' and 'suggestedCategories' fields.
  `,
});

const suggestDocumentTagsFlow = ai.defineFlow(
  {
    name: 'suggestDocumentTagsFlow',
    inputSchema: SuggestDocumentTagsInputSchema,
    outputSchema: SuggestDocumentTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
        throw new Error("A IA não conseguiu gerar uma resposta.");
    }
    return output;
  }
);
