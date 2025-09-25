import { prisma } from '@/lib/prisma';
import { NotificationType, MessagePriority } from '@prisma/client';

export interface NotificationMessageData {
  title: string;
  content: string;
  type: string;
  priority?: MessagePriority;
  validUntil?: string;
  tenantId: string;
}

export interface UserNotificationData {
  title: string;
  message: string;
  type?: NotificationType;
  userId: string;
  tenantId: string;
}

export interface NotificationWithMessage {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt: string | null;
  createdAt: Date;
  tenantId: string;
  userId: string;
  relatedDocumentId?: string;
  messageSnapshot: {
    title: string;
    contentSnippet: string;
  };
}

/**
 * Busca notificações não lidas para o usuário atual
 */
export async function getUnreadUserNotificationsForCurrentUser(
  userId: string,
  tenantId: string
): Promise<NotificationWithMessage[]> {
  try {
    const notifications = await prisma.userNotification.findMany({
      where: {
        userId,
        tenantId,
        isRead: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Mapear para o formato esperado com messageSnapshot (aguardando inferência assíncrona)
    const mapped = await Promise.all(
      notifications.map(async (notification) => {
        const relatedDocumentId = await inferDocumentIdFromTitle(notification.title, tenantId);
        return {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: notification.isRead,
          readAt: notification.readAt,
          createdAt: notification.createdAt,
          tenantId: notification.tenantId,
          userId: notification.userId,
          relatedDocumentId,
          messageSnapshot: {
            title: notification.title,
            contentSnippet:
              notification.message.substring(0, 100) +
              (notification.message.length > 100 ? '...' : ''),
          },
        };
      })
    );

    return mapped;
  } catch (error) {
    console.error('Erro ao buscar notificações não lidas:', error);
    throw new Error('Falha ao buscar notificações não lidas');
  }
}

/**
 * Busca todas as notificações para o usuário atual
 */
export async function getAllUserNotificationsForCurrentUser(
  userId: string,
  tenantId: string
): Promise<NotificationWithMessage[]> {
  try {
    const notifications = await prisma.userNotification.findMany({
      where: {
        userId,
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Mapear para o formato esperado com messageSnapshot (aguardando inferência assíncrona)
    const mapped = await Promise.all(
      notifications.map(async (notification) => {
        const relatedDocumentId = await inferDocumentIdFromTitle(notification.title, tenantId);
        return {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          isRead: notification.isRead,
          readAt: notification.readAt,
          createdAt: notification.createdAt,
          tenantId: notification.tenantId,
          userId: notification.userId,
          relatedDocumentId,
          messageSnapshot: {
            title: notification.title,
            contentSnippet:
              notification.message.substring(0, 100) +
              (notification.message.length > 100 ? '...' : ''),
          },
        };
      })
    );

    return mapped;
  } catch (error) {
    console.error('Erro ao buscar todas as notificações:', error);
    throw new Error('Falha ao buscar notificações');
  }
}

/**
 * Busca mensagens de notificação para o tenant atual
 */
export async function getNotificationMessagesForCurrentTenant(tenantId: string) {
  try {
    return await prisma.notificationMessage.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar mensagens de notificação:', error);
    throw new Error('Falha ao buscar mensagens de notificação');
  }
}

/**
 * Marca notificações como lidas
 */
export async function markUserNotificationsAsRead(
  notificationIds: string[],
  userId: string,
  tenantId: string
): Promise<void> {
  try {
    await prisma.userNotification.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
        userId,
        tenantId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    throw new Error('Falha ao marcar notificações como lidas');
  }
}

/**
 * Cria uma nova mensagem de notificação
 */
export async function createNotificationMessage(data: NotificationMessageData) {
  try {
    return await prisma.notificationMessage.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        priority: data.priority || MessagePriority.NORMAL,
        validUntil: data.validUntil,
        tenantId: data.tenantId,
      },
    });
  } catch (error) {
    console.error('Erro ao criar mensagem de notificação:', error);
    throw new Error('Falha ao criar mensagem de notificação');
  }
}

/**
 * Cria uma nova notificação de usuário
 */
export async function createUserNotification(data: UserNotificationData) {
  try {
    return await prisma.userNotification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        userId: data.userId,
        tenantId: data.tenantId,
      },
    });
  } catch (error) {
    console.error('Erro ao criar notificação de usuário:', error);
    throw new Error('Falha ao criar notificação de usuário');
  }
}

