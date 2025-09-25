'use server';

import * as React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getDistributionEventLogs } from '@/services/distributionService';
import { redirect } from 'next/navigation';
import DistributionByAreaClient from '@/components/reports/distribution-by-area-client';

interface ChartData {
  name: string; // Área do Documento
  total: number; // Contagem de distribuições bem-sucedidas
}

export default async function DistributionByAreaPage() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    // Verificar se o usuário tem permissão para acessar relatórios
    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      redirect('/dashboard');
    }

    const logs = await getDistributionEventLogs(currentUser.tenantId);
    const successfulLogs = logs.filter(log => log.status === 'SENT');

    const dataByArea: Record<string, number> = successfulLogs.reduce((acc, log) => {
      // Buscar área do documento através do entityId se disponível
      const area = 'Área Geral'; // Placeholder - seria necessário buscar do documento
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const formattedData: ChartData[] = Object.entries(dataByArea)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total); // Ordenar do maior para o menor

    return (
      <DistributionByAreaClient chartData={formattedData} />
    );
  } catch (error) {
    console.error('Erro ao carregar dashboard de distribuição por área:', error);
    redirect('/dashboard');
  }
}
