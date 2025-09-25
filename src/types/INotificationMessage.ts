import {NotificationTarget} from "@/types/NotificationTarget";

export interface INotificationMessage {
    tenantId: Schema.Types.ObjectId;
    contractId: Schema.Types.ObjectId;
    senderUserId: Schema.Types.ObjectId;
    senderName: string;
    senderEmail: string;
    senderAt: Date;
    title: string;
    content: string;
    targetType: NotificationTarget;
    targetIds?: string[]; // IDs dependendo do targetType (ex: userIds, contractIds, roleNames, areaNames)
    sentAt: Date; // ISO string
}