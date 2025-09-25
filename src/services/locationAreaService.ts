'use server';

import { prisma } from '@/lib/prisma';
import type { LocationArea } from '@/types/Location';

/**
 * Busca todas as localizações, ordenadas por nome.
 */
export async function findAll(tenantId?: string): Promise<LocationArea[]> {
  try {
    const where = tenantId ? { tenantId } : {};
    const locationAreas = await prisma.locationArea.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    return JSON.parse(JSON.stringify(locationAreas));
  } catch (error) {
    console.error('Erro ao buscar todas as localizações:', error);
    throw new Error('Falha ao buscar localizações do banco de dados.');
  }
}

/**
 * Busca uma localização específica pelo seu ID.
 */
export async function findById(id: string): Promise<LocationArea | null> {
  try {
    const locationArea = await prisma.locationArea.findUnique({
      where: { id }
    });
    if (!locationArea) {
      return null;
    }
    return JSON.parse(JSON.stringify(locationArea));
  } catch (error) {
    console.error(`Erro ao buscar localização pelo ID ${id}:`, error);
    throw new Error('Falha ao buscar localização do banco de dados.');
  }
}

/**
 * Cria uma nova localização.
 */
export async function create(data: Partial<LocationArea>): Promise<LocationArea> {
  try {
    const newLocationArea = await prisma.locationArea.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    });
    return JSON.parse(JSON.stringify(newLocationArea));
  } catch (error: any) {
    console.error('Erro ao criar localização:', error);
    if (error.code === 'P2002') {
      throw new Error('Já existe uma localização com este nome para este inquilino.');
    }
    throw new Error('Falha ao criar nova localização no banco de dados.');
  }
}

/**
 * Atualiza uma localização existente.
 */
export async function update(id: string, data: Partial<LocationArea>): Promise<LocationArea | null> {
  try {
    const updatedLocationArea = await prisma.locationArea.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any
    });
    return JSON.parse(JSON.stringify(updatedLocationArea));
  } catch (error: any) {
    console.error(`Erro ao atualizar localização ${id}:`, error);
    if (error.code === 'P2025') {
      return null; // Localização não encontrada
    }
    throw new Error('Falha ao atualizar localização no banco de dados.');
  }
}

/**
 * Remove uma localização do banco de dados.
 */
export async function remove(id: string): Promise<void> {
  try {
    await prisma.locationArea.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Erro ao remover localização ${id}:`, error);
    if (error.code === 'P2025') {
      throw new Error('Localização não encontrada.');
    }
    throw new Error('Falha ao remover localização do banco de dados.');
  }
}
