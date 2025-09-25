import { NextRequest, NextResponse } from 'next/server';
import { createAiAssistantMessage } from '@/services/aiAssistantService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, context, confidence, tenantId } = body;

    if (!question || !answer || !tenantId) {
      return NextResponse.json(
        { error: 'question, answer e tenantId são obrigatórios' },
        { status: 400 }
      );
    }

    const message = await createAiAssistantMessage({
      question,
      answer,
      context,
      confidence,
      tenantId,
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Erro na API de criação de mensagem do AI Assistant:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}