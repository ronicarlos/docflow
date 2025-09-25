export interface IUserNotification {
    tenantId: string;
    contractId: string;
    userId: string;
    notificationMessageId: string;
    relatedDocumentId?: string;
    isRead: boolean;
    receivedAt: Date;
    messageSnapshot?: { // Para exibir rapidamente sem buscar a mensagem original sempre
        title: string;
        contentSnippet: string;
    };
    readAt?: Date;
}