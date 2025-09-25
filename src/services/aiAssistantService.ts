'use server';

import { prisma } from '@/lib/prisma';
import type { AiAssistantMessage } from '@prisma/client';

export interface CreateAiAssistantMessageData {
  question: string;
  answer: string;
  context?: string;
  confidence?: number;
  tenantId: string;
}

export interface UpdateAiAssistantMessageData {
  isHelpful?: boolean;
}

/**
 * Cria uma nova mensagem do AI Assistant
 */
export async function createAiAssistantMessage(data: CreateAiAssistantMessageData): Promise<AiAssistantMessage> {
  try {
    const message = await prisma.aiAssistantMessage.create({
      data: {
        question: data.question,
        answer: data.answer,
        context: data.context,
        confidence: data.confidence,
        tenantId: data.tenantId,
      },
    });

    return message;
  } catch (error) {
    console.error('Erro ao criar mensagem do AI Assistant:', error);
    throw new Error('Falha ao salvar mensagem do AI Assistant');
  }
}

/**
 * Busca o histórico de mensagens do AI Assistant por tenant
 */
export async function getAiAssistantHistory(tenantId: string, limit: number = 50): Promise<AiAssistantMessage[]> {
  try {
    const messages = await prisma.aiAssistantMessage.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return messages;
  } catch (error) {
    console.error('Erro ao buscar histórico do AI Assistant:', error);
    throw new Error('Falha ao carregar histórico do AI Assistant');
  }
}

/**
 * Atualiza uma mensagem do AI Assistant (ex: feedback de utilidade)
 */
export async function updateAiAssistantMessage(
  id: string, 
  data: UpdateAiAssistantMessageData
): Promise<AiAssistantMessage | null> {
  try {
    const message = await prisma.aiAssistantMessage.update({
      where: { id },
      data,
    });

    return message;
  } catch (error) {
    console.error('Erro ao atualizar mensagem do AI Assistant:', error);
    throw new Error('Falha ao atualizar mensagem do AI Assistant');
  }
}

/**
 * Busca uma mensagem específica do AI Assistant
 */
export async function getAiAssistantMessage(id: string): Promise<AiAssistantMessage | null> {
  try {
    const message = await prisma.aiAssistantMessage.findUnique({
      where: { id },
    });

    return message;
  } catch (error) {
    console.error('Erro ao buscar mensagem do AI Assistant:', error);
    throw new Error('Falha ao carregar mensagem do AI Assistant');
  }
}

/**
 * Remove mensagens antigas do AI Assistant (limpeza de dados)
 */
export async function cleanupOldAiAssistantMessages(tenantId: string, daysOld: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await prisma.aiAssistantMessage.deleteMany({
      where: {
        tenantId,
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    return result.count;
  } catch (error) {
    console.error('Erro ao limpar mensagens antigas do AI Assistant:', error);
    throw new Error('Falha ao limpar mensagens antigas do AI Assistant');
  }
}