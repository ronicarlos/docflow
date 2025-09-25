export interface IDistributionEventLog {
    tenantId: string;
    contractId: string;
    documentId: string;
    eventType: string;
    eventDate: Date;
    details: string;
}
