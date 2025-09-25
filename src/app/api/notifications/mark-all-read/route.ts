import { NextRequest, NextResponse } from 'next/server';
import { markAllUserNotificationsAsRead } from '@/services/notificationService';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await markAllUserNotificationsAsRead(currentUser.id, currentUser.tenantId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}