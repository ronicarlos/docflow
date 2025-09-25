import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { checkRateLimit, logSecurityEvent } from '@/lib/security-utils';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

const COOKIE_NAME = 'docflow-session';

// Rotas que não precisam de autenticação
const publicRoutes = [
  '/login',
  '/forgot-password',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/signup',
  '/api/contracts', // Temporariamente público para debug
  '/_next',
  '/favicon.ico',
];

// Rotas de desenvolvimento (opcional)
const devRoutes = [
  '/dev/switch-user'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detectar chamadas de Server Actions (POST com header next-action)
  const isServerAction = request.method === 'POST' && (
    request.headers.get('next-action') !== null ||
    request.headers.get('Next-Action') !== null
  );

  // Rate limiting mais flexível - apenas para prevenir ataques DDoS
  const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const rateLimitResult = checkRateLimit(clientIP, 500, 60000); // 500 req/min (muito mais flexível)
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' }, 
      { status: 429 }
    );
  }

  // Permitir rotas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir rotas de desenvolvimento em modo dev
  if (process.env.NODE_ENV === 'development' && 
      devRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar token de autenticação
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    logSecurityEvent('unauthorized_access_attempt', {
      ip: clientIP,
      userAgent,
      pathname
    }, 'low');
    
    // Para Server Actions sem token, não redirecionar (evita Failed to fetch no client);
    // permitir que a Action faça a checagem de auth e responda adequadamente
    if (isServerAction) {
      return NextResponse.next();
    }
    
    // Redirecionar para login se não autenticado (demais requisições)
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verificar e decodificar JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Adicionar dados do usuário aos headers para uso nas páginas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-email', payload.email as string);
    requestHeaders.set('x-user-name', payload.name as string);
    requestHeaders.set('x-user-role', payload.role as string);
    requestHeaders.set('x-user-tenant', payload.tenantId as string);
    requestHeaders.set('x-pathname', pathname);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    // Token inválido ou expirado
    logSecurityEvent('invalid_token_attempt', {
      ip: clientIP,
      userAgent,
      pathname,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 'medium');
    
    // Remover cookie inválido
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    
    return response;
  }
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
