
'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';
import { contractValidationSchema, updateContractSchema, type ContractValidationData, type UpdateContractData } from '@/lib/validations/contract';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { z } from 'zod';
import type { Contract } from '@/types/Contract';

export async function createContract(data: ContractValidationData) {
  console.group('🔧 [SERVER ACTION] createContract iniciado');
  console.log('📥 Dados recebidos:', JSON.stringify(data, null, 2));
  
  try {
    console.log('👤 Obtendo usuário atual...');
    const user = await getCurrentUser();
    console.log('👤 Usuário obtido:', user ? { id: user.id, tenantId: user.tenantId } : 'Nenhum');
    
    if (!user || !user.tenantId) {
      console.error('❌ Usuário não autenticado ou sem tenant');
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    console.log('🔍 Validando dados com schema...');
    const validatedData = contractValidationSchema.parse(data);
    console.log('✅ Dados validados:', JSON.stringify(validatedData, null, 2));
    
    // Converter datas para ISO string se necessário
    console.log('📅 Processando datas...');
    // Normalizar responsibleUserId para null quando vazio ou 'none'
    const normalizedResponsibleUserId =
      validatedData.responsibleUserId && validatedData.responsibleUserId !== 'none' && validatedData.responsibleUserId.trim() !== ''
        ? validatedData.responsibleUserId
        : null;
    const processedData = {
      ...validatedData,
      responsibleUserId: normalizedResponsibleUserId,
      startDate: new Date(validatedData.startDate).toISOString(),
      endDate: new Date(validatedData.endDate).toISOString(),
      tenantId: user.tenantId,
      // Corrigido: usar createdById para alinhar com a coluna do banco
      createdById: user.id,
    };
    console.log('🔄 Dados processados finais:', JSON.stringify(processedData, null, 2));

    console.log('💾 Salvando no banco de dados...');
    const result = await ContractDrizzleService.create(processedData);
    console.log('💾 Resultado do banco:', result);

    console.log('🔄 Revalidando cache...');
    revalidatePath('/contracts');
    
    console.log('✅ Contrato criado com sucesso!');
    return { success: true, message: 'Contrato criado com sucesso!' };
  } catch (error: any) {
    console.error('💥 ERRO na createContract:');
    console.error('📝 Mensagem:', error?.message);
    console.error('📚 Stack:', error?.stack);
    console.error('🔍 Erro completo:', error);
    
    if (error instanceof z.ZodError) {
      console.error('🚫 Erro de validação Zod:', error.errors);
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao criar contrato.';
    return { success: false, message: errorMessage };
  } finally {
    console.groupEnd();
  }
}

export async function updateContract(id: string, data: UpdateContractData) {
  console.group('🔧 [SERVER ACTION] updateContract iniciado')
  console.log('🆔 ID do contrato:', id)
  console.log('📥 Dados recebidos:', JSON.stringify(data, null, 2))
  
  try {
    console.log('👤 Obtendo usuário atual...')
    const user = await getCurrentUser()
    console.log('👤 Usuário obtido:', user ? { id: user.id, tenantId: user.tenantId } : 'Nenhum')
    
    if (!user || !user.tenantId) {
      console.error('❌ Usuário não autenticado ou sem tenant')
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' }
    }

    if (!id) {
      console.error('❌ ID do contrato não fornecido')
      return { success: false, message: 'ID do contrato é obrigatório.' }
    }

    console.log('🔍 Validando dados com schema...')
    const validatedData = updateContractSchema.parse(data)
    console.log('✅ Dados validados:', JSON.stringify(validatedData, null, 2))
    
    // Converter datas para ISO string se necessário
    console.log('📅 Processando datas...')
    // Normalizar responsibleUserId para null quando vazio ou 'none'
    const normalizedResponsibleUserIdUpdate =
      validatedData.responsibleUserId && validatedData.responsibleUserId !== 'none' && validatedData.responsibleUserId.trim() !== ''
        ? validatedData.responsibleUserId
        : null
    const processedData = {
      ...validatedData,
      responsibleUserId: normalizedResponsibleUserIdUpdate,
      startDate: validatedData.startDate ? new Date(validatedData.startDate).toISOString() : undefined,
      endDate: validatedData.endDate ? new Date(validatedData.endDate).toISOString() : undefined,
      tenantId: user.tenantId,
      // Removido: updatedBy não existe na tabela contracts
    }
    console.log('🔄 Dados processados finais:', JSON.stringify(processedData, null, 2))

    console.log('💾 Atualizando no banco de dados...')
    const result = await ContractDrizzleService.update(id, user.tenantId, processedData)
    console.log('💾 Resultado do banco:', result)

    console.log('🔄 Revalidando cache...')
    revalidatePath('/contracts')
    
    console.log('✅ Contrato atualizado com sucesso!')
    return { success: true, message: 'Contrato atualizado com sucesso!' }
  } catch (error: any) {
    console.error('💥 ERRO na updateContract:')
    console.error('📝 Mensagem:', error?.message)
    console.error('📚 Stack:', error?.stack)
    console.error('🔍 Erro completo:', error)
    
    if (error instanceof z.ZodError) {
      console.error('🚫 Erro de validação Zod:', error.errors)
      return { success: false, message: 'Dados inválidos.', errors: error.errors }
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar contrato.'
    return { success: false, message: errorMessage }
  } finally {
    console.groupEnd()
  }
}

export async function deleteContract(id: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    if (!id) {
      return { success: false, message: 'ID do contrato é obrigatório.' };
    }

    await ContractDrizzleService.delete(id, user.tenantId);
    
    revalidatePath('/contracts');
    return { success: true, message: 'Contrato excluído com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir contrato.';
    return { success: false, message: errorMessage };
  }
}

export async function getAllContracts() {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    const contracts = await ContractDrizzleService.findAll(user.tenantId);
    
    return { success: true, data: contracts };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao buscar contratos.';
    return { success: false, message: errorMessage };
  }
}

export async function getContract(id: string) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    if (!id) {
      return { success: false, message: 'ID do contrato é obrigatório.' };
    }

    const contract = await ContractDrizzleService.findById(id, user.tenantId);
    
    if (!contract) {
      return { success: false, message: 'Contrato não encontrado.' };
    }
    
    return { success: true, data: contract };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao buscar contrato.';
    return { success: false, message: errorMessage };
  }
}

// Nova ação para busca paginada de contratos com filtros
export async function getContracts(filters: any = {}, page: number = 1, limit: number = 10) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    const result = await ContractDrizzleService.findWithPagination(user.tenantId, page, limit, filters);
    return { success: true, data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao buscar contratos.';
    return { success: false, message: errorMessage };
  }
}
