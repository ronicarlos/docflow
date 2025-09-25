
import { config } from 'dotenv';
config();

import '@/flows/suggest-document-tags.ts';
import '@/flows/help-chat.ts';
import '@/flows/transcribe-audio-memo.ts';
import '@/flows/intelligent-analysis-flow.ts';
import '@/flows/generate-procedure-content.ts';
import '@/flows/text-to-speech.ts';