/**
 * Cria notificações para múltiplos usuários
 */
export async function createUserNotificationsForMultipleUsers(
  userIds: string[],
  notificationData: Omit<UserNotificationData, 'userId'>
) {
  try {
    const notifications = userIds.map(userId => ({
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || NotificationType.INFO,
      userId,
      tenantId: notificationData.tenantId,
    }));

    return await prisma.userNotification.createMany({
      data: notifications,
    });
  } catch (error) {
    console.error('Erro ao criar notificações para múltiplos usuários:', error);
    throw new Error('Falha ao criar notificações para múltiplos usuários');
  }
}

/**
 * Busca usuários de um tenant
 */
export async function getUsersForTenant(tenantId: string) {
  try {
    return await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar usuários do tenant:', error);
    throw new Error('Falha ao buscar usuários do tenant');
  }
}

/**
 * Função auxiliar para inferir ID do documento a partir do título
 * Mantém a mesma lógica das funções mock
 */
async function inferDocumentIdFromTitle(title: string, tenantId: string): Promise<string | undefined> {
  try {
    let codeFromTitle: string | undefined;
    
    if (title.startsWith("Documento Aprovado: ")) {
      codeFromTitle = title.substring("Documento Aprovado: ".length).split(" - ")[0];
    } else if (title.startsWith("Nova Revisão Aguardando Aprovação: ")) {
      codeFromTitle = title.substring("Nova Revisão Aguardando Aprovação: ".length).split(" - ")[0];
    } else if (title.startsWith("Documento Aguardando Sua Aprovação: ")) {
      codeFromTitle = title.substring("Documento Aguardando Sua Aprovação: ".length);
    }
    
    if (codeFromTitle) {
      const document = await prisma.document.findFirst({
        where: {
          tenantId,
          code: codeFromTitle,
          isDeleted: false,
        },
        select: {
          id: true,
        },
      });
      
      return document?.id;
    }
    
    return undefined;
  } catch (error) {
    console.error('Erro ao inferir ID do documento:', error);
    return undefined;
  }
}

/**
 * Conta notificações não lidas para um usuário
 */
export async function getUnreadNotificationCount(userId: string, tenantId: string): Promise<number> {
  try {
    return await prisma.userNotification.count({
      where: {
        userId,
        tenantId,
        isRead: false,
      },
    });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }
}

/**
 * Deleta uma notificação de usuário
 */
export async function deleteUserNotification(notificationId: string): Promise<void> {
  try {
    await prisma.userNotification.delete({
      where: { id: notificationId },
    });
  } catch (error) {
    console.error('Erro ao deletar notificação de usuário:', error);
    throw new Error('Falha ao deletar notificação de usuário');
  }
}

/**
 * Marca todas as notificações de um usuário como lidas
 */
export async function markAllUserNotificationsAsRead(
  userId: string,
  tenantId: string
): Promise<void> {
  try {
    await prisma.userNotification.updateMany({
      where: {
        userId,
        tenantId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    throw new Error('Falha ao marcar todas as notificações como lidas');
  }
}

/**
 * Conta notificações não lidas para um usuário
 */
export async function getUnreadUserNotificationsCount(userId: string, tenantId?: string): Promise<number> {
  try {
    const whereClause: any = {
      userId,
      isRead: false,
    };
    
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    
    return await prisma.userNotification.count({
      where: whereClause,
    });
  } catch (error) {
    console.error('Erro ao contar notificações não lidas:', error);
    return 0;
  }
}