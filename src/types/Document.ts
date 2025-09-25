

import type { BaseDocument, EmbeddedUser } from './User';
import type { Contract } from './Contract';
import type { DocumentType } from './DocumentType';
import type { LocationArea, LocationSubArea } from './Location';

export type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';

export interface ApprovalEvent {
  user: EmbeddedUser;
  status: DocumentStatus;
  date: string; // ISO Date String
  observation?: string;
}

export interface Revision {
  id: string; // Client-side generated UUID
  tenantId: string;
  revisionNumber: string;
  date: string; // ISO Date String
  user: EmbeddedUser;
  observation?: string;
  status: DocumentStatus;
  approvingUserId?: string; // ID of the User designated to approve
  approvedByUserId?: string; // ID of the User who actually approved
  approvalDate?: string; // ISO Date String
  approverObservation?: string;
  fileLink: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  textContent?: string;
}

export interface Document extends BaseDocument {
    tenantId: string;
    contract: Pick<Contract, 'id' | 'name' | 'internalCode'> | string;
    documentType: Pick<DocumentType, 'id' | 'name' | 'code'> | string;
    code: string;
    currentRevision?: Revision;
    description: string;
    aiPrompt?: string; // Novo campo para instruções da IA
    area: string;
    locationArea?: Pick<LocationArea, 'id' | 'name' | 'code'> | string;
    locationSubArea?: Pick<LocationSubArea, 'id' | 'name' | 'code'> | string;
    createdBy: EmbeddedUser;
    responsibleUser: Pick<EmbeddedUser, 'id' | 'name' | 'email'> | string;
    elaborationDate: string; // ISO Date String
    lastStatusChangeDate: string; // ISO Date String
    status: DocumentStatus;
    approver?: EmbeddedUser;
    approvalHistory?: ApprovalEvent[];
    fileLink: string;
    revisions: Revision[];
    isDeleted?: boolean;
    deletedAt?: string; // ISO Date String
    validityDays?: number;
    requiresContinuousImprovement?: boolean;
    nextReviewDate?: string; // ISO Date String
    importId?: string; // ID from a batch import process
    textContent?: string; // Campo para armazenar o texto extraído do arquivo
}
