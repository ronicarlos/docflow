'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  area?: string;
  canCreateRecords?: boolean;
  canEditRecords?: boolean;
  canDeleteRecords?: boolean;
  canDownloadDocuments?: boolean;
  canApproveDocuments?: boolean;
  canPrintDocuments?: boolean;
  accessibleContractIds?: string[];
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 [useAuth] Iniciando verificação de autenticação');
      
      try {
        console.log('📡 [useAuth] Fazendo requisição para /api/auth/me');
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        console.log('📨 [useAuth] Resposta recebida:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('✅ [useAuth] Dados do usuário recebidos:', {
            id: userData.user?.id,
            email: userData.user?.email,
            name: userData.user?.name
          });
          setUser(userData.user);
        } else {
          console.log('❌ [useAuth] Resposta não OK - limpando usuário');
          setUser(null);
          // Se não autenticado, redirecionar para login
          if (response.status === 401) {
            console.log('🔄 [useAuth] Status 401 - redirecionando para login');
            router.push('/login');
          }
        }
      } catch (error: any) {
        console.group('❌ [useAuth] Erro capturado:');
        console.error('🕐 Timestamp:', new Date().toISOString());
        console.error('📝 Tipo do erro:', error?.constructor?.name || 'Unknown');
        console.error('💬 Mensagem:', error?.message || 'Sem mensagem');
        console.error('🗂️ Stack trace:', error?.stack || 'Sem stack');
        console.error('📋 Erro completo:', error);
        console.groupEnd();
        setUser(null);
      } finally {
        console.log('🏁 [useAuth] Finalizando verificação - isLoading = false');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}