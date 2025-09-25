import { IEmbeddedUser } from './IEmbeddedUser';
import { DocumentStatus } from './DocumentStatus';

export interface IApprovalEvent {
    user: IEmbeddedUser;
    status: DocumentStatus;
    date: Date;
    observation?: string;
}
