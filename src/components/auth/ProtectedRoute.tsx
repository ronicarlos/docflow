'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermissions?: string[];
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requiredPermissions = [] 
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirecionar para login com o caminho atual como parâmetro redirect
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectUrl}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não autenticado, não renderizar nada (redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar role se especificado
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Verificar permissões se especificadas
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => {
      switch (permission) {
        case 'canCreateRecords':
          return user?.canCreateRecords;
        case 'canEditRecords':
          return user?.canEditRecords;
        case 'canDeleteRecords':
          return user?.canDeleteRecords;
        case 'canDownloadDocuments':
          return user?.canDownloadDocuments;
        case 'canApproveDocuments':
          return user?.canApproveDocuments;
        case 'canPrintDocuments':
          return user?.canPrintDocuments;
        default:
          return false;
      }
    });

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Permissão Insuficiente</h1>
            <p className="text-gray-600">Você não tem as permissões necessárias para acessar esta página.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}