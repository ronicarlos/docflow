import { NextRequest, NextResponse } from 'next/server';
import { getAllUserNotificationsForCurrentUser } from '@/services/notificationService';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const notifications = await getAllUserNotificationsForCurrentUser(
      currentUser.id, 
      currentUser.tenantId
    );
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Erro ao buscar notificações do usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}