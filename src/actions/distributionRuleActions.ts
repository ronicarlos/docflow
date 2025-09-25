
'use server';

import * as distributionRuleService from '@/services/distributionRuleService';
import { getCurrentUser } from '@/lib/auth';
import type { IDistributionRule } from '@/types/IDistributionRule';

export async function getDistributionRules(contractId: string): Promise<IDistributionRule[]> {
    const user = await getCurrentUser();
    const tenantId = user?.tenantId;
    
    if (!contractId || !tenantId) {
        return [];
    }
    const rules = await distributionRuleService.findAll(tenantId, contractId);
    return rules;
}

export async function saveDistributionRules(contractId: string, rules: Record<string, string[]>) {
  try {
    if (!contractId) {
        throw new Error("ID do contrato é obrigatório para salvar as regras.");
    }
    
    const user = await getCurrentUser();
    const tenantId = user?.tenantId;
    
    if (!tenantId) {
        throw new Error("Usuário não autenticado ou sem tenant válido.");
    }
    
    await distributionRuleService.saveRules(tenantId, contractId, rules);
    
    return { 
        success: true, 
        message: 'Regras de distribuição salvas com sucesso para o contrato selecionado.', 
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao salvar as regras de distribuição.';
    return { success: false, message: errorMessage };
  }
}
