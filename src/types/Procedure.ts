
import type { BaseDocument, EmbeddedUser } from './User';
import type { Contract } from './Contract';

export interface ProcedureAttachment {
    id: string; // Client-side generated UUID
    fileName: string;
    fileType: string;
    fileSize: number;
    fileLink: string;
    uploadedAt: string; // ISO Date String
}

export type ProcedureCategory = 'corporate' | 'area' | 'contract';

export interface Procedure extends BaseDocument {
  tenantId: string;
  title: string;
  code: string;
  category: ProcedureCategory;
  area?: string; // Nome da disciplina, se category === 'area'
  contractId?: string; // ID do contrato, se category === 'contract'
  content: string; // Conteúdo principal do procedimento em Markdown
  version: string;
  status: 'draft' | 'published' | 'archived';
  attachments: ProcedureAttachment[];
  responsibleUser: Pick<EmbeddedUser, 'id', 'name', 'email'>;
  approverUser?: Pick<EmbeddedUser, 'id', 'name', 'email'>;
  publicationDate?: string; // ISO Date String
  associatedRisks?: string[];
  aiPrompt?: string; // Novo campo para o prompt da IA
}
