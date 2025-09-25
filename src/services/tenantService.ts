'use server';

import { prisma } from '@/lib/prisma';
import type { Tenant } from '@/types/ITenant';
import { TenantStatus, TenantPlan } from '@/types';

/**
 * Helper para garantir que retornamos objetos JavaScript puros.
 */
function cleanObject<T>(obj: any): T {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Busca um tenant específico pelo seu ID.
 */
export async function findTenantById(id: string): Promise<Tenant | null> {
  if (!id) {
    console.warn(`Tentativa de buscar tenant com ID inválido: ${id}`);
    return null;
  }
  
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        address: true,
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (!tenant) {
      return null;
    }
    
    return cleanObject(tenant);
  } catch (error) {
    console.error(`Erro ao buscar tenant pelo ID ${id}:`, error);
    throw new Error('Falha ao buscar empresa do banco de dados.');
  }
}

/**
 * Busca todos os tenants ativos.
 */
export async function findAllTenants(): Promise<Tenant[]> {
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        status: TenantStatus.ACTIVE
      },
      include: {
        address: true,
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return cleanObject(tenants);
  } catch (error) {
    console.error('Erro ao buscar todos os tenants:', error);
    throw new Error('Falha ao buscar empresas do banco de dados.');
  }
}

/**
 * Cria um novo tenant no banco de dados.
 */
export async function createTenant(data: Partial<Tenant>): Promise<Tenant> {
  console.log('🔍 [tenantService] Iniciando criação de tenant:', {
    name: data.name,
    cnpj: data.cnpj
  });

  try {
    // Validar campos obrigatórios
    const requiredFields = ['name', 'cnpj'];
    const missingFields = requiredFields.filter(field => !data[field as keyof Tenant]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    }

    // Verificar se já existe um tenant com o mesmo CNPJ
    const existingTenant = await prisma.tenant.findUnique({
      where: { cnpj: data.cnpj }
    });

    if (existingTenant) {
      throw new Error('Já existe uma empresa cadastrada com este CNPJ');
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name!,
        cnpj: data.cnpj!,
        commercialPhone: data.commercialPhone,
        commercialEmail: data.commercialEmail,
        logoUrl: data.logoUrl,
        plan: data.plan || TenantPlan.BASIC,
        status: data.status || TenantStatus.ACTIVE,
        subscriptionStartDate: data.subscriptionStartDate || new Date(),
        nextBillingDate: data.nextBillingDate,
        paymentGatewayStatus: data.paymentGatewayStatus || 'pending',
        accountOwnerId: data.accountOwnerId,
        address: data.address ? {
          create: {
            street: data.address.street,
            number: data.address.number,
            complement: data.address.complement,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: data.address.country || 'Brasil'
          }
        } : undefined
      },
      include: {
        address: true,
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ [tenantService] Tenant criado com sucesso:', tenant.id);
    return cleanObject(tenant);
  } catch (error) {
    console.error('❌ [tenantService] Erro ao criar tenant:', error);
    throw error;
  }
}

/**
 * Atualiza um tenant existente no banco de dados.
 */
export async function updateTenant(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
  console.log('🔍 [tenantService] Iniciando atualização de tenant:', {
    id,
    fieldsToUpdate: Object.keys(data)
  });

  try {
    // Verificar se o tenant existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { id },
      include: { address: true }
    });

    if (!existingTenant) {
      console.warn(`Tenant com ID ${id} não encontrado`);
      return null;
    }

    // Verificar CNPJ único se estiver sendo alterado
    if (data.cnpj && data.cnpj !== existingTenant.cnpj) {
      const cnpjExists = await prisma.tenant.findFirst({
        where: {
          cnpj: data.cnpj,
          id: { not: id }
        }
      });

      if (cnpjExists) {
        throw new Error('Já existe uma empresa cadastrada com este CNPJ');
      }
    }

    // Preparar dados para atualização
    const updateData: any = {
      name: data.name,
      cnpj: data.cnpj,
      commercialPhone: data.commercialPhone,
      commercialEmail: data.commercialEmail,
      logoUrl: data.logoUrl,
      plan: data.plan,
      status: data.status,
      subscriptionStartDate: data.subscriptionStartDate,
      nextBillingDate: data.nextBillingDate,
      paymentGatewayStatus: data.paymentGatewayStatus,
      accountOwnerId: data.accountOwnerId
    };

    // Remover campos undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Atualizar endereço se fornecido
    if (data.address) {
      if (existingTenant.address) {
        updateData.address = {
          update: {
            street: data.address.street,
            number: data.address.number,
            complement: data.address.complement,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: data.address.country || 'Brasil'
          }
        };
      } else {
        updateData.address = {
          create: {
            street: data.address.street,
            number: data.address.number,
            complement: data.address.complement,
            neighborhood: data.address.neighborhood,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: data.address.country || 'Brasil'
          }
        };
      }
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      include: {
        address: true,
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ [tenantService] Tenant atualizado com sucesso:', id);
    return cleanObject(updatedTenant);
  } catch (error) {
    console.error('❌ [tenantService] Erro ao atualizar tenant:', error);
    throw error;
  }
}

/**
 * Remove um tenant do banco de dados (soft delete).
 */
export async function deleteTenant(id: string): Promise<void> {
  console.log('🔍 [tenantService] Iniciando remoção de tenant:', id);

  try {
    // Verificar se o tenant existe
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!existingTenant) {
      throw new Error('Empresa não encontrada');
    }

    // Soft delete - marcar como inativo
    await prisma.tenant.update({
      where: { id },
      data: {
        status: TenantStatus.INACTIVE,
        updatedAt: new Date()
      }
    });

    console.log('✅ [tenantService] Tenant removido com sucesso:', id);
  } catch (error) {
    console.error('❌ [tenantService] Erro ao remover tenant:', error);
    throw error;
  }
}

