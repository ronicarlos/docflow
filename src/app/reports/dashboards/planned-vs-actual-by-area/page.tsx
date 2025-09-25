'use server';

import * as React from 'react';
import { getCurrentUser } from '@/lib/auth';
import * as documentService from '@/services/documentService';
import { redirect } from 'next/navigation';
import PlannedVsActualByAreaClient from '@/components/reports/planned-vs-actual-by-area-client';
import type { Document } from '@/types';

interface ChartData {
  area: string;
  previstos: number;
  realizados: number;
  total: number;
  percPrevistos: string;
  percRealizados: string;
}

export default async function PlannedVsActualByAreaPage() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    // Verificar se o usuário tem permissão para acessar relatórios
    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      redirect('/dashboard');
    }

    const allDocuments = await documentService.findAll(currentUser.tenantId);

    const dataByArea: Record<string, { previstos: number; realizados: number }> = {};

    allDocuments.forEach(doc => {
      const areaName = typeof doc.locationSubArea === 'object' && doc.locationSubArea?.name 
        ? doc.locationSubArea.name 
        : 'Não Especificada';
      if (!dataByArea[areaName]) {
        dataByArea[areaName] = { previstos: 0, realizados: 0 };
      }
      if (doc.status === 'approved') {
        dataByArea[areaName].realizados += 1;
      } else {
        dataByArea[areaName].previstos += 1;
      }
    });

    const formattedData: ChartData[] = Object.entries(dataByArea)
      .map(([area, counts]) => {
        const total = counts.previstos + counts.realizados;
        return {
          area,
          previstos: counts.previstos,
          realizados: counts.realizados,
          total,
          percPrevistos: total > 0 ? ((counts.previstos / total) * 100).toFixed(1) + '%' : '0.0%',
          percRealizados: total > 0 ? ((counts.realizados / total) * 100).toFixed(1) + '%' : '0.0%',
        };
      })
      .sort((a, b) => b.total - a.total);

    return (
      <PlannedVsActualByAreaClient chartData={formattedData} />
    );
  } catch (error) {
    console.error('Erro ao carregar dashboard de planejado vs real por área:', error);
    redirect('/dashboard');
  }
}
