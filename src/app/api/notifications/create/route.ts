import { NextRequest, NextResponse } from 'next/server';
import { createUserNotification } from '@/services/notificationService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { title, message, type, targetUserId } = await request.json();
    
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: 'Título, mensagem e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const notification = await createUserNotification({
      title,
      message,
      type,
      userId: targetUserId || currentUser.id,
      tenantId: currentUser.tenantId,
    });
    
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}