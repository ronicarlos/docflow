import { z } from 'zod';

/**
 * Schema de validação para contratos baseado no modelo Prisma
 * Garante consistência com a estrutura do banco de dados PostgreSQL
 */

// Schema para validação de anexos (alinhado com ContractAttachment do Prisma)
export const contractAttachmentSchema = z.object({
  id: z.string().optional(),
  fileName: z.string().min(1, 'Nome do arquivo é obrigatório'),
  fileType: z.string().min(1, 'Tipo do arquivo é obrigatório'),
  fileSize: z.number().positive('Tamanho do arquivo deve ser positivo'),
  fileLink: z.string().min(1, 'Link do arquivo é obrigatório'),
  uploadedAt: z.string().min(1, 'Data de upload é obrigatória'),
});

// Schema para validação de análise de IA (alinhado com ContractAIAnalysis do Prisma)
export const contractAIAnalysisSchema = z.object({
  id: z.string().optional(),
  analysisType: z.string().min(1, 'Tipo de análise é obrigatório'),
  result: z.any(), // JSON no Prisma
  riskLevel: z.string().optional(),
  recommendations: z.array(z.string()).default([]),
});

// Schema base para contrato (alinhado com o modelo Contract do Prisma)
export const contractBaseSchema = z.object({
  // Campos obrigatórios conforme schema Prisma
  name: z
    .string()
    .min(1, 'Nome do contrato é obrigatório')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim(),
  
  internalCode: z
    .string()
    .min(1, 'Código interno é obrigatório')
    .min(2, 'Código interno deve ter pelo menos 2 caracteres')
    .max(50, 'Código interno deve ter no máximo 50 caracteres')
    .trim()
    .regex(/^[A-Z0-9\-_]+$/i, 'Código interno deve conter apenas letras, números, hífens e underscores'),
  
  client: z
    .string()
    .min(1, 'Cliente é obrigatório')
    .min(2, 'Nome do cliente deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do cliente deve ter no máximo 255 caracteres')
    .trim(),
  
  startDate: z
    .string()
    .min(1, 'Data de início é obrigatória')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Data de início inválida'),
  
  endDate: z
    .string()
    .min(1, 'Data de término é obrigatória')
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Data de término inválida'),
  
  // Campos opcionais
  scope: z
    .string()
    .max(1000, 'Escopo deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
  
  // Status com valores válidos do enum
  status: z
    .enum(['active', 'inactive'], {
      errorMap: () => ({ message: 'Status deve ser "active" ou "inactive"' })
    })
    .default('active'),
  
  // Relacionamentos opcionais - validação de IDs
  responsibleUserId: z
    .string()
    .optional()
    .nullable(),
  
  // Arrays - garantir que não contenham strings vazias
  commonRisks: z
    .array(z.string().min(1, 'Risco não pode ser vazio'))
    .default([])
    .transform((risks) => risks.filter(risk => risk.trim() !== '')),
  
  alertKeywords: z
    .array(z.string().min(1, 'Palavra-chave não pode ser vazia'))
    .default([])
    .transform((keywords) => keywords.filter(keyword => keyword.trim() !== '')),
  
  analysisDocumentTypeIds: z
    .array(z.string().min(1, 'ID do tipo de documento não pode ser vazio'))
    .default([])
    .transform((ids) => ids.filter(id => id.trim() !== ''))
    .refine((ids) => {
      // Validar formato dos IDs se não estiver vazio - padronizado para aceitar maiúsculas e minúsculas
      return ids.every(id => /^[a-zA-Z0-9]{25}$/.test(id));
    }, 'Um ou mais IDs de tipo de documento são inválidos')
  
  // Nota: tenantId é adicionado automaticamente pelas Server Actions por segurança
});

// Schema para criação (inclui createdById) - criado antes da validação cruzada
export const createContractSchema = contractBaseSchema.extend({
  createdById: z
    .string()
    .optional()
    .nullable()
    .refine((id) => {
      if (!id) return true;
      // Padronizado para aceitar maiúsculas e minúsculas como os outros IDs
      return /^[a-zA-Z0-9]{25}$/.test(id);
    }, 'ID do criador inválido')
}).refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  },
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate']
  }
);

// Schema com validação cruzada de datas (para uso geral)
export const contractValidationSchema = contractBaseSchema.refine(
  (data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate > startDate;
  },
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate']
  }
);

// Schema para atualização (todos os campos opcionais exceto ID)
export const updateContractSchema = contractBaseSchema.partial().extend({
  id: z
    .string()
    .min(1, 'ID do contrato é obrigatório')
    .uuid('ID do contrato inválido')
}).refine(
  (data) => {
    // Só valida as datas se ambas estiverem presentes
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      return endDate > startDate;
    }
    return true; // Se uma das datas não estiver presente, não valida
  },
  {
    message: 'Data de término deve ser posterior à data de início',
    path: ['endDate']
  }
);

// Schema para filtros de busca
export const contractFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  responsibleUserId: z.string().optional(),
  startDateFrom: z.string().optional(),
  startDateTo: z.string().optional(),
  endDateFrom: z.string().optional(),
  endDateTo: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

// Tipos TypeScript derivados dos schemas
export type ContractValidationData = z.infer<typeof contractValidationSchema>;
export type CreateContractData = z.infer<typeof createContractSchema>;
export type UpdateContractData = z.infer<typeof updateContractSchema>;
export type ContractFiltersData = z.infer<typeof contractFiltersSchema>;

