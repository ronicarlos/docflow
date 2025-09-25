import { NextRequest, NextResponse } from 'next/server';
import { textToSpeech } from '@/flows/text-to-speech';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await textToSpeech({ text: String(body?.text || '') });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro em /api/ai/text-to-speech:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}