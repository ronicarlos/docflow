'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Contract } from '@/types/Contract';
import type { User } from '@/types/User';

export function useImportData() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Buscar dados do usuário atual e contratos
        const [userResponse, contractsResponse] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/contracts')
        ]);

        if (!userResponse.ok) {
          router.push('/login');
          return;
        }

        const userData = await userResponse.json();
        setCurrentUser(userData);

        if (!contractsResponse.ok) {
          throw new Error('Erro ao carregar contratos');
        }

        const contractsData = await contractsResponse.json();
        
        // Filtrar contratos baseado nas permissões do usuário
        if (userData.role === 'Admin' || userData.role === 'SuperAdmin') {
          setContracts(contractsData);
        } else if (userData.accessibleContractIds && userData.accessibleContractIds.length > 0) {
          setContracts(contractsData.filter((c: Contract) => 
            userData.accessibleContractIds?.includes(c.id)
          ));
        } else {
          setContracts([]);
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  return { contracts, currentUser, loading, error };
}