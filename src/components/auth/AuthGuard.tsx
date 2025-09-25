'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

// Rotas que não requerem autenticação
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/forgot-password',
  '/api/auth/reset-password'
];

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // Verificar se a rota atual é pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

  // Se for rota pública, renderizar sem verificação
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}