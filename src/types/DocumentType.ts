
import type { BaseDocument } from './User';
import type { Discipline } from './Discipline';

export interface DocumentType extends BaseDocument {
  tenantId: string;
  name: string;
  code: string;
  disciplineId: string;
  requiredFields: string[];
  requiresCriticalAnalysis: boolean;
  criticalAnalysisDays: number;
}

// O tipo populado agora reflete a estrutura correta após o .populate()
export interface PopulatedDocumentType extends Omit<DocumentType, 'disciplineId'> {
    disciplineId: string | Pick<Discipline, 'id' | 'name'>;
    discipline?: Pick<Discipline, 'id' | 'name'> | null;
}
