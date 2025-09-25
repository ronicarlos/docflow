'use server';

import { revalidatePath } from 'next/cache';
import * as locationSubAreaService from '@/services/locationSubAreaService';
import type { LocationSubArea } from '@/types';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const locationSubAreaFormSchema = z.object({
  name: z.string().min(3, "Nome da sub-localização deve ter pelo menos 3 caracteres."),
  code: z.string().optional(),
  locationAreaId: z.string().min(1, "É obrigatório selecionar uma localização pai."),
});

export async function createLocationSubArea(data: Partial<LocationSubArea>) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !user.tenantId) {
      return { success: false, message: 'Usuário não autenticado ou sem tenant válido.' };
    }

    const validatedData = locationSubAreaFormSchema.parse(data);
    const dataWithTenant = { ...validatedData, tenantId: user.tenantId };

    await locationSubAreaService.create(dataWithTenant);

    revalidatePath('/location-sub-areas');
    return { success: true, message: 'Sub-área criada com sucesso!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao criar sub-área.';
    return { success: false, message: errorMessage };
  }
}

export async function updateLocationSubArea(id: string, data: Partial<LocationSubArea>) {
  try {
    const validatedData = locationSubAreaFormSchema.partial().parse(data);
    await locationSubAreaService.update(id, validatedData);
    revalidatePath('/location-sub-areas');
    revalidatePath(`/location-sub-areas/${id}/edit`);
    return { success: true, message: 'Sub-localização atualizada com sucesso!' };
  } catch (error) {
     if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar sub-localização.';
    return { success: false, message: errorMessage };
  }
}

export async function deleteLocationSubArea(id: string) {
  try {
    await locationSubAreaService.remove(id);
    revalidatePath('/location-sub-areas');
    return { success: true, message: 'Sub-localização excluída com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir sub-localização.';
    return { success: false, message: errorMessage };
  }
}
