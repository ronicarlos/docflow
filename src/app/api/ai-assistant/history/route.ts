import { NextRequest, NextResponse } from 'next/server';
import { getAiAssistantHistory } from '@/services/aiAssistantService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const limitParam = searchParams.get('limit');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId é obrigatório' },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'limit deve ser um número entre 1 e 100' },
        { status: 400 }
      );
    }

    const history = await getAiAssistantHistory(tenantId, limit);
    
    return NextResponse.json(history);
  } catch (error) {
    console.error('Erro na API de histórico do AI Assistant:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}