import type { BaseDocument } from './User';

export interface IntelligentTemplateAttachment {
    id: string; // Client-side generated UUID
    fileName: string;
    fileType: string;
    fileSize: number;
    fileLink: string;
    uploadedAt: string; // ISO Date String
}

export interface IntelligentTemplateCustomAlert {
    id: string; // Client-side generated UUID
    description: string;
    type: 'legal_deadline' | 'normative_requirement' | 'financial_risk' | 'quality_issue' | 'other';
}

export interface IntelligentTemplate extends BaseDocument {
    tenantId: string;
    name: string;
    description: string;
    applicationArea: string;
    mainContractType: string;
    parentDiscipline: string;
    analyzedDocTypeIds: string[];
    keyClausesOrPoints: string[];
    riskTypesToMonitor: string[];
    customAlerts: IntelligentTemplateCustomAlert[];
    supportsForecastVsActual: boolean;
    forecastVsActualDetails?: string;
    createdByUserId: string;
    additionalFiles: IntelligentTemplateAttachment[];
}