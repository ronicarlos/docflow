'use client';

import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import AppShell from './app-shell';
import { UserProvider } from '@/context/UserContext';

interface AuthenticatedShellProps {
  children: React.ReactNode;
}

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const { isLoading, isAuthenticated } = useAuth();

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

  // Se não estiver autenticado, renderizar sem o menu
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Se estiver autenticado, renderizar com o AppShell (menu)
  return (
    <UserProvider>
      <AppShell>{children}</AppShell>
    </UserProvider>
  );
}