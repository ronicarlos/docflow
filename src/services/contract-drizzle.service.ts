import { prisma } from '@/lib/prisma';
import type { Contract, CreateContractData, UpdateContractData, ContractListResponse } from '@/types/Contract';

export interface ContractFilters {
  tenantId: string;
  status?: 'active' | 'inactive';
  responsibleUserId?: string | null;
  search?: string;
  expiringInDays?: number;
}

export class ContractDrizzleService {
  static async findAll(tenantId: string, filters?: Partial<ContractFilters>): Promise<Contract[]> {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.responsibleUserId) where.responsibleUserId = filters.responsibleUserId;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { internalCode: { contains: filters.search, mode: 'insensitive' } },
        { client: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const result = await prisma.contract.findMany({ where, orderBy: { createdAt: 'desc' } });
    return result as unknown as Contract[];
  }

  static async findById(id: string, tenantId: string): Promise<Contract | null> {
    const result = await prisma.contract.findFirst({ where: { id, tenantId } });
    return (result as unknown as Contract) || null;
  }

  static async create(data: CreateContractData): Promise<Contract> {
    const created = await prisma.contract.create({ data: {
      ...data,
      // createdAt/updatedAt são gerenciados pelo Prisma (default/updatedAt)
    } as any });
    return created as unknown as Contract;
  }

  static async update(id: string, tenantId: string, data: Partial<UpdateContractData>): Promise<Contract | null> {
    const exists = await prisma.contract.findFirst({ where: { id, tenantId } });
    if (!exists) return null;
    const updated = await prisma.contract.update({ where: { id }, data: {
      ...data,
      // updatedAt é gerenciado automaticamente por @updatedAt
    } as any });
    return updated as unknown as Contract;
  }

  static async delete(id: string, tenantId: string): Promise<boolean> {
    const exists = await prisma.contract.findFirst({ where: { id, tenantId } });
    if (!exists) return false;
    await prisma.contract.delete({ where: { id } });
    return true;
  }

  static async findWithPagination(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: Partial<ContractFilters>
  ): Promise<ContractListResponse> {
    const skip = (page - 1) * limit;
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.responsibleUserId) where.responsibleUserId = filters.responsibleUserId;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { internalCode: { contains: filters.search, mode: 'insensitive' } },
        { client: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.contract.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.contract.count({ where }),
    ]);

    return {
      contracts: items as unknown as Contract[],
      total,
      page,
      limit,
    };
  }

  static async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await prisma.contract.count({ where: { id, tenantId } });
    return count > 0;
  }
}