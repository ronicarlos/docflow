
import type { BaseDocument, User } from './User';

export interface ContractAttachment {
    id: string;
    contractId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileLink: string;
    uploadedAt: string; // ISO Date String
    createdAt: string | Date;
    updatedAt: string;
}

export interface ContractAIAnalysis {
    id: string;
    contractId: string;
    analysisType: string;
    analysisResult: any; // JSON data
    confidence: number;
    createdAt: string | Date;
    updatedAt: string;
}

export interface UserContractAccess {
    id: string;
    userId: string;
    contractId: string;
    accessLevel: string;
    grantedAt: string;
    grantedBy: string;
    createdAt: string;
    updatedAt: string;
}

export type ContractStatus = 'active' | 'inactive';

export interface Contract extends BaseDocument {
  id: string;
  tenantId: string;
  name: string;
  internalCode: string;
  client: string;
  scope?: string | null;
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  status: ContractStatus;
  responsibleUserId: string | null;
  responsibleUser?: Pick<User, 'id' | 'name' | 'email'> | null;
  commonRisks?: string[];
  alertKeywords?: string[];
  analysisDocumentTypeIds?: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
  
  // Relacionamentos
  attachments?: ContractAttachment[];
  aiAnalyses?: ContractAIAnalysis[];
  userAccesses?: UserContractAccess[];
}

// Tipos para formulários
export interface CreateContractData {
  name: string;
  internalCode: string;
  client: string;
  scope?: string | null;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  responsibleUserId: string;
  commonRisks?: string[];
  alertKeywords?: string[];
  analysisDocumentTypeIds?: string[];
}

export interface UpdateContractData extends Partial<CreateContractData> {
  id: string;
}

// Tipos para filtros e busca
export interface ContractFilters {
  status?: ContractStatus | 'all';
  responsibleUserId?: string | null;
  client?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ContractListResponse {
  contracts: Contract[];
  total: number;
  page: number;
  limit: number;
}
