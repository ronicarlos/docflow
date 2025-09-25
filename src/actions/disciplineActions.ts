
'use server';

import { revalidatePath } from 'next/cache';
import * as disciplineService from '@/services/disciplineService';
import type { Discipline } from '@/types/Discipline';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const disciplineFormSchema = z.object({
  name: z.string().min(2, "Nome da disciplina deve ter pelo menos 2 caracteres."),
  code: z.string().optional(),
});

export async function createDiscipline(data: Partial<Discipline>) {
  try {
    const validatedData = disciplineFormSchema.parse(data);
    
    // Buscar tenant ativo para atribuir tenantId corretamente
    const firstTenant = await prisma.tenant.findFirst({
      where: { isActive: true }
    });
    
    if (!firstTenant) {
      throw new Error("Nenhum tenant ativo encontrado.");
    }

    const dataWithTenant = {
      ...validatedData,
      tenantId: firstTenant.id,
    };

    await disciplineService.create(dataWithTenant);

    revalidatePath('/disciplines');
    return { success: true, message: 'Disciplina criada com sucesso!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Zod Errors:", error.flatten());
      const fieldErrors = Object.entries(error.flatten().fieldErrors)
        .map(([field, messages]) => `${field}: ${messages?.join(', ') || 'Erro desconhecido'}`)
        .join('; ');
      return { success: false, message: `Erros nos campos: ${fieldErrors}`, errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao criar disciplina.';
    console.error("Erro na ação createDiscipline:", errorMessage);
    return { success: false, message: errorMessage };
  }
}

export async function updateDiscipline(id: string, data: Partial<Discipline>) {
  try {
    const validatedData = disciplineFormSchema.partial().parse(data);
    await disciplineService.update(id, validatedData);
    revalidatePath('/disciplines');
    revalidatePath(`/disciplines/${id}/edit`);
    return { success: true, message: 'Disciplina atualizada com sucesso!' };
  } catch (error) {
     if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar disciplina.';
    return { success: false, message: errorMessage };
  }
}

export async function deleteDiscipline(id: string) {
  try {
    // Adicionar verificação se está em uso antes de excluir.
    // const documentsUsingDiscipline = await documentService.findByDiscipline(name);
    // if (documentsUsingDiscipline.length > 0) {
    //   return { success: false, message: 'Disciplina está em uso e não pode ser excluída.' };
    // }
    await disciplineService.remove(id);
    revalidatePath('/disciplines');
    return { success: true, message: 'Disciplina excluída com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir disciplina.';
    return { success: false, message: errorMessage };
  }
}
