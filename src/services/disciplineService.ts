
'use server';

import { prisma } from '@/lib/prisma';
import type { Discipline } from '@/types/Discipline';

/**
 * Busca todas as disciplinas para um tenant específico, ordenadas por nome.
 */
export async function findAll(tenantId: string): Promise<Discipline[]> {
  try {
    const disciplines = await prisma.discipline.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
    return JSON.parse(JSON.stringify(disciplines));
  } catch (error) {
    console.error('Erro ao buscar todas as disciplinas:', error);
    throw new Error('Falha ao buscar disciplinas do banco de dados.');
  }
}

/**
 * Busca uma disciplina específica pelo seu ID.
 */
export async function findById(id: string): Promise<Discipline | null> {
  try {
    const discipline = await prisma.discipline.findUnique({
      where: { id }
    });
    if (!discipline) {
      return null;
    }
    return JSON.parse(JSON.stringify(discipline));
  } catch (error) {
    console.error(`Erro ao buscar disciplina pelo ID ${id}:`, error);
    throw new Error('Falha ao buscar disciplina do banco de dados.');
  }
}

/**
 * Cria uma nova disciplina.
 */
export async function create(data: Partial<Discipline>): Promise<Discipline> {
  try {
    // Validar campos obrigatórios
    if (!data.name) {
      throw new Error('Nome da disciplina é obrigatório');
    }
    if (!data.tenantId) {
      throw new Error('Tenant ID é obrigatório');
    }

    // Whitelist de campos válidos no modelo Prisma Discipline
    const payload: any = {
      tenantId: data.tenantId,
      name: data.name,
      // code é obrigatório no Prisma (String), garantir string (pode ser vazia se não fornecida)
      code: typeof (data as any).code === 'string' ? (data as any).code : '',
    };

    console.log('Creating discipline with data (whitelisted):', JSON.stringify(payload, null, 2));

    const newDiscipline = await prisma.discipline.create({
      data: payload,
    });

    console.log('Discipline created successfully:', newDiscipline.id);
    return JSON.parse(JSON.stringify(newDiscipline));
  } catch (error: any) {
    console.error('Error creating discipline:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });

    if (error.code === 'P2002') {
      throw new Error('Já existe uma disciplina com este nome ou código para este inquilino.');
    }
    if (error.code === 'P2003') {
      throw new Error('Tenant não encontrado. Verifique os dados fornecidos.');
    }
    
    throw new Error(`Falha ao criar nova disciplina: ${error.message}`);
  }
}

/**
 * Atualiza uma disciplina existente.
 */
export async function update(id: string, data: Partial<Discipline>): Promise<Discipline | null> {
  try {
    // Whitelist para atualização
    const payload: any = {};
    if (typeof data.name === 'string' && data.name.length > 0) payload.name = data.name;
    if (typeof (data as any).code === 'string') payload.code = (data as any).code;

    const updatedDiscipline = await prisma.discipline.update({
      where: { id },
      data: payload,
    });
    return JSON.parse(JSON.stringify(updatedDiscipline));
  } catch (error: any) {
    console.error(`Erro ao atualizar disciplina ${id}:`, error);
    if (error.code === 'P2025') {
      return null; // Disciplina não encontrada
    }
    throw new Error('Falha ao atualizar disciplina no banco de dados.');
  }
}

/**
 * Remove uma disciplina do banco de dados.
 */
export async function remove(id: string): Promise<void> {
  try {
    await prisma.discipline.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Erro ao remover disciplina ${id}:`, error);
    if (error.code === 'P2025') {
      throw new Error('Disciplina não encontrada.');
    }
    throw new Error('Falha ao remover disciplina do banco de dados.');
  }
}
