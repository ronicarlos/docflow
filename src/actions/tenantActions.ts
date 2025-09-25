
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { updateTenant as updateTenantService } from '@/services/tenantService';
import type { ITenant } from '@/types/ITenant';

// Schema for validation, kept within the action that uses it.
const addressSchema = z.object({
    street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres."),
    number: z.string().min(1, "Número é obrigatório."),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres."),
    city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres."),
    state: z.string().min(2, "Estado (UF) deve ter 2 caracteres.").max(2, "Estado (UF) deve ter 2 caracteres."),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido. Use XXXXX-XXX ou XXXXXXXX."),
    country: z.string().min(3, "País deve ter pelo menos 3 caracteres."),
});

const tenantEditActionSchema = z.object({
  name: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres."),
  cnpj: z.string().optional(),
  commercialPhone: z.string().optional(),
  commercialEmail: z.string().email({ message: "Email comercial inválido." }).optional().or(z.literal('')),
  address: addressSchema.optional(),
  accountOwner: z.object({
    name: z.string().min(3, "Nome do responsável deve ter pelo menos 3 caracteres."),
    email: z.string().email("Email do responsável inválido."),
  }).optional(),
  logoUrl: z.string().url().optional().nullable(),
});

type TenantEditActionData = z.infer<typeof tenantEditActionSchema>;

export async function updateTenant(tenantId: string, data: TenantEditActionData) {
    try {
        const validatedData = tenantEditActionSchema.parse(data);

        // Usar o serviço do PostgreSQL em vez de dados mockados
        const updatedTenant = await updateTenantService(tenantId, {
            name: validatedData.name,
            cnpj: validatedData.cnpj,
            commercialPhone: validatedData.commercialPhone,
            commercialEmail: validatedData.commercialEmail,
            logoUrl: validatedData.logoUrl,
            address: validatedData.address,
            accountOwnerId: validatedData.accountOwner?.email ? undefined : undefined, // Será necessário buscar o ID do usuário pelo email
        });

        if (!updatedTenant) {
            throw new Error("Empresa não encontrada para atualização.");
        }
        
        revalidatePath('/minha-empresa');
        revalidatePath('/minha-empresa/edit');

        return { success: true, message: `As informações da empresa "${validatedData.name}" foram salvas com sucesso.` };

    } catch (error) {
        if (error instanceof z.ZodError) {
          return { success: false, message: 'Dados inválidos.', errors: error.flatten().fieldErrors };
        }
        const errorMessage = error instanceof Error ? error.message : 'Falha ao atualizar dados da empresa.';
        return { success: false, message: errorMessage };
    }
}
