'use server';

import { revalidatePath } from 'next/cache';
import * as locationAreaService from '@/services/locationAreaService';
import type { LocationArea } from '@/types';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const locationAreaFormSchema = z.object({
  name: z.string().min(3, "Nome da localização deve ter pelo menos 3 caracteres."),
  code: z.string().optional(),
});

export async function createLocationArea(data: Partial<LocationArea>) {
  try {
    const validatedData = locationAreaFormSchema.parse(data);
    
    const user = await getCurrentUser();
    const tenantId = user?.tenantId;
    
    if (!tenantId) {
        throw new Error("Usuário não autenticado ou sem tenant válido.");
    }
    
    const dataWithTenant = { ...validatedData, tenantId };
    await locationAreaService.create(dataWithTenant);
    revalidatePath('/location-areas');
    return { success: true, message: 'Localização criada com sucesso!' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao criar localização.';
    return { success: false, message: errorMessage };
  }
}

export async function updateLocationArea(id: string, data: Partial<LocationArea>) {
  try {
    const validatedData = locationAreaFormSchema.partial().parse(data);
    await locationAreaService.update(id, validatedData);
    revalidatePath('/location-areas');
    revalidatePath(`/location-areas/${id}/edit`);
    return { success: true, message: 'Localização atualizada com sucesso!' };
  } catch (error) {
     if (error instanceof z.ZodError) {
      return { success: false, message: 'Dados inválidos.', errors: error.errors };
    }
    const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar localização.';
    return { success: false, message: errorMessage };
  }
}

export async function deleteLocationArea(id: string) {
  try {
    // TODO: Add check for dependencies (sub-areas, documents)
    await locationAreaService.remove(id);
    revalidatePath('/location-areas');
    return { success: true, message: 'Localização excluída com sucesso!' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Falha ao excluir localização.';
    return { success: false, message: errorMessage };
  }
}
