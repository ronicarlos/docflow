

'use server';

import { prisma } from '@/lib/prisma';
import type { AnalysisResult } from '@/types/AnalysisResult';

function cleanObject<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function findAllForContract(contractId: string): Promise<AnalysisResult[]> {
  try {
    const results = await prisma.analysisResult.findMany({
      where: { contractId },
      orderBy: { createdAt: 'desc' },
      include: {
        executedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return cleanObject(results);
  } catch (error) {
    console.error(`Error finding analysis results for contract ${contractId}:`, error);
    throw new Error('Falha ao buscar histórico de análises do banco de dados.');
  }
}

export async function findById(id: string): Promise<AnalysisResult | null> {
  if (!id) return null;
  try {
    const result = await prisma.analysisResult.findUnique({
      where: { id },
      include: {
        executedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return result ? cleanObject(result) : null;
  } catch (error) {
    console.error(`Error finding analysis result by ID ${id}:`, error);
    throw new Error('Falha ao buscar resultado da análise do banco de dados.');
  }
}

export async function create(data: Partial<AnalysisResult>): Promise<AnalysisResult> {
  try {
    // Validar campos obrigatórios
    if (!data.type && !data.summary) {
      throw new Error('Tipo ou resumo é obrigatório');
    }
    if (!data.tenantId) {
      throw new Error('Tenant ID é obrigatório');
    }

    console.log('Creating analysis result with data:', JSON.stringify(data, null, 2));

    const newResult = await prisma.analysisResult.create({
      data: {
        type: data.type || 'general',
        title: data.title || data.summary || 'Análise',
        description: data.description || null,
        result: data.result || {},
        confidence: data.confidence || null,
        riskLevel: data.riskLevel || null,
        recommendations: data.recommendations || [],
        tenantId: data.tenantId!,
        contractId: data.contractId || null,
        executedById: data.executedBy?.id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        executedBy: {
          select: { id: true, name: true, email: true }
        },
        tenant: {
          select: { id: true, name: true }
        }
      }
    });

    console.log('Analysis result created successfully:', newResult.id);
    return cleanObject(newResult);
  } catch (error: any) {
    console.error('Error creating analysis record:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });

    if (error.code === 'P2002') {
      throw new Error('Já existe um registro de análise com estes dados.');
    }
    if (error.code === 'P2003') {
      throw new Error('Tenant não encontrado. Verifique os dados fornecidos.');
    }
    
    throw new Error(`Falha ao criar novo registro de análise: ${error.message}`);
  }
}


export async function update(id: string, data: Partial<AnalysisResult>): Promise<AnalysisResult | null> {
  if (!id) return null;
  try {
    const updatedResult = await prisma.analysisResult.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any,
      include: {
        executedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return cleanObject(updatedResult);
  } catch (error: any) {
    console.error(`Error updating analysis result ${id}:`, error);
    if (error.code === 'P2025') {
      return null; // Resultado não encontrado
    }
    throw new Error('Falha ao atualizar resultado da análise no banco de dados.');
  }
}
