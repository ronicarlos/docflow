
'use server';

import { prisma } from '@/lib/prisma';
import type { User } from '@/types/User';
import { UserRole } from '@prisma/client';

/**
 * Helper para garantir que retornamos objetos JavaScript puros.
 */
function cleanObject<T>(obj: any): T {
  if (!obj) return obj;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Busca todos os usuários para um tenant específico.
 */
export async function findAllUsers(tenantId?: string): Promise<User[]> {
  try {
    const whereClause = tenantId ? { tenantId } : {};
    
    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        accessibleContracts: {
          select: {
            contractId: true
          }
        }
      }
    });

    const usersWithAccessibleContracts = users.map(user => {
      const { accessibleContracts, ...cleanUser } = user;
      return {
        ...cleanUser,
        accessibleContractIds: accessibleContracts?.map(ac => ac.contractId) || []
      };
    });
    
    return cleanObject(usersWithAccessibleContracts);
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    throw new Error('Falha ao buscar usuários do banco de dados.');
  }
}

/**
 * Busca um usuário específico pelo seu ID.
 */
export async function findUserById(id: string): Promise<User | null> {
  if (!id) {
    console.warn(`Tentativa de buscar usuário com ID inválido: ${id}`);
    return null;
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        accessibleContracts: {
          select: {
            contractId: true
          }
        }
      }
    });
    
    if (!user) {
      return null;
    }

    const { accessibleContracts, ...cleanUser } = user;
    const userWithAccessibleContracts = {
      ...cleanUser,
      accessibleContractIds: accessibleContracts?.map(ac => ac.contractId) || []
    };
    
    return cleanObject(userWithAccessibleContracts);
  } catch (error) {
    console.error(`Erro ao buscar usuário pelo ID ${id}:`, error);
    throw new Error('Falha ao buscar usuário do banco de dados.');
  }
}

/**
 * Cria um novo usuário no banco de dados.
 */
export async function create(data: Partial<User>): Promise<User> {
  console.log('🔍 [userService] Iniciando criação de usuário:', {
    email: data.email,
    name: data.name,
    tenantId: data.tenantId
  });

  try {
    // Validar campos obrigatórios
    const requiredFields = ['name', 'email', 'area', 'tenantId'];
    const missingFields = requiredFields.filter(field => !data[field as keyof User]);
    
    if (missingFields.length > 0) {
      throw new Error(`Campos obrigatórios não fornecidos: ${missingFields.join(', ')}`);
    }

    // Verificar se o tenant existe
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId! }
    });

    if (!tenant) {
      throw new Error('Tenant não encontrado.');
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email! }
    });

    if (existingUser) {
      throw new Error('Já existe um usuário com este email.');
    }

    // Extrair accessibleContractIds e disciplineIds para gerenciar separadamente
    const { accessibleContractIds, disciplineIds, ...userData } = data;

    // Preparar dados para criação
    const createData = {
      name: userData.name!,
      email: userData.email!,
      area: userData.area!,
      role: (userData.role as UserRole) || UserRole.Viewer,
      tenantId: userData.tenantId!,
      password: userData.password || '123456',
      canCreateRecords: userData.canCreateRecords || false,
      canEditRecords: userData.canEditRecords || false,
      canDeleteRecords: userData.canDeleteRecords || false,
      canDownloadDocuments: userData.canDownloadDocuments !== undefined ? userData.canDownloadDocuments : true,
      canApproveDocuments: userData.canApproveDocuments || false,
      canPrintDocuments: userData.canPrintDocuments !== undefined ? userData.canPrintDocuments : true,
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      avatarUrl: userData.avatarUrl || null
    };

    console.log('🔍 [userService] Criando usuário no banco...');
    
    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      // Criar o usuário
      const newUser = await tx.user.create({
        data: createData
      });

      // Gerenciar contratos acessíveis se fornecidos
        if (accessibleContractIds && accessibleContractIds.length > 0) {
          console.log('🔍 [userService] Criando associações de contratos...');
          
          // Verificar se todos os contratos existem
          const contracts = await tx.contract.findMany({
            where: {
              id: { in: accessibleContractIds },
              tenantId: userData.tenantId!
            }
          });

          if (contracts.length !== accessibleContractIds.length) {
            throw new Error('Um ou mais contratos não foram encontrados.');
          }

          // Criar as associações
          const contractAssociations = accessibleContractIds.map(contractId => ({
            userId: newUser.id,
            contractId: contractId
          }));

          await tx.userContractAccess.createMany({
            data: contractAssociations
          });
        }

        // Gerenciar disciplinas se fornecidas
        if (disciplineIds && disciplineIds.length > 0) {
          console.log('🔍 [userService] Criando associações de disciplinas...');
          
          // Verificar se todas as disciplinas existem
          const disciplines = await tx.discipline.findMany({
            where: {
              id: { in: disciplineIds },
              tenantId: userData.tenantId!
            }
          });

          if (disciplines.length !== disciplineIds.length) {
            throw new Error('Uma ou mais disciplinas não foram encontradas.');
          }

          // Criar as associações (assumindo que existe uma tabela de relacionamento)
          const disciplineAssociations = disciplineIds.map(disciplineId => ({
            userId: newUser.id,
            disciplineId: disciplineId
          }));

          // Nota: Assumindo que existe uma tabela UserDisciplineAccess
          // Se não existir, você precisará criar a migração primeiro
          try {
            await tx.userDisciplineAccess.createMany({
              data: disciplineAssociations
            });
          } catch (error) {
            console.warn('⚠️ [userService] Tabela UserDisciplineAccess não encontrada, ignorando disciplinas...');
          }
        }

      return newUser;
    });
    
    console.log('✅ [userService] Usuário criado com sucesso:', result.id);
    return cleanObject(result);
    
  } catch (error: any) {
    console.error('❌ [userService] Erro ao criar usuário:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    });
    
    // Tratar erros específicos do Prisma
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'email';
      throw new Error(`Já existe um usuário com este ${field}.`);
    }
    
    if (error.code === 'P2003') {
      throw new Error('Referência inválida. Verifique se o tenant existe.');
    }

    if (error.code === 'P1001') {
      throw new Error('Não foi possível conectar ao banco de dados.');
    }
    
    throw new Error(error.message || 'Falha ao criar usuário.');
  }
}

