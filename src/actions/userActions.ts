
'use server';

import { revalidatePath } from 'next/cache';
import * as userService from '@/services/userService';
import type { User } from '@/types/User';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Schema robusto para validação dos dados do usuário
const userFormSchema = z.object({
  name: z.string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, "Nome não pode exceder 100 caracteres")
    .trim(),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email não pode exceder 255 caracteres")
    .toLowerCase()
    .trim(),
  area: z.string()
    .min(1, "Área principal é obrigatória")
    .max(100, "Área não pode exceder 100 caracteres")
    .trim()
    .optional(),
  role: z.enum(['Viewer', 'Editor', 'Approver', 'Admin', 'SuperAdmin'], {
    errorMap: () => ({ message: "Role deve ser um dos valores válidos" })
  }),
  tenantId: z.string()
    .min(1, "Tenant ID é obrigatório")
    .uuid("Tenant ID deve ser um UUID válido")
    .optional(),
  password: z.string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(100, "Senha não pode exceder 100 caracteres")
    .optional(),
  accessibleContractIds: z.array(z.string().uuid("Contract ID deve ser um UUID válido"))
    .optional()
    .default([]),
  disciplineIds: z.array(z.string().uuid("Discipline ID deve ser um UUID válido"))
    .optional()
    .default([]),
  canCreateRecords: z.boolean().optional().default(false),
  canEditRecords: z.boolean().optional().default(false),
  canDeleteRecords: z.boolean().optional().default(false),
  canDownloadDocuments: z.boolean().optional().default(true),
  canApproveDocuments: z.boolean().optional().default(false),
  canPrintDocuments: z.boolean().optional().default(true),
  isActive: z.boolean().optional().default(true),
  avatarUrl: z.string().url("URL do avatar inválida").optional().nullable()
});

// Schema específico para criação (campos obrigatórios)
const createUserFormSchema = userFormSchema.extend({
  area: z.string()
    .min(1, "Área principal é obrigatória")
    .max(100, "Área não pode exceder 100 caracteres")
    .trim(),
  tenantId: z.string()
    .min(1, "Tenant ID é obrigatório")
    .uuid("Tenant ID deve ser um UUID válido")
});

// Schema para atualização (todos os campos opcionais exceto ID)
const updateUserFormSchema = userFormSchema.partial().extend({
  id: z.string().uuid("ID deve ser um UUID válido")
});

// Tipos para respostas das actions
export type ActionResult<T = any> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  debugInfo?: any;
};

/**
 * Cria um novo usuário no sistema
 */
export async function createUser(data: Partial<User>): Promise<ActionResult<User>> {
  console.log('🔍 [userActions] Iniciando createUser:', {
    timestamp: new Date().toISOString(),
    receivedKeys: Object.keys(data),
    hasPassword: !!(data as any).password
  });

  try {
    // Validação dos dados de entrada
    const validatedData = createUserFormSchema.parse(data);
    console.log('✅ [userActions] Dados validados com sucesso');

    // Verificar se o usuário atual tem permissão
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }

    // Verificar permissões
    if (!['Admin', 'SuperAdmin'].includes(currentUser.role) && !(currentUser as any).canCreateRecords) {
      return {
        success: false,
        message: 'Você não tem permissão para criar usuários'
      };
    }

    // Criar o usuário
    const createdUser = await userService.create(validatedData);
    console.log('✅ [userActions] Usuário criado com sucesso:', createdUser.id);

    // Revalidar as páginas relevantes
    revalidatePath('/users');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: createdUser,
      message: 'Usuário criado com sucesso!'
    };

  } catch (error) {
    console.error('❌ [userActions] Erro em createUser:', error);

    // Tratamento específico de erros de validação
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const field = err.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      });

      return {
        success: false,
        message: 'Dados inválidos fornecidos',
        errors: fieldErrors
      };
    }

    // Tratamento de erros do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return {
            success: false,
            message: 'Email já está em uso por outro usuário'
          };
        case 'P2003':
          return {
            success: false,
            message: 'Referência inválida (tenant ou contrato não encontrado)'
          };
        case 'P2025':
          return {
            success: false,
            message: 'Registro relacionado não encontrado'
          };
        default:
          return {
            success: false,
            message: 'Erro de banco de dados',
            debugInfo: { code: error.code, meta: error.meta }
          };
      }
    }

    // Erro genérico
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
  }
}

/**
 * Atualiza um usuário existente
 */
export async function updateUser(id: string, data: Partial<User>): Promise<ActionResult<User>> {
  console.log('🎯 [userActions] Iniciando updateUser action:', { id, data });
  
  try {
    // Validar dados de entrada
    if (!id) {
      console.error('❌ [userActions] ID do usuário não fornecido');
      return { success: false, message: 'ID do usuário é obrigatório' };
    }

    console.log('📝 [userActions] Dados recebidos para atualização:', {
      id,
      fields: Object.keys(data),
      accessibleContractIds: data.accessibleContractIds,
      disciplineIds: data.disciplineIds
    });

    const updatedUser = await userService.update(id, data);

    if (!updatedUser) {
      console.error('❌ [userActions] Usuário não encontrado no service');
      return { success: false, message: 'Usuário não encontrado' };
    }

    console.log('✅ [userActions] Usuário atualizado com sucesso:', updatedUser.name);

    // Revalidar as páginas relacionadas
    revalidatePath('/users');
    revalidatePath(`/users/${id}`);
    revalidatePath(`/users/${id}/edit`);

    return { 
      success: true, 
      message: 'Usuário atualizado com sucesso',
      data: updatedUser 
    };

  } catch (error: any) {
    console.error('❌ [userActions] Erro na action updateUser:', {
      id,
      message: error.message,
      stack: error.stack
    });

    return { 
      success: false, 
      message: error.message || 'Erro interno do servidor' 
    };
  }
}

