import { NextRequest, NextResponse } from 'next/server';
import { updateAiAssistantMessage, getAiAssistantMessage } from '@/services/aiAssistantService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da mensagem é obrigatório' },
        { status: 400 }
      );
    }

    const message = await getAiAssistantMessage(id);

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erro na API de busca de mensagem do AI Assistant:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { isHelpful } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID da mensagem é obrigatório' },
        { status: 400 }
      );
    }

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'isHelpful deve ser um valor booleano' },
        { status: 400 }
      );
    }

    const updatedMessage = await updateAiAssistantMessage(id, { isHelpful });

    if (!updatedMessage) {
      return NextResponse.json(
        { error: 'Mensagem não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error('Erro na API de atualização de mensagem do AI Assistant:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}