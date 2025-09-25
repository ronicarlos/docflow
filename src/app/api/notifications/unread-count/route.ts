import { NextRequest, NextResponse } from 'next/server';
import { getUnreadUserNotificationsCount } from '@/services/notificationService';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const count = await getUnreadUserNotificationsCount(currentUser.id);
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Erro ao buscar contagem de notificações não lidas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}