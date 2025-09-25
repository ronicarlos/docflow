
import type { BaseDocument } from './User';

export type NotificationTargetType = 'all_tenant_users' | 'specific_users' | 'specific_contract' | 'specific_roles' | 'specific_areas';

export interface NotificationMessage extends BaseDocument {
    tenantId: string;
    senderUserId: string;
    senderName: string;
    timestamp: string; // ISO Date String
    title: string;
    content: string;
    targetType: NotificationTargetType;
    targetIds?: string[];
    sentAt: string; // ISO Date String
}

export interface UserNotification extends BaseDocument {
    tenantId: string;
    userId: string;
    notificationMessageId: string;
    isRead: boolean;
    receivedAt: string; // ISO Date String
    readAt?: string; // ISO Date String
    relatedDocumentId?: string;
    messageSnapshot: {
        title: string;
        contentSnippet: string;
    };
}
