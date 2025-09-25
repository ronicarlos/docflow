
import type { BaseDocument, EmbeddedUser } from './User';
import { z } from 'zod';

export type AnalysisStatus = 'processing' | 'completed' | 'failed';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AnalysisDeviation {
  finding: string;
  documentCode: string;
  documentId: string;
  pageNumber?: number; // Added optional page number
}

export interface AnalysisAlert {
  finding: string;
  documentCode: string;
  documentId: string;
  pageNumber?: number; // Added optional page number
}

// Alinhado com o schema Prisma
export interface AnalysisResult extends BaseDocument {
    type: string;
    title: string;
    description?: string;
    result: any; // JSON no Prisma
    confidence?: number;
    riskLevel?: RiskLevel;
    recommendations: string[];
    tenantId: string;
    contractId?: string;
    executedById?: string;
    executedBy?: EmbeddedUser;
    
    // Campos legados para compatibilidade (podem ser removidos futuramente)
    parameters?: {
        dateFilterType?: 'elaborationDate' | 'approvalDate';
        dateRange?: { from?: string, to?: string };
    };
    status?: AnalysisStatus;
    summary?: string;
    conformityPoints?: string[];
    deviations?: AnalysisDeviation[];
    triggeredAlerts?: AnalysisAlert[];
    errorDetails?: string;
    completedAt?: string; // ISO string
}


// Define a schema for the analysis input, as it's used by the action.
export const ExecuteAnalysisSchema = z.object({
  contractId: z.string().min(1, "ID do Contrato é obrigatório."),
  dateFilterType: z.enum(['elaborationDate', 'approvalDate']).default('elaborationDate'),
  dateRange: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
});
export type ExecuteAnalysisInput = z.infer<typeof ExecuteAnalysisSchema>;

// Define a schema for updating an analysis result.
export const UpdateAnalysisSchema = z.object({
    summary: z.string().optional(),
    conformityPoints: z.array(z.string()).optional(),
    deviations: z.array(z.object({
        finding: z.string(),
        documentCode: z.string(),
        documentId: z.string(),
        pageNumber: z.number().optional(),
    })).optional(),
    triggeredAlerts: z.array(z.object({
        finding: z.string(),
        documentCode: z.string(),
        documentId: z.string(),
        pageNumber: z.number().optional(),
    })).optional(),
});
export type UpdateAnalysisInput = z.infer<typeof UpdateAnalysisSchema>;
