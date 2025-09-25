'use client';

import { usePathname } from 'next/navigation';
import { AuthenticatedShell } from './authenticated-shell';

interface ConditionalShellProps {
  children: React.ReactNode;
}

// Rotas que não devem mostrar o menu
const AUTH_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password'
];

export function ConditionalShell({ children }: ConditionalShellProps) {
  const pathname = usePathname();
  
  // Verificar se é uma página de autenticação
  const isAuthPage = AUTH_ROUTES.some(route => pathname.startsWith(route));
  
  // Se for página de autenticação, renderizar apenas o conteúdo
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  // Caso contrário, renderizar com o shell autenticado (menu)
  return (
    <AuthenticatedShell>
      {children}
    </AuthenticatedShell>
  );
}