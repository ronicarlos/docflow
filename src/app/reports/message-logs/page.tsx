
'use server';

import MessageLogsClient from '@/components/reports/message-logs-client';
import { getCurrentUser } from '@/lib/auth';
import { 
  getAllUserNotificationsForCurrentUser,
  getNotificationMessagesForCurrentTenant,
  getUsersForTenant 
} from '@/services/notificationService';
import { redirect } from 'next/navigation';
import type { NotificationTargetType } from "@/types";

interface CombinedMessageLog {
  userNotificationId: string;
  userId: string;
  userName: string;
  isRead: boolean;
  readAt?: string;
  receivedAt: string;
  messageId: string;
  senderUserId: string;
  senderName: string;
  messageTimestamp: string;
  messageTitle: string;
  messageContentSnippet: string;
  messageTargetType: NotificationTargetType;
}

export default async function MessageLogsPage() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    // Verificar se o usuário tem permissão para acessar relatórios
    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      redirect('/dashboard');
    }

    const tenantId = currentUser.tenantId;

    // Buscar dados do PostgreSQL
    const allUserNotifs = await getAllUserNotificationsForCurrentUser(currentUser.id, tenantId);
    const allMessages = await getNotificationMessagesForCurrentTenant(tenantId);
    const allUsers = await getUsersForTenant(tenantId);

    const usersMap = new Map(allUsers.map(u => [u.id, u.name]));

    const logsWithNulls = allUserNotifs
      .map(un => {
        const message = allMessages.find(m => m.id === un.id && m.tenantId === tenantId);
        if (!message) return null;

        return {
          userNotificationId: un.id,
          userId: un.userId,
          userName: usersMap.get(un.userId) || un.userId,
          isRead: un.isRead,
          readAt: un.readAt,
          receivedAt: un.createdAt.toISOString(),
          messageId: message.id,
          senderUserId: currentUser.id, // Sistema como remetente
          senderName: 'Sistema',
          messageTimestamp: message.createdAt.toISOString(),
          messageTitle: message.title,
          messageContentSnippet: message.content.substring(0, 100) + (message.content.length > 100 ? '...' : ''),
          messageTargetType: 'user' as NotificationTargetType,
        };
      })
      .filter(log => log !== null);

    const logs: CombinedMessageLog[] = logsWithNulls as CombinedMessageLog[];
    logs.sort((a, b) => new Date(b.messageTimestamp).getTime() - new Date(a.messageTimestamp).getTime());

    return (
      <MessageLogsClient initialLogs={logs} />
    );
  } catch (error) {
    console.error('Erro ao carregar logs de mensagens:', error);
    redirect('/dashboard');
  }
}
