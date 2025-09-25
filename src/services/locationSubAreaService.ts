

'use server';

import { prisma } from '@/lib/prisma';
import type { LocationSubArea, PopulatedLocationSubArea, LocationArea } from '@/types/Location';

/**
 * Busca todas as sub-localizações, populando o nome da localização pai.
 */
export async function findAll(tenantId?: string): Promise<PopulatedLocationSubArea[]> {
  try {
    const where = tenantId ? { tenantId } : {};
    const subAreas = await prisma.locationSubArea.findMany({
      where,
      include: {
        locationArea: {
          select: { id: true, name: true, code: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return JSON.parse(JSON.stringify(subAreas));
  } catch (error) {
    console.error('Erro ao buscar todas as sub-localizações:', error);
    throw new Error('Falha ao buscar sub-localizações do banco de dados.');
  }
}

/**
 * Busca uma sub-localização específica pelo seu ID.
 */
export async function findById(id: string): Promise<LocationSubArea | null> {
  try {
    const subArea = await prisma.locationSubArea.findUnique({
      where: { id },
      include: {
        locationArea: {
          select: { id: true, name: true, code: true }
        }
      }
    });
    if (!subArea) {
      return null;
    }
    return JSON.parse(JSON.stringify(subArea));
  } catch (error) {
    console.error(`Erro ao buscar sub-localização pelo ID ${id}:`, error);
    throw new Error('Falha ao buscar sub-localização do banco de dados.');
  }
}

/**
 * Cria uma nova sub-localização.
 */
export async function create(data: Partial<LocationSubArea>): Promise<LocationSubArea> {
  try {
    const newSubArea = await prisma.locationSubArea.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    });
    return JSON.parse(JSON.stringify(newSubArea));
  } catch (error: any) {
    console.error('Erro ao criar sub-localização:', error);
    if (error.code === 'P2002') {
      throw new Error('Já existe uma sub-localização com este nome para esta localização pai.');
    }
    throw new Error('Falha ao criar nova sub-localização no banco de dados.');
  }
}

/**
 * Atualiza uma sub-localização existente.
 */
export async function update(id: string, data: Partial<LocationSubArea>): Promise<LocationSubArea | null> {
  try {
    const updatedSubArea = await prisma.locationSubArea.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any
    });
    return JSON.parse(JSON.stringify(updatedSubArea));
  } catch (error: any) {
    console.error(`Erro ao atualizar sub-localização ${id}:`, error);
    if (error.code === 'P2025') {
      return null; // Sub-localização não encontrada
    }
    throw new Error('Falha ao atualizar sub-localização no banco de dados.');
  }
}

/**
 * Remove uma sub-localização do banco de dados.
 */
export async function remove(id: string): Promise<void> {
  try {
    // TODO: Adicionar verificação se a sub-localização está em uso por algum documento.
    await prisma.locationSubArea.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Erro ao remover sub-localização ${id}:`, error);
    if (error.code === 'P2025') {
      throw new Error('Sub-localização não encontrada.');
    }
    throw new Error('Falha ao remover sub-localização do banco de dados.');
  }
}