/**
 * Função utilitária para validar dados de contrato
 */
export function validateContractData(data: unknown, schema: z.ZodSchema) {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!formattedErrors[path]) {
          formattedErrors[path] = [];
        }
        formattedErrors[path].push(err.message);
      });
      return { success: false, data: null, errors: formattedErrors };
    }
    return { success: false, data: null, errors: { general: ['Erro de validação desconhecido'] } };
  }
}

/**
 * Função para sanitizar dados de entrada
 */
export function sanitizeContractData(data: any): any {
  return {
    ...data,
    id: data.id, // Preservar o ID para validação de update
    name: data.name?.trim(),
    internalCode: data.internalCode?.trim().toUpperCase(),
    client: data.client?.trim(),
    scope: data.scope?.trim() || null,
    responsibleUserId: data.responsibleUserId === 'none' || data.responsibleUserId === '' ? null : data.responsibleUserId,
    commonRisks: Array.isArray(data.commonRisks) 
      ? data.commonRisks.filter((risk: string) => risk && risk.trim() !== '').map((risk: string) => risk.trim())
      : [],
    alertKeywords: Array.isArray(data.alertKeywords)
      ? data.alertKeywords.filter((keyword: string) => keyword && keyword.trim() !== '').map((keyword: string) => keyword.trim())
      : [],
    analysisDocumentTypeIds: Array.isArray(data.analysisDocumentTypeIds)
      ? data.analysisDocumentTypeIds.filter((id: string) => id && id.trim() !== '')
      : []
  };
}

// Schema para busca de contratos
export const contractSearchSchema = z.object({
  query: z.string().min(1, 'Termo de busca é obrigatório'),
  filters: z.object({
    status: z.enum(['active', 'inactive']).optional(),
    responsibleUserId: z.string().uuid().optional(),
    supplier: z.string().optional(),
    startDateFrom: z.string().optional(),
    startDateTo: z.string().optional(),
    endDateFrom: z.string().optional(),
    endDateTo: z.string().optional(),
    valueFrom: z.number().positive().optional(),
    valueTo: z.number().positive().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
    sortBy: z.enum(['name', 'status', 'startDate', 'endDate', 'value', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }).optional(),
});

// Schema para estatísticas de contratos
export const contractStatsSchema = z.object({
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
}).refine((data) => {
  if (data.dateFrom && data.dateTo) {
    const dateFrom = new Date(data.dateFrom);
    const dateTo = new Date(data.dateTo);
    return dateTo >= dateFrom;
  }
  return true;
}, {
  message: 'Data final deve ser posterior à data inicial',
  path: ['dateTo'],
});

// Schema para contratos expirando
export const expiringContractsSchema = z.object({
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  days: z.number().int().positive().max(365).default(30),
});

// Tipos TypeScript derivados dos schemas
export type ContractAttachmentInput = z.infer<typeof contractAttachmentSchema>;
export type ContractAIAnalysisInput = z.infer<typeof contractAIAnalysisSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type ContractFiltersInput = z.infer<typeof contractFiltersSchema>;
export type ContractSearchInput = z.infer<typeof contractSearchSchema>;
export type ContractStatsInput = z.infer<typeof contractStatsSchema>;
export type ExpiringContractsInput = z.infer<typeof expiringContractsSchema>;

// Funções de validação utilitárias
export const validateContract = (data: unknown) => {
  return createContractSchema.safeParse(data);
};

export const validateContractUpdate = (data: unknown) => {
  return updateContractSchema.safeParse(data);
};

export const validateContractFilters = (data: unknown) => {
  return contractFiltersSchema.safeParse(data);
};

// Função para validar datas de contrato
export const validateContractDates = (startDate?: Date, endDate?: Date) => {
  if (!startDate || !endDate) return true;
  return endDate >= startDate;
};

// Função para validar valor do contrato
export const validateContractValue = (value?: number) => {
  if (value === undefined || value === null) return true;
  return value > 0 && value <= 999999999.99;
};

// Função para validar status do contrato
export const validateContractStatus = (status: string) => {
  return ['active', 'inactive'].includes(status);
};

// Mensagens de erro personalizadas
export const contractValidationMessages = {
  required: {
    name: 'Nome do contrato é obrigatório',
    status: 'Status é obrigatório',
    tenantId: 'ID do tenant é obrigatório',
  },
  invalid: {
    uuid: 'ID deve ser um UUID válido',
    email: 'Email deve ter um formato válido',
    date: 'Data deve ser válida',
    status: 'Status deve ser "active" ou "inactive"',
    fileSize: 'Arquivo deve ter no máximo 10MB',
    fileType: 'Tipo de arquivo não permitido',
  },
  length: {
    nameMax: 'Nome deve ter no máximo 255 caracteres',
    descriptionMax: 'Descrição deve ter no máximo 2000 caracteres',
    contractNumberMax: 'Número do contrato deve ter no máximo 100 caracteres',
    supplierMax: 'Nome do fornecedor deve ter no máximo 255 caracteres',
    observationsMax: 'Observações devem ter no máximo 2000 caracteres',
  },
  range: {
    valuePositive: 'Valor deve ser positivo',
    valueMax: 'Valor deve ser menor que 1 bilhão',
    endDateAfterStart: 'Data de fim deve ser posterior à data de início',
  },
};