/**
 * Atualiza um usuário existente no banco de dados.
 */
export async function update(id: string, data: Partial<User>): Promise<User | null> {
  try {
    console.log('🚀 [userService] Iniciando atualização do usuário:', { id, data });

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      console.error('❌ [userService] Usuário não encontrado:', id);
      throw new Error('Usuário não encontrado');
    }

    console.log('✅ [userService] Usuário encontrado:', existingUser.name);

    // Verificar se o email já está em uso por outro usuário
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
          tenantId: existingUser.tenantId
        }
      });

      if (emailExists) {
        console.error('❌ [userService] Email já está em uso:', data.email);
        throw new Error('Este email já está sendo usado por outro usuário');
      }
    }

    // Extrair arrays de IDs
    const { accessibleContractIds, disciplineIds, ...userData } = data;
    
    console.log('📋 [userService] Dados extraídos:', {
      userData,
      accessibleContractIds,
      disciplineIds
    });

    // Usar transação para garantir consistência
    const result = await prisma.$transaction(async (tx) => {
      console.log('🔄 [userService] Iniciando transação...');
      
      // Atualizar o usuário
      const updatedUser = await tx.user.update({
        where: { id },
        data: {
          ...userData,
          updatedAt: new Date()
        }
      });

      console.log('✅ [userService] Usuário atualizado:', updatedUser.name);

      // Gerenciar contratos acessíveis se fornecidos
      if (accessibleContractIds !== undefined) {
        console.log('🔍 [userService] Atualizando associações de contratos...', {
          contractIds: accessibleContractIds,
          count: accessibleContractIds.length
        });

        // Remover todas as associações existentes
        const deletedAssociations = await tx.userContractAccess.deleteMany({
          where: { userId: id }
        });
        
        console.log('🗑️ [userService] Associações removidas:', deletedAssociations.count);

        // Criar novas associações se houver contratos
        if (accessibleContractIds.length > 0) {
          console.log('🔍 [userService] Verificando existência dos contratos...');
          
          // Verificar se todos os contratos existem
          const contracts = await tx.contract.findMany({
            where: {
              id: { in: accessibleContractIds },
              tenantId: existingUser.tenantId
            }
          });

          console.log('📊 [userService] Contratos encontrados:', {
            solicitados: accessibleContractIds.length,
            encontrados: contracts.length,
            contractsIds: contracts.map(c => c.id)
          });

          if (contracts.length !== accessibleContractIds.length) {
            const foundIds = contracts.map(c => c.id);
            const missingIds = accessibleContractIds.filter(id => !foundIds.includes(id));
            console.error('❌ [userService] Contratos não encontrados:', missingIds);
            throw new Error(`Contratos não encontrados: ${missingIds.join(', ')}`);
          }

          const contractAssociations = accessibleContractIds.map(contractId => ({
            userId: id,
            contractId: contractId
          }));

          console.log('📝 [userService] Criando associações:', contractAssociations);

          const createdAssociations = await tx.userContractAccess.createMany({
            data: contractAssociations
          });
          
          console.log('✅ [userService] Associações de contratos criadas:', createdAssociations.count);
        } else {
          console.log('ℹ️ [userService] Nenhum contrato para associar');
        }
      }

      // Gerenciar disciplinas se fornecidas
      if (disciplineIds !== undefined) {
        console.log('🔍 [userService] Atualizando associações de disciplinas...');

        // Remover todas as associações existentes (se a tabela existir)
        try {
          await tx.userDisciplineAccess.deleteMany({
            where: { userId: id }
          });

          // Criar novas associações se houver disciplinas
          if (disciplineIds.length > 0) {
            // Verificar se todas as disciplinas existem
            const disciplines = await tx.discipline.findMany({
              where: {
                id: { in: disciplineIds },
                tenantId: existingUser.tenantId
              }
            });

            if (disciplines.length !== disciplineIds.length) {
              throw new Error('Uma ou mais disciplinas não foram encontradas.');
            }

            const disciplineAssociations = disciplineIds.map(disciplineId => ({
              userId: id,
              disciplineId: disciplineId
            }));

            await tx.userDisciplineAccess.createMany({
              data: disciplineAssociations
            });
          }
        } catch (error) {
          console.warn('⚠️ [userService] Tabela UserDisciplineAccess não encontrada, ignorando disciplinas...');
        }
      }

      return updatedUser;
    });
    
    console.log('✅ [userService] Usuário atualizado com sucesso:', id);
    return cleanObject(result);
    
  } catch (error: any) {
    console.error('❌ [userService] Erro ao atualizar usuário:', {
      id,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'P2025') {
      return null; // Usuário não encontrado
    }
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'email';
      throw new Error(`Já existe um usuário com este ${field}.`);
    }
    
    throw new Error(error.message || 'Falha ao atualizar usuário.');
  }
}

