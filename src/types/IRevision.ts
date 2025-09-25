import {DocumentStatus} from "@/types/DocumentStatus";
import {IEmbeddedUser} from "@/types/IEmbeddedUser";

export interface IRevision {
    revisionNumber: string;
    date: Date;
    user: IEmbeddedUser;
    observation?: string;
    status: DocumentStatus;
    approvingUserId?: string;
    approvedByUserId?: string;
    approvalDate?: string;
    approverObservation?: string;
    fileLink?: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    textContent?: string;
}
