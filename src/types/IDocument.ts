import { IRevision } from './IRevision';
import { IApprovalEvent } from './IApprovalEvent';
import { DocumentStatus } from './DocumentStatus';
import { IUser } from './IUser';

export interface IDocument extends Document {
    tenantId: string;
    contractId: string;
    documentTypeId: Schema.Types.ObjectId;
    code: string;
    currentRevision: IRevision;
    description?: string;
    area: string;
    locationAreaId?: Schema.Types.ObjectId;
    locationSubAreaId?: Schema.Types.ObjectId;
    createdBy: {
        _id: Schema.Types.ObjectId;
        first_name: string;
        last_name: string;
        email: string;
    };
    responsibleUserId?: Schema.Types.ObjectId;
    elaborationDate: Date;
    lastStatusChangeDate: Date;
    status: DocumentStatus;
    approver?: {
        _id: Schema.Types.ObjectId;
        first_name: string;
        last_name: string;
        email: string;
    };
    approvalHistory: IApprovalEvent[];
    fileLink?: string;
    revisions: IRevision[];
    isDeleted: boolean;
    deletedAt?: Date;
    validityDays?: number;
    requiresContinuousImprovement: boolean;
    nextReviewDate?: Date;
}