/**
 * Remove um usuário do sistema
 */
export async function deleteUser(id: string): Promise<ActionResult> {
  console.log('🔍 [userActions] Iniciando deleteUser:', {
    timestamp: new Date().toISOString(),
    userId: id
  });

  try {
    // Validar ID
    if (!id || !z.string().uuid().safeParse(id).success) {
      return {
        success: false,
        message: 'ID de usuário inválido'
      };
    }

    // Verificar se o usuário atual tem permissão
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }

    // Verificar se não está tentando deletar a si mesmo
    if (currentUser.id === id) {
      return {
        success: false,
        message: 'Você não pode excluir seu próprio usuário'
      };
    }

    // Verificar permissões
    if (!['Admin', 'SuperAdmin'].includes(currentUser.role) && !(currentUser as any).canDeleteRecords) {
      return {
        success: false,
        message: 'Você não tem permissão para excluir usuários'
      };
    }

    // Remover o usuário
    await userService.remove(id);
    console.log('✅ [userActions] Usuário removido com sucesso:', id);

    // Revalidar as páginas relevantes
    revalidatePath('/users');
    revalidatePath('/dashboard');

    return {
      success: true,
      message: 'Usuário excluído com sucesso!'
    };

  } catch (error) {
    console.error('❌ [userActions] Erro em deleteUser:', error);

    // Tratamento de erros do Prisma
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          return {
            success: false,
            message: 'Usuário não encontrado'
          };
        case 'P2003':
          return {
            success: false,
            message: 'Não é possível excluir usuário com registros relacionados'
          };
        default:
          return {
            success: false,
            message: 'Erro de banco de dados',
            debugInfo: { code: error.code, meta: error.meta }
          };
      }
    }

    // Erro genérico
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
  }
}

/**
 * Busca um usuário específico por ID
 */
export async function getUserById(id: string): Promise<ActionResult<User>> {
  console.log('🔍 [userActions] Iniciando getUserById:', {
    timestamp: new Date().toISOString(),
    userId: id
  });

  try {
    // Validar ID
    if (!id || !z.string().uuid().safeParse(id).success) {
      return {
        success: false,
        message: 'ID de usuário inválido'
      };
    }

    // Verificar autenticação
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }

    // Buscar o usuário
    const user = await userService.findUserById(id);
    
    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado'
      };
    }

    // Verificar se o usuário pertence ao mesmo tenant
    if (user.tenantId !== currentUser.tenantId) {
      return {
        success: false,
        message: 'Acesso negado'
      };
    }

    console.log('✅ [userActions] Usuário encontrado:', user.id);

    return {
      success: true,
      data: user
    };

  } catch (error) {
    console.error('❌ [userActions] Erro em getUserById:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
  }
}

/**
 * Lista todos os usuários do tenant atual
 */
export async function getAllUsers(): Promise<ActionResult<User[]>> {
  console.log('🔍 [userActions] Iniciando getAllUsers:', {
    timestamp: new Date().toISOString()
  });

  try {
    // Verificar autenticação
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }

    if (!currentUser.tenantId) {
      return {
        success: false,
        message: 'Tenant não identificado'
      };
    }

    // Buscar usuários do tenant
    const users = await userService.findAllUsers(currentUser.tenantId);
    console.log('✅ [userActions] Usuários encontrados:', users.length);

    return {
      success: true,
      data: users
    };

  } catch (error) {
    console.error('❌ [userActions] Erro em getAllUsers:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
  }
}

/**
 * Verifica se um email já está em uso
 */
export async function checkEmailAvailability(email: string, excludeUserId?: string): Promise<ActionResult<{ available: boolean }>> {
  try {
    // Validar email
    const emailValidation = z.string().email().safeParse(email);
    if (!emailValidation.success) {
      return {
        success: false,
        message: 'Email inválido'
      };
    }

    // Verificar autenticação
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return {
        success: false,
        message: 'Usuário não autenticado'
      };
    }

    // Buscar usuário por email
    const existingUser = await userService.findUserByEmail(email.toLowerCase().trim());
    
    // Se não encontrou usuário, email está disponível
    if (!existingUser) {
      return {
        success: true,
        data: { available: true }
      };
    }

    // Se encontrou usuário mas é o mesmo que está sendo editado, email está disponível
    if (excludeUserId && existingUser.id === excludeUserId) {
      return {
        success: true,
        data: { available: true }
      };
    }

    // Email já está em uso
    return {
      success: true,
      data: { available: false }
    };

  } catch (error) {
    console.error('❌ [userActions] Erro em checkEmailAvailability:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    };
  }
}
