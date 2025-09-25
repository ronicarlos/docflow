import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Enum para status do contrato (usando o enum existente)
export const contractStatusEnum = pgEnum('ContractStatus', ['active', 'inactive']);

// Tabela de contratos (adaptada à estrutura existente)
export const contracts = pgTable('contracts', {
  id: text('id').primaryKey(),
  tenantId: text('tenantId').notNull(),
  name: text('name').notNull(),
  internalCode: text('internalCode').notNull(),
  client: text('client').notNull(),
  scope: text('scope'),
  startDate: text('startDate').notNull(),
  endDate: text('endDate').notNull(),
  status: contractStatusEnum('status').notNull().default('active'),
  responsibleUserId: text('responsibleUserId'),
  createdById: text('createdById'),
  commonRisks: text('commonRisks').array(),
  alertKeywords: text('alertKeywords').array(),
  analysisDocumentTypeIds: text('analysisDocumentTypeIds').array(),
  createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'string' }).notNull(),
});

// Tipos TypeScript derivados do schema
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;

// Schemas Zod para validação
export const insertContractSchema = z.object({
  name: z.string().min(1, 'Nome do contrato é obrigatório').min(3, 'Nome deve ter pelo menos 3 caracteres'),
  internalCode: z.string().min(1, 'Código interno é obrigatório'),
  client: z.string().min(1, 'Cliente é obrigatório'),
  scope: z.string().optional(),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  status: z.enum(['active', 'inactive']).default('active'),
  tenantId: z.string().min(1, 'Tenant ID é obrigatório'),
  responsibleUserId: z.string().optional(),
  createdById: z.string().optional(),
  commonRisks: z.array(z.string()).default([]),
  alertKeywords: z.array(z.string()).default([]),
  analysisDocumentTypeIds: z.array(z.string()).default([]),
});

export const updateContractSchema = insertContractSchema.partial().extend({
  id: z.string().min(1, 'ID é obrigatório'),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) < new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Data de início deve ser anterior à data de término',
    path: ['endDate'],
  }
);

export const selectContractSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  internalCode: z.string(),
  client: z.string(),
  scope: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['active', 'inactive']),
  responsibleUserId: z.string().nullable(),
  createdById: z.string().nullable(),
  commonRisks: z.array(z.string()).nullable(),
  alertKeywords: z.array(z.string()).nullable(),
  analysisDocumentTypeIds: z.array(z.string()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Tipos para formulários
export type CreateContractData = z.infer<typeof insertContractSchema>;
export type UpdateContractData = z.infer<typeof updateContractSchema>;