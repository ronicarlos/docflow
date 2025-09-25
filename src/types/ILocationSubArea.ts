export interface ILocationSubArea {
    tenantId: Schema.Types.ObjectId;
    contractId: Schema.Types.ObjectId;
    locationAreaId: Schema.Types.ObjectId;
    name: string;
    code?: string;
}