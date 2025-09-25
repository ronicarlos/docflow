
export type UserRole = 'Viewer' | 'Editor' | 'Approver' | 'Admin' | 'SuperAdmin';

export interface BaseDocument {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmbeddedUser {
  id: string;
  name: string;
  email: string;
}

export interface User extends BaseDocument {
  tenantId: string;
  name: string;
  email: string;
  password?: string;
  area: string;
  role: UserRole;
  isActive?: boolean;
  accessibleContractIds?: string[];
  disciplineIds?: string[];
  canCreateRecords?: boolean;
  canEditRecords?: boolean;
  canDeleteRecords?: boolean;
  canDownloadDocuments?: boolean;
  canApproveDocuments?: boolean;
  canPrintDocuments?: boolean;
  avatarUrl?: string | null;
}
