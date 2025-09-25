import { prisma } from '@/lib/prisma';
import type { AiKnowledgeBase } from '@prisma/client';

export class AiKnowledgeBaseService {
  /**
   * Busca a base de conhecimento ativa para um tenant
   */
  static async getActiveKnowledgeBase(tenantId: string): Promise<string> {
    try {
      const knowledgeBase = await prisma.aiKnowledgeBase.findFirst({
        where: {
          tenantId,
          isActive: true,
        },
        orderBy: {
          version: 'desc',
        },
      });

      return knowledgeBase?.content || '';
    } catch (error) {
      console.error('Erro ao buscar base de conhecimento:', error);
      throw new Error('Erro ao buscar base de conhecimento');
    }
  }

  /**
   * Salva uma nova versão da base de conhecimento
   */
  static async saveKnowledgeBase(
    content: string,
    tenantId: string,
    userId: string
  ): Promise<AiKnowledgeBase> {
    try {
      // Desativar versões anteriores
      await prisma.aiKnowledgeBase.updateMany({
        where: {
          tenantId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Obter próxima versão
      const lastVersion = await prisma.aiKnowledgeBase.findFirst({
        where: { tenantId },
        orderBy: { version: 'desc' },
        select: { version: true },
      });

      const nextVersion = (lastVersion?.version || 0) + 1;

      // Criar nova versão
      const newKnowledgeBase = await prisma.aiKnowledgeBase.create({
        data: {
          content,
          version: nextVersion,
          tenantId,
          createdBy: userId,
          isActive: true,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return newKnowledgeBase;
    } catch (error) {
      console.error('Erro ao salvar base de conhecimento:', error);
      throw new Error('Erro ao salvar base de conhecimento');
    }
  }

  /**
   * Lista todas as versões da base de conhecimento
   */
  static async getKnowledgeBaseHistory(tenantId: string): Promise<AiKnowledgeBase[]> {
    try {
      return await prisma.aiKnowledgeBase.findMany({
        where: { tenantId },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          version: 'desc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar histórico da base de conhecimento:', error);
      throw new Error('Erro ao buscar histórico da base de conhecimento');
    }
  }

  /**
   * Ativa uma versão específica da base de conhecimento
   */
  static async activateVersion(
    id: string,
    tenantId: string
  ): Promise<AiKnowledgeBase> {
    try {
      // Desativar todas as versões
      await prisma.aiKnowledgeBase.updateMany({
        where: {
          tenantId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });

      // Ativar a versão específica
      const activatedVersion = await prisma.aiKnowledgeBase.update({
        where: {
          id,
          tenantId, // Garantir que pertence ao tenant
        },
        data: {
          isActive: true,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return activatedVersion;
    } catch (error) {
      console.error('Erro ao ativar versão da base de conhecimento:', error);
      throw new Error('Erro ao ativar versão da base de conhecimento');
    }
  }

  /**
   * Remove uma versão da base de conhecimento (soft delete)
   */
  static async deleteVersion(id: string, tenantId: string): Promise<void> {
    try {
      const knowledgeBase = await prisma.aiKnowledgeBase.findFirst({
        where: {
          id,
          tenantId,
        },
      });

      if (!knowledgeBase) {
        throw new Error('Base de conhecimento não encontrada');
      }

      if (knowledgeBase.isActive) {
        throw new Error('Não é possível excluir a versão ativa');
      }

      await prisma.aiKnowledgeBase.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      console.error('Erro ao excluir versão da base de conhecimento:', error);
      throw error;
    }
  }
}

export const aiKnowledgeBaseService = AiKnowledgeBaseService;