/**
 * Busca tenant por CNPJ.
 */
export async function findTenantByCnpj(cnpj: string): Promise<Tenant | null> {
  if (!cnpj) {
    console.warn('Tentativa de buscar tenant com CNPJ inválido');
    return null;
  }
  
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { cnpj },
      include: {
        address: true,
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return tenant ? cleanObject(tenant) : null;
  } catch (error) {
    console.error(`Erro ao buscar tenant pelo CNPJ ${cnpj}:`, error);
    throw new Error('Falha ao buscar empresa do banco de dados.');
  }
}

/**
 * Conta o número total de tenants ativos.
 */
export async function countTenants(): Promise<number> {
  try {
    return await prisma.tenant.count({
      where: {
        status: TenantStatus.ACTIVE
      }
    });
  } catch (error) {
    console.error('Erro ao contar tenants:', error);
    throw new Error('Falha ao contar empresas do banco de dados.');
  }
}

/**
 * Atualiza o status de assinatura de um tenant.
 */
export async function updateTenantSubscription(
  id: string, 
  data: {
    plan?: TenantPlan;
    status?: TenantStatus;
    subscriptionStartDate?: Date;
    nextBillingDate?: Date;
    paymentGatewayStatus?: string;
  }
): Promise<Tenant | null> {
  console.log('🔍 [tenantService] Atualizando assinatura do tenant:', id);

  try {
    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        plan: data.plan,
        status: data.status,
        subscriptionStartDate: data.subscriptionStartDate,
        nextBillingDate: data.nextBillingDate,
        paymentGatewayStatus: data.paymentGatewayStatus,
        updatedAt: new Date()
      },
      include: {
        address: true,
        accountOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    console.log('✅ [tenantService] Assinatura do tenant atualizada com sucesso:', id);
    return cleanObject(updatedTenant);
  } catch (error) {
    console.error('❌ [tenantService] Erro ao atualizar assinatura do tenant:', error);
    throw error;
  }
}