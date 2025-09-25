export interface IDiscipline {
    tenantId: Schema.Types.ObjectId;
    contractId: Schema.Types.ObjectId;
    name: string;
    code: string;
}