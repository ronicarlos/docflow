import { cookies, headers } from 'next/headers';
import { jwtVerify } from 'jose';
import { findAllUsers } from '@/services/userService';
import type { User, UserRole } from '@/types/User';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

const COOKIE_NAME = 'docflow-session';

/**
 * Obter usuário atual do servidor (Server Components)
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as UserRole,
      tenantId: payload.tenantId as string,
      area: payload.area as string || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
}

/**
 * Obter usuário atual dos headers (quando middleware adiciona)
 */
export async function getCurrentUserFromHeaders(): Promise<User | null> {
  try {
    const headersList = await headers();
    
    const userId = headersList.get('x-user-id');
    const email = headersList.get('x-user-email');
    const name = headersList.get('x-user-name');
    const role = headersList.get('x-user-role');
    const tenantId = headersList.get('x-user-tenant');

    if (!userId || !email || !name || !role || !tenantId) {
      return null;
    }

    return {
      id: userId,
      email,
      name,
      role: role as UserRole,
      tenantId,
      area: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Erro ao obter usuário dos headers:', error);
    return null;
  }
}

/**
 * Verificar se usuário tem permissão específica
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;

  // Super admin tem todas as permissões
  if (user.role === 'SuperAdmin') return true;

  // Lógica de permissões baseada no role
  const rolePermissions: Record<string, string[]> = {
    Admin: ['read', 'write', 'delete', 'manage_users', 'manage_contracts'],
    Approver: ['read', 'write', 'approve_documents'],
    Editor: ['read', 'write', 'manage_documents'],
    Viewer: ['read'],
  };

  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes(permission);
}

/**
 * Verificar se usuário pertence ao tenant
 */
export function belongsToTenant(user: User | null, tenantId: string): boolean {
  if (!user) return false;
  
  // Super admin pode acessar qualquer tenant
  if (user.role === 'SuperAdmin') return true;
  
  return user.tenantId === tenantId;
}

/**
 * Obter todos os usuários do tenant atual
 */
export async function getUsersByTenant(tenantId: string): Promise<User[]> {
  try {
    return await findAllUsers(tenantId);
  } catch (error) {
    console.error('Erro ao buscar usuários do tenant:', error);
    return [];
  }
}

/**
 * Verificar se usuário está autenticado (para Client Components)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Objeto auth para compatibilidade com NextAuth
 */
export const auth = async () => {
  const user = await getCurrentUser();
  return user ? { user } : null;
};