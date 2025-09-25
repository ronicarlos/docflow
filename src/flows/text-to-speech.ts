
'use server';
/**
 * @fileOverview A flow to convert text to speech.
 */

import {ai} from '@/ai/genkit';
import {gemini15Flash} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

export const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

export const TextToSpeechOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d: any) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

/**
 * Converts text to speech using a direct call to the AI model.
 * This is more efficient than wrapping it in a full Genkit flow for this specific use case.
 * @param input The text to convert.
 * @returns An object containing the audio data URI.
 */
export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  
  TextToSpeechInputSchema.parse(input);

  // Por enquanto, vamos simular a geração de áudio
  // A funcionalidade de TTS com responseModalities ainda não está disponível na versão atual do Genkit
  const response = await ai.generate({
    model: gemini15Flash,
    prompt: `Convert this text to speech description: "${input.text}"`,
  });

  // Simulação de dados de áudio para teste
  // Em uma implementação real, isso seria substituído pela API de TTS
  const mockAudioData = Buffer.from('mock audio data for: ' + input.text);
  const wavBase64 = await toWav(mockAudioData);

  const result = {
    audioDataUri: 'data:audio/wav;base64,' + wavBase64,
  };

  return TextToSpeechOutputSchema.parse(result);
}
