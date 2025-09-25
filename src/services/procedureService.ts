
'use server';

import { prisma } from '@/lib/prisma';
import type { Procedure } from '@/types/Procedure';

function cleanObject<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function findAll(tenantId: string): Promise<Procedure[]> {
  try {
    const procedures = await prisma.procedure.findMany({
      where: { tenantId },
      include: {
        responsibleUser: {
          select: { id: true, name: true, email: true }
        },
        approverUser: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { title: 'asc' }
    });
    return cleanObject(procedures);
  } catch (error) {
    console.error('Error finding all procedures:', error);
    throw new Error('Falha ao buscar procedimentos do banco de dados.');
  }
}

export async function findById(id: string): Promise<Procedure | null> {
  if (!id) {
    console.warn(`Attempted to find procedure with invalid ID: ${id}`);
    return null;
  }
  try {
    const procedure = await prisma.procedure.findUnique({
      where: { id },
      include: {
        responsibleUser: {
          select: { id: true, name: true, email: true }
        },
        approverUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return procedure ? cleanObject(procedure) : null;
  } catch (error) {
    console.error(`Error finding procedure by ID ${id}:`, error);
    throw new Error('Falha ao buscar procedimento do banco de dados.');
  }
}

export async function create(data: Partial<Procedure>): Promise<Procedure> {
  try {
    // Validar campos obrigatórios
    if (!data.title) {
      throw new Error('Título é obrigatório');
    }
    if (!data.content) {
      throw new Error('Conteúdo é obrigatório');
    }
    if (!data.tenantId) {
      throw new Error('Tenant ID é obrigatório');
    }
    if (!data.createdById) {
      throw new Error('ID do criador é obrigatório');
    }

    console.log('Creating procedure with data:', JSON.stringify(data, null, 2));

    const newProcedure = await prisma.procedure.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category || null,
        tags: data.tags || [],
        status: data.status || 'draft',
        version: data.version || '1.0',
        isPublished: data.isPublished || false,
        publishedAt: data.publishedAt || null,
        tenantId: data.tenantId,
        createdById: data.createdById,
        responsibleUserId: data.responsibleUserId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        responsibleUser: {
          select: { id: true, name: true, email: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log('Procedure created successfully:', newProcedure.id);
    return cleanObject(newProcedure);
  } catch (error: any) {
    console.error('Error creating procedure:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });

    if (error.code === 'P2002') {
      throw new Error('Já existe um procedimento com este código e versão para este inquilino.');
    }
    if (error.code === 'P2003') {
      throw new Error('Tenant ou usuário não encontrado. Verifique os dados fornecidos.');
    }
    throw new Error(`Falha ao criar novo procedimento: ${error.message}`);
  }
}

export async function update(id: string, data: Partial<Procedure>): Promise<Procedure | null> {
  if (!id) {
    console.warn(`Attempted to update procedure with invalid ID: ${id}`);
    return null;
  }
  try {
    const updatedProcedure = await prisma.procedure.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any,
      include: {
        responsibleUser: {
          select: { id: true, name: true, email: true }
        },
        approverUser: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    return cleanObject(updatedProcedure);
  } catch (error: any) {
    console.error(`Error updating procedure ${id}:`, error);
    if (error.code === 'P2025') {
      return null; // Procedimento não encontrado
    }
    throw new Error('Falha ao atualizar procedimento no banco de dados.');
  }
}

export async function remove(id: string): Promise<void> {
   if (!id) {
    console.warn(`Attempted to delete procedure with invalid ID: ${id}`);
    return;
  }
  try {
    await prisma.procedure.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Error removing procedure ${id}:`, error);
    if (error.code === 'P2025') {
      throw new Error('Procedimento não encontrado.');
    }
    throw new Error('Falha ao remover procedimento do banco de dados.');
  }
}
