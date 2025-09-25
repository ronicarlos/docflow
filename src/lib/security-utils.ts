/**
 * Utilitários de segurança para validação e sanitização
 */

import { headers } from 'next/headers';

/**
 * Valida se um email tem formato válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida força da senha
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitiza entrada de texto removendo caracteres perigosos
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Valida se uma URL é segura (não contém protocolos perigosos)
 */
export function isSafeUrl(url: string): boolean {
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = url.toLowerCase();
  
  return !dangerousProtocols.some(protocol => lowerUrl.startsWith(protocol));
}

/**
 * Obtém informações do usuário dos headers (definidos pelo middleware)
 */
export async function getUserFromHeaders() {
  const headersList = await headers();
  
  const userId = headersList.get('x-user-id');
  const userEmail = headersList.get('x-user-email');
  const userName = headersList.get('x-user-name');
  const userRole = headersList.get('x-user-role');
  const userTenant = headersList.get('x-user-tenant');

  if (!userId || !userEmail) {
    return null;
  }

  return {
    id: userId,
    email: userEmail,
    name: userName || '',
    role: userRole || 'user',
    tenantId: userTenant || ''
  };
}

/**
 * Valida se o usuário tem permissão para acessar um recurso
 */
export function hasPermission(
  userRole: string, 
  requiredRole: string | string[]
): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  // Hierarquia de roles
  const roleHierarchy: Record<string, number> = {
    'user': 1,
    'manager': 2,
    'admin': 3,
    'super_admin': 4
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevels = roles.map(role => roleHierarchy[role] || 0);
  
  return requiredLevels.some(level => userLevel >= level);
}

/**
 * Gera um token CSRF simples
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Valida rate limiting básico (em memória)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Limpar entradas antigas
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key);
    }
  }

  const current = rateLimitMap.get(identifier);
  
  if (!current || current.resetTime < now) {
    // Nova janela de tempo
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  current.count++;
  rateLimitMap.set(identifier, current);
  
  return { 
    allowed: true, 
    remaining: maxRequests - current.count, 
    resetTime: current.resetTime 
  };
}

/**
 * Logs de segurança
 */
export function logSecurityEvent(
  event: string, 
  details: Record<string, any>, 
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    userAgent: details.userAgent || 'unknown',
    ip: details.ip || 'unknown'
  };

  // Em produção, isso deveria ir para um sistema de logs adequado
  console.warn(`[SECURITY ${severity.toUpperCase()}]`, logEntry);
}