
'use server';

import { prisma } from '@/lib/prisma';
import { NotificationType, MessagePriority, DistributionStatus } from '@prisma/client';
import type { Document, User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Dispara notificações para usuários relevantes quando um documento é aprovado.
 * @param document O documento que foi aprovado.
 * @returns A quantidade de notificações enviadas.
 */
export async function notifyRelevantUsers(document: Document): Promise<number> {
  if (document.status !== 'approved') {
    return 0;
  }

  const approver = document.approver;
  if (!approver) {
    console.warn(`Tentativa de notificar para o documento ${document.code} que foi aprovado mas não possui um aprovador definido.`);
    return 0;
  }

  try {
    // Busca usuários do tenant
    const allTenantUsers = await prisma.user.findMany({
      where: {
        tenantId: document.tenantId,
        isActive: true,
      },
      include: {
        accessibleContracts: true,
      },
    });

    // Busca regras de distribuição ativas
    const distributionRules = await prisma.distributionRule.findMany({
      where: {
        tenantId: document.tenantId,
        isActive: true,
      },
    });

    const recipients: User[] = [];

    // Processa regras de distribuição
    distributionRules.forEach(rule => {
      // Parse das condições da regra (JSON)
      const conditions = rule.conditions as any;
      
      // Verifica se a área do documento está nas condições da regra
      if (conditions.areas && conditions.areas.includes(document.area)) {
        const actions = rule.actions as any;
        
        // Se a regra especifica usuários específicos
        if (actions.userIds) {
          actions.userIds.forEach((userId: string) => {
            const user = allTenantUsers.find(u => u.id === userId);
            
            // Garante que o usuário existe, não está já na lista de destinatários e tem acesso ao contrato do documento
            if (user && !recipients.find(r => r.id === user.id)) {
              const canAccessContract = user.role === 'Admin' || 
                user.accessibleContracts.some(ac => ac.contractId === (typeof document.contract === 'string' ? document.contract : document.contract.id));
              
              if (canAccessContract) {
                recipients.push({
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  tenantId: user.tenantId,
                  area: user.area,
                  isActive: user.isActive,
                  createdAt: user.createdAt.toISOString(),
                  updatedAt: user.updatedAt.toISOString(),
                  accessibleContractIds: user.accessibleContracts.map(ac => ac.contractId),
                } as User);
              }
            }
          });
        }
      }
    });

    if (recipients.length === 0) {
      return 0;
    }

    const now = new Date();
    const documentLinkPath = `/documentos/${document.id}`;
    const notificationTitle = `Documento Aprovado: ${document.code}`;
    const notificationContent = `O documento "${document.description.substring(0, 50)}..." (Cód: ${document.code}, Rev: ${document.currentRevision.revisionNumber}, Área: ${document.area}) foi aprovado e está disponível. Acesse em ${documentLinkPath}`;

    // Cria uma mensagem de notificação
    const notificationMessage = await prisma.notificationMessage.create({
      data: {
        title: notificationTitle,
        content: notificationContent,
        type: 'document_approval',
        priority: MessagePriority.NORMAL,
        tenantId: document.tenantId,
      },
    });

    // Cria notificações individuais para cada destinatário
    const userNotifications = recipients.map(recipient => ({
      title: notificationTitle,
      message: notificationContent,
      type: NotificationType.SUCCESS,
      userId: recipient.id,
      tenantId: document.tenantId,
    }));

    await prisma.userNotification.createMany({
      data: userNotifications,
    });

    // Cria logs de distribuição para cada destinatário
    const distributionLogs = recipients.map(recipient => ({
      id: uuidv4(),
      ruleId: distributionRules[0]?.id || 'system-default', // Usa a primeira regra ou um ID padrão
      entityType: 'document',
      entityId: document.id,
      recipientType: 'user',
      recipientId: recipient.id,
      status: DistributionStatus.SENT,
      message: `Notificação do sistema enviada para ${recipient.name} sobre aprovação e distribuição do documento ${document.code}.`,
      sentAt: now.toISOString(),
      tenantId: document.tenantId,
    }));

    await prisma.distributionEventLog.createMany({
      data: distributionLogs,
    });

    // Cria um log de sistema para o evento
    await prisma.systemEventLog.create({
      data: {
        userId: approver.id,
        userName: approver.name,
        userEmail: approver.email || '',
        actionType: 'notifications_sent',
        entityType: 'document',
        entityId: document.id,
        entityDescription: `Documento ${document.code} (Rev: ${document.currentRevision.revisionNumber}) aprovado e distribuído`,
        details: `Notificações de distribuição enviadas para ${recipients.length} usuário(s).`,
        tenantId: document.tenantId,
      },
    });

    return recipients.length;

  } catch (error) {
    console.error('Erro ao notificar usuários relevantes:', error);
    throw new Error('Falha ao enviar notificações de distribuição');
  }
}

/**
 * Busca regras de distribuição para o tenant atual
 */
export async function getDistributionRulesForCurrentTenant(tenantId: string) {
  try {
    return await prisma.distributionRule.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar regras de distribuição:', error);
    throw new Error('Falha ao buscar regras de distribuição');
  }
}

/**
 * Cria uma nova regra de distribuição
 */
export async function createDistributionRule(
  name: string,
  description: string,
  conditions: any,
  actions: any,
  tenantId: string
) {
  try {
    return await prisma.distributionRule.create({
      data: {
        name,
        description,
        conditions,
        actions,
        tenantId,
      },
    });
  } catch (error) {
    console.error('Erro ao criar regra de distribuição:', error);
    throw new Error('Falha ao criar regra de distribuição');
  }
}

/**
 * Atualiza uma regra de distribuição existente
 */
export async function updateDistributionRule(
  ruleId: string,
  name: string,
  description: string,
  conditions: any,
  actions: any,
  tenantId: string
) {
  try {
    return await prisma.distributionRule.update({
      where: {
        id: ruleId,
        tenantId, // Garante que só pode atualizar regras do próprio tenant
      },
      data: {
        name,
        description,
        conditions,
        actions,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar regra de distribuição:', error);
    throw new Error('Falha ao atualizar regra de distribuição');
  }
}

/**
 * Desativa uma regra de distribuição
 */
export async function deactivateDistributionRule(ruleId: string, tenantId: string) {
  try {
    return await prisma.distributionRule.update({
      where: {
        id: ruleId,
        tenantId,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erro ao desativar regra de distribuição:', error);
    throw new Error('Falha ao desativar regra de distribuição');
  }
}

/**
 * Busca logs de eventos de distribuição
 */
export async function getDistributionEventLogs(tenantId: string, limit: number = 100) {
  try {
    return await prisma.distributionEventLog.findMany({
      where: {
        tenantId,
      },
      include: {
        rule: {
          select: {
            name: true,
            description: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('Erro ao buscar logs de distribuição:', error);
    throw new Error('Falha ao buscar logs de distribuição');
  }
}
