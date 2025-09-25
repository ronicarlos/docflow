import { NextRequest, NextResponse } from 'next/server';
import { helpChat } from '@/flows/help-chat';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await helpChat({
      question: body?.question || '',
      pageContext: body?.pageContext || '',
      imageDataUri: body?.imageDataUri,
      audioDataUri: body?.audioDataUri,
      documentDataUri: body?.documentDataUri,
      tenantId: user.tenantId,
    });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Erro em /api/ai/help-chat:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}