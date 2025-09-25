import { eq, and, ilike, or, desc } from 'drizzle-orm';
import { db, contracts, type Contract, type NewContract, type CreateContractData, type UpdateContractData } from '@/lib/db';

export interface ContractFilters {
  tenantId: string;
  status?: 'active' | 'inactive';
  responsibleUserId?: string;
  search?: string;
  expiringInDays?: number;
}

export interface ContractListResponse {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
}

export class ContractDrizzleService {
  /**
   * Buscar todos os contratos com filtros
   */
  static async findAll(tenantId: string, filters?: Partial<ContractFilters>): Promise<Contract[]> {
    try {
      let query = db.select().from(contracts).where(eq(contracts.tenantId, tenantId));

      // Aplicar filtros adicionais
      const conditions = [eq(contracts.tenantId, tenantId)];

      if (filters?.status) {
        conditions.push(eq(contracts.status, filters.status));
      }

      if (filters?.responsibleUserId) {
        conditions.push(eq(contracts.responsibleUserId, filters.responsibleUserId));
      }

      if (filters?.search) {
        const searchCondition = or(
          ilike(contracts.name, `%${filters.search}%`),
          ilike(contracts.internalCode, `%${filters.search}%`),
          ilike(contracts.client, `%${filters.search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      const result = await db
        .select()
        .from(contracts)
        .where(and(...conditions))
        .orderBy(desc(contracts.createdAt));

      return result;
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw new Error('Falha ao buscar contratos');
    }
  }

  /**
   * Buscar contrato por ID
   */
  static async findById(id: string, tenantId: string): Promise<Contract | null> {
    try {
      const result = await db
        .select()
        .from(contracts)
        .where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Erro ao buscar contrato por ID:', error);
      throw new Error('Falha ao buscar contrato');
    }
  }

  /**
   * Criar novo contrato
   */
  static async create(data: CreateContractData): Promise<Contract> {
    console.group('🗄️ [DATABASE SERVICE] create iniciado');
    console.log('📥 Dados recebidos para criação:', JSON.stringify(data, null, 2));
    
    try {
      const newContract: NewContract = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('🔄 Dados preparados para inserção:', JSON.stringify(newContract, null, 2));
      console.log('🔗 Executando query INSERT...');

      const result = await db
        .insert(contracts)
        .values(newContract)
        .returning();

      console.log('✅ Query executada com sucesso');
      console.log('📊 Resultado da inserção:', JSON.stringify(result, null, 2));
      console.log('🆔 ID do contrato criado:', result[0]?.id);

      return result[0];
    } catch (error: any) {
      console.error('💥 ERRO no create do banco:');
      console.error('📝 Mensagem:', error?.message);
      console.error('📚 Stack:', error?.stack);
      console.error('🔍 Erro completo:', error);
      
      // Verificar se é erro de constraint/validação do banco
      if (error?.code) {
        console.error('🏷️ Código do erro:', error.code);
      }
      if (error?.constraint) {
        console.error('🔒 Constraint violada:', error.constraint);
      }
      if (error?.detail) {
        console.error('📋 Detalhes do erro:', error.detail);
      }
      
      throw new Error('Falha ao criar contrato');
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Atualizar contrato
   */
  static async update(id: string, tenantId: string, data: Partial<UpdateContractData>): Promise<Contract | null> {
    console.group('🗄️ [DATABASE SERVICE] update iniciado');
    console.log('🆔 ID do contrato:', id);
    console.log('🏢 Tenant ID:', tenantId);
    console.log('📥 Dados recebidos para atualização:', JSON.stringify(data, null, 2));
    
    try {
      // Remover campos que não devem ser atualizados
      const { id: _, createdAt, ...updateData } = data;
      
      const finalUpdateData = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      };
      
      console.log('🔄 Dados preparados para atualização:', JSON.stringify(finalUpdateData, null, 2));
      console.log('🔍 Condições WHERE: id =', id, 'AND tenantId =', tenantId);
      console.log('🔗 Executando query UPDATE...');
      
      const result = await db
        .update(contracts)
        .set(finalUpdateData)
        .where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)))
        .returning();

      console.log('✅ Query executada com sucesso');
      console.log('📊 Resultado da atualização:', JSON.stringify(result, null, 2));
      console.log('📈 Registros afetados:', result.length);
      
      if (result.length === 0) {
        console.warn('⚠️ Nenhum registro foi atualizado - contrato não encontrado ou não pertence ao tenant');
      } else {
        console.log('🆔 ID do contrato atualizado:', result[0]?.id);
      }

      return result[0] || null;
    } catch (error: any) {
      console.error('💥 ERRO no update do banco:');
      console.error('📝 Mensagem:', error?.message);
      console.error('📚 Stack:', error?.stack);
      console.error('🔍 Erro completo:', error);
      
      // Verificar se é erro de constraint/validação do banco
      if (error?.code) {
        console.error('🏷️ Código do erro:', error.code);
      }
      if (error?.constraint) {
        console.error('🔒 Constraint violada:', error.constraint);
      }
      if (error?.detail) {
        console.error('📋 Detalhes do erro:', error.detail);
      }
      
      throw new Error('Falha ao atualizar contrato');
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Deletar contrato
   */
  static async delete(id: string, tenantId: string): Promise<boolean> {
    try {
      const result = await db
        .delete(contracts)
        .where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)))
        .returning();

      return result.length > 0;
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      throw new Error('Falha ao deletar contrato');
    }
  }

  /**
   * Buscar contratos com paginação
   */
  static async findWithPagination(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    filters?: Partial<ContractFilters>
  ): Promise<ContractListResponse> {
    try {
      const offset = (page - 1) * limit;
      
      const conditions = [eq(contracts.tenantId, tenantId)];

      if (filters?.status) {
        conditions.push(eq(contracts.status, filters.status));
      }

      if (filters?.responsibleUserId) {
        conditions.push(eq(contracts.responsibleUserId, filters.responsibleUserId));
      }

      if (filters?.search) {
        const searchCondition = or(
          ilike(contracts.name, `%${filters.search}%`),
          ilike(contracts.internalCode, `%${filters.search}%`),
          ilike(contracts.client, `%${filters.search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      // Buscar contratos com paginação
      const contractsResult = await db
        .select()
        .from(contracts)
        .where(and(...conditions))
        .orderBy(desc(contracts.createdAt))
        .limit(limit)
        .offset(offset);

      // Contar total de registros
      const totalResult = await db
        .select({ count: contracts.id })
        .from(contracts)
        .where(and(...conditions));

      const total = totalResult.length;

      return {
        contracts: contractsResult,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Erro ao buscar contratos com paginação:', error);
      throw new Error('Falha ao buscar contratos');
    }
  }

  /**
   * Verificar se contrato existe
   */
  static async exists(id: string, tenantId: string): Promise<boolean> {
    try {
      const result = await db
        .select({ id: contracts.id })
        .from(contracts)
        .where(and(eq(contracts.id, id), eq(contracts.tenantId, tenantId)))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('Erro ao verificar existência do contrato:', error);
      return false;
    }
  }
}