/**
 * Remove um usuário do banco de dados.
 */
export async function remove(id: string): Promise<void> {
  console.log('🔍 [userService] Iniciando remoção de usuário:', id);

  try {
    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      throw new Error('Usuário não encontrado.');
    }

    // Usar transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      // Remover associações de contratos primeiro
      await tx.userContractAccess.deleteMany({
        where: { userId: id }
      });

      // Remover o usuário
      await tx.user.delete({
        where: { id }
      });
    });
    
    console.log('✅ [userService] Usuário removido com sucesso:', id);
    
  } catch (error: any) {
    console.error('❌ [userService] Erro ao remover usuário:', {
      id,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'P2025') {
      throw new Error('Usuário não encontrado.');
    }
    
    throw new Error(error.message || 'Falha ao remover usuário.');
  }
}

/**
 * Busca usuários por email (para validação de duplicidade).
 */
export async function findUserByEmail(email: string, tenantId?: string): Promise<User | null> {
  try {
    const whereClause: any = { email };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    const user = await prisma.user.findUnique({
      where: whereClause
    });
    
    return user ? cleanObject(user) : null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw new Error('Falha ao buscar usuário por email.');
  }
}

/**
 * Atualiza o perfil do usuário (informações básicas).
 */
export async function updateUserProfile(
  id: string, 
  data: {
    name?: string;
    email?: string;
    area?: string;
    avatarUrl?: string;
  }
): Promise<User | null> {
  try {
    console.log('🚀 [userService] Iniciando atualização do perfil:', { id, data });

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      console.error('❌ [userService] Usuário não encontrado:', id);
      return null;
    }

    // Verificar se o email já está em uso por outro usuário
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
          tenantId: existingUser.tenantId
        }
      });

      if (emailExists) {
        console.error('❌ [userService] Email já está em uso:', data.email);
        throw new Error('Este email já está sendo usado por outro usuário');
      }
    }

    // Atualizar apenas os campos do perfil
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.area && { area: data.area }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        updatedAt: new Date()
      }
    });

    console.log('✅ [userService] Perfil atualizado com sucesso:', updatedUser.name);
    return cleanObject(updatedUser);
    
  } catch (error: any) {
    console.error('❌ [userService] Erro ao atualizar perfil:', {
      id,
      message: error.message,
      code: error.code
    });
    
    if (error.code === 'P2002') {
      const field = error.meta?.target?.[0] || 'email';
      throw new Error(`Já existe um usuário com este ${field}.`);
    }
    
    throw new Error(error.message || 'Falha ao atualizar perfil.');
  }
}

/**
 * Conta o total de usuários para um tenant.
 */
export async function countUsers(tenantId?: string): Promise<number> {
  try {
    const whereClause = tenantId ? { tenantId } : {};
    
    return await prisma.user.count({
      where: whereClause
    });
  } catch (error) {
    console.error('Erro ao contar usuários:', error);
    throw new Error('Falha ao contar usuários.');
  }
}

/**
 * Atualiza a senha de um usuário
 */
export async function updateUserPassword(id: string, hashedPassword: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });
  } catch (error) {
    console.error('Erro ao atualizar senha do usuário:', error);
    throw new Error('Falha ao atualizar senha do usuário.');
  }
}
