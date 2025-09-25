
'use server';

import { prisma } from '@/lib/prisma';
import type { IDistributionRule } from '@/types/IDistributionRule';

function cleanObject<T>(obj: any): T {
  // Simplesmente retorna o objeto, as transformações devem ser feitas nos models/virtuals
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Busca todas as regras de distribuição para um tenant e contrato específicos.
 */
export async function findAll(tenantId: string, contractId: string): Promise<IDistributionRule[]> {
  try {
    const rules = await prisma.distributionRule.findMany({
      where: { tenantId, contractId }
    });
    return cleanObject(rules);
  } catch (error) {
    console.error('Erro ao buscar regras de distribuição:', error);
    throw new Error('Falha ao buscar regras de distribuição do banco de dados.');
  }
}

/**
 * Salva um novo conjunto de regras para um tenant/contrato, substituindo as antigas.
 * @param tenantId O ID do tenant.
 * @param contractId O ID do contrato.
 * @param rules Um objeto onde a chave é o userId e o valor é um array de nomes de áreas.
 */
export async function saveRules(tenantId: string, contractId: string, rules: Record<string, string[]>): Promise<void> {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Remove todas as regras existentes para este tenant e contrato
      await tx.distributionRule.deleteMany({
        where: { tenantId, contractId }
      });

      // 2. Cria as novas regras a partir do objeto fornecido
      const newRules = Object.entries(rules)
        .filter(([, areas]) => areas.length > 0)
        .map(([userId, areas]) => ({
          tenantId,
          contractId,
          userId,
          areas,
          createdAt: new Date(),
          updatedAt: new Date()
        }));
      
      if (newRules.length > 0) {
        await tx.distributionRule.createMany({
          data: newRules
        });
      }
    });
  } catch (error) {
    console.error('Erro ao salvar regras de distribuição:', error);
    throw new Error('Falha ao salvar regras de distribuição no banco de dados.');
  }
}
