
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
    // O modelo Prisma DistributionRule não possui o campo contractId.
    // Retornamos uma lista vazia temporariamente até alinharmos o armazenamento de regras por contrato.
    return [];
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
    // O modelo Prisma DistributionRule atual não possui os campos necessários (contractId, userId, areas).
    // Implementação temporária: não persiste nada. Será ajustado em tarefa futura para armazenar em estrutura adequada.
    // Mantemos a assinatura para não quebrar chamadas existentes.
    return;
  } catch (error) {
    console.error('Erro ao salvar regras de distribuição:', error);
    throw new Error('Falha ao salvar regras de distribuição no banco de dados.');
  }
}
