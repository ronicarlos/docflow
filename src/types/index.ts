// src/types/index.ts

// Base types
export * from './User';
export * from './Contract';
export * from './Document';
export * from './DocumentType';
export * from './Discipline';
export * from './Location';
export * from './Notification';
export * from './IRevision';
export * from './Procedure';
export * from './IntelligentTemplate';
export * from './Calibration';
export * from './TrainingModule';

// Interface types (I* files)
export * from './IUser';
export * from './IDocument';
export * from './IAiAssistantMessage';
export * from './IDistributionEventLog';
export * from './IMeetingMinute';
export * from './IMeetingMinuteAttachment';
export * from './IUserNotification';
export * from './IEmbeddedUser';
export * from './IDocumentType';
export * from './ILocationArea';
export * from './IDistributionRule';
export * from './ISystemEventLog';
export * from './ITenant';
export * from './ITrainingGuideModule';
export * from './ITrainingGuideLesson';

// Enum types
export * from './UserRole';
export * from './TenantPlan';
export * from './TenantStatus';
export * from './TenantSubscriptionStatus';
export * from './NotificationTarget';
export * from './AttachmentType';
export * from './MeetingMinuteStatus';

// Aliases for better naming
export type { IAddress as Address } from './IAdress';
export type { Document as DocumentModel } from './Document';

// Analysis and other types
export * from './AnalysisResult';

// Tipo específico para o conteúdo de ajuda contextual
export interface HelpContent {
  isoRequirement: string;
  howToUse: string;
  problemSolved: string;
  auditTip: string;
}
