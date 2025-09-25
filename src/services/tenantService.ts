'use server';

import { prisma } from '@/lib/prisma';
import type { ITenant as Tenant } from '@/types/ITenant';
import { TenantStatus, TenantPlan } from '@/types';
import { TenantSubscriptionStatus } from '@/types/TenantSubscriptionStatus';
import { GatewayStatus } from '@/types/GatewayStatus';

/**
 * Helper para garantir que retornamos objetos JavaScript puros.
 */
function cleanObject<T>(obj: any): T {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

// Mapeamentos entre enums do Prisma e enums da aplicação
function mapPrismaPlanToApp(plan: string): TenantPlan {
  switch (plan) {
    case 'FREE':
      return TenantPlan.FREE;
    case 'BASIC':
      return TenantPlan.BASIC;
    case 'PREMIUM':
      return TenantPlan.PREMIUM;
    case 'ENTERPRISE':
      return TenantPlan.PROFESSIONAL;
    default:
      return TenantPlan.FREE;
  }
}

function mapPrismaSubscriptionToApp(status: string): TenantSubscriptionStatus {
  switch (status) {
    case 'ACTIVE':
      return TenantSubscriptionStatus.ACTIVE;
    case 'INACTIVE':
      return TenantSubscriptionStatus.INACTIVE;
    case 'CANCELLED':
      return TenantSubscriptionStatus.CANCELLED;
    case 'SUSPENDED':
      // Não existe "Suspenso" em TenantSubscriptionStatus da aplicação, aproximamos para Inativa
      return TenantSubscriptionStatus.INACTIVE;
    default:
      return TenantSubscriptionStatus.INACTIVE;
  }
}

function mapPrismaGatewayToApp(gs: string): GatewayStatus {
  switch (gs) {
    case 'ACTIVE':
      return GatewayStatus.INTEGRATED;
    case 'PENDING':
      return GatewayStatus.PENDENTING_CONFIGURATION;
    case 'ERROR':
      return GatewayStatus.INTEGRATION_ERRO;
    case 'SUSPENDED':
      return GatewayStatus.PENDENTING_CONFIGURATION;
    case 'NOT_APPLICABLE':
    default:
      return GatewayStatus.NOT_APPLICABLE;
  }
}

// Mapeamentos reversos: da aplicação para Prisma
function mapAppPlanToPrisma(plan?: TenantPlan): string {
  if (!plan) return 'FREE';
  switch (plan) {
    case TenantPlan.FREE:
      return 'FREE';
    case TenantPlan.BASIC:
      return 'BASIC';
    case TenantPlan.PROFESSIONAL:
      return 'ENTERPRISE';
    case TenantPlan.PREMIUM:
      return 'PREMIUM';
    default:
      return 'FREE';
  }
}

function mapAppSubscriptionToPrisma(status?: TenantSubscriptionStatus): string {
  if (!status) return 'INACTIVE';
  switch (status) {
    case TenantSubscriptionStatus.ACTIVE:
      return 'ACTIVE';
    case TenantSubscriptionStatus.INACTIVE:
      return 'INACTIVE';
    case TenantSubscriptionStatus.CANCELLED:
      return 'CANCELLED';
    case TenantSubscriptionStatus.PENDING_PAYMENT:
      return 'PENDING';
    default:
      return 'INACTIVE';
  }
}

function mapAppGatewayToPrisma(gs?: GatewayStatus): string {
  if (!gs) return 'NOT_APPLICABLE';
  switch (gs) {
    case GatewayStatus.INTEGRATED:
      return 'ACTIVE';
    case GatewayStatus.PENDENTING_CONFIGURATION:
      return 'PENDING';
    case GatewayStatus.INTEGRATION_ERRO:
      return 'ERROR';
    case GatewayStatus.NOT_APPLICABLE:
    default:
      return 'NOT_APPLICABLE';
  }
}

function mapAppStatusToIsActive(status?: TenantStatus): boolean | undefined {
  if (status === undefined) return undefined;
  return status === TenantStatus.ACTIVE;
}

function toITenant(prismaTenant: any): Tenant {
  return {
    id: prismaTenant.id,
    tenantId: prismaTenant.id,
    name: prismaTenant.name,
    cnpj: prismaTenant.cnpj,
    logoUrl: undefined,
    address: {
      street: prismaTenant.addressStreet,
      number: prismaTenant.addressNumber,
      complement: prismaTenant.addressComplement ?? undefined,
      neighborhood: prismaTenant.addressNeighborhood,
      city: prismaTenant.addressCity,
      state: prismaTenant.addressState,
      zipCode: prismaTenant.addressZipCode,
      country: prismaTenant.addressCountry,
    },
    commercialPhone: prismaTenant.commercialPhone ?? undefined,
    commercialEmail: prismaTenant.commercialEmail ?? undefined,
    plan: mapPrismaPlanToApp(prismaTenant.plan),
    subscriptionStatus: mapPrismaSubscriptionToApp(prismaTenant.subscriptionStatus),
    subscriptionStartDate:
      prismaTenant.subscriptionStartDate?.toISOString?.() ?? String(prismaTenant.subscriptionStartDate),
    nextBillingDate: prismaTenant.nextBillingDate?.toISOString?.() ?? String(prismaTenant.nextBillingDate),
    accountOwner: {
      name: prismaTenant.accountOwnerName,
      email: prismaTenant.accountOwnerEmail,
    },
    paymentGatewayStatus: mapPrismaGatewayToApp(prismaTenant.paymentGatewayStatus),
    createdAt: prismaTenant.createdAt?.toISOString?.() ?? String(prismaTenant.createdAt),
    updatedAt: prismaTenant.updatedAt?.toISOString?.() ?? String(prismaTenant.updatedAt),
  };
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
    });
    
    if (!tenant) {
      return null;
    }
    
    return cleanObject(toITenant(tenant));
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
        isActive: true
      },
      orderBy: { name: 'asc' }
    });

    return cleanObject(tenants.map(toITenant));
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
    const requiredFields = ['name', 'cnpj'];
    const missingFields = requiredFields.filter(field => !data[field as keyof Tenant]);
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios ausentes: ${missingFields.join(', ')}`);
    }
    if (!data.address) {
      throw new Error('Endereço é obrigatório');
    }
    if (!data.accountOwner?.name || !data.accountOwner?.email) {
      throw new Error('Responsável da conta (nome e email) é obrigatório');
    }

    const existingTenant = await prisma.tenant.findUnique({
      where: { cnpj: data.cnpj as string }
    });
    if (existingTenant) {
      throw new Error('Já existe uma empresa cadastrada com este CNPJ');
    }

    const subscriptionStart = data.subscriptionStartDate ? new Date(data.subscriptionStartDate) : new Date();
    const nextBilling = data.nextBillingDate ? new Date(data.nextBillingDate) : new Date(subscriptionStart.getTime() + 30 * 24 * 60 * 60 * 1000);

    const tenant = await prisma.tenant.create({
      data: {
        name: data.name as string,
        cnpj: data.cnpj as string,
        commercialPhone: data.commercialPhone,
        commercialEmail: data.commercialEmail,
        plan: mapAppPlanToPrisma(data.plan) as any,
        subscriptionStatus: mapAppSubscriptionToPrisma(data.subscriptionStatus) as any,
        subscriptionStartDate: subscriptionStart,
        nextBillingDate: nextBilling,
        accountOwnerName: data.accountOwner.name,
        accountOwnerEmail: data.accountOwner.email,
        paymentGatewayStatus: mapAppGatewayToPrisma(data.paymentGatewayStatus) as any,
        addressStreet: data.address.street,
        addressNumber: data.address.number,
        addressComplement: data.address.complement,
        addressNeighborhood: data.address.neighborhood,
        addressCity: data.address.city,
        addressState: data.address.state,
        addressZipCode: data.address.zipCode,
        addressCountry: data.address.country ?? 'Brasil',
        isActive: true,
      }
    });

    console.log('✅ [tenantService] Tenant criado com sucesso:', tenant.id);
    return cleanObject(toITenant(tenant));
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
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!existingTenant) {
      console.warn(`Tenant com ID ${id} não encontrado`);
      return null;
    }

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

    const updateData: any = {
      name: data.name,
      cnpj: data.cnpj,
      commercialPhone: data.commercialPhone,
      commercialEmail: data.commercialEmail,
      plan: data.plan ? (mapAppPlanToPrisma(data.plan) as any) : undefined,
      subscriptionStatus: data.subscriptionStatus ? (mapAppSubscriptionToPrisma(data.subscriptionStatus) as any) : undefined,
      subscriptionStartDate: data.subscriptionStartDate,
      nextBillingDate: data.nextBillingDate,
      paymentGatewayStatus: data.paymentGatewayStatus ? (mapAppGatewayToPrisma(data.paymentGatewayStatus) as any) : undefined,
      accountOwnerName: data.accountOwner?.name,
      accountOwnerEmail: data.accountOwner?.email,
      updatedAt: new Date()
    };

    if (data.address) {
      updateData.addressStreet = data.address.street;
      updateData.addressNumber = data.address.number;
      updateData.addressComplement = data.address.complement;
      updateData.addressNeighborhood = data.address.neighborhood;
      updateData.addressCity = data.address.city;
      updateData.addressState = data.address.state;
      updateData.addressZipCode = data.address.zipCode;
      updateData.addressCountry = data.address.country ?? 'Brasil';
    }

    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData
    });

    console.log('✅ [tenantService] Tenant atualizado com sucesso:', id);
    return cleanObject(toITenant(updatedTenant));
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
    const existingTenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!existingTenant) {
      throw new Error('Empresa não encontrada');
    }

    await prisma.tenant.update({
      where: { id },
      data: {
        isActive: false,
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
      where: { cnpj }
    });
    
    return tenant ? cleanObject(toITenant(tenant)) : null;
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
        isActive: true
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
    const updateData: any = {
      plan: data.plan ? (mapAppPlanToPrisma(data.plan) as any) : undefined,
      subscriptionStartDate: data.subscriptionStartDate,
      nextBillingDate: data.nextBillingDate,
      paymentGatewayStatus: data.paymentGatewayStatus ? (mapAppGatewayToPrisma(data.paymentGatewayStatus as any) as any) : undefined,
      updatedAt: new Date()
    };

    const isActive = mapAppStatusToIsActive(data.status);
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    // Remover undefineds
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData
    });

    console.log('✅ [tenantService] Assinatura do tenant atualizada com sucesso:', id);
    return cleanObject(toITenant(updatedTenant));
  } catch (error) {
    console.error('❌ [tenantService] Erro ao atualizar assinatura do tenant:', error);
    throw error;
  }
}