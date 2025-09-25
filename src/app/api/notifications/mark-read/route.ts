import { NextRequest, NextResponse } from 'next/server';
import { markUserNotificationsAsRead } from '@/services/notificationService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { notificationIds } = await request.json();
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json(
        { error: 'IDs de notificação inválidos' },
        { status: 400 }
      );
    }

    await markUserNotificationsAsRead(notificationIds, currentUser.id, currentUser.tenantId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}