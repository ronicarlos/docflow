
export interface IAiAssistantMessage {
    _id: string;
    tenantId: string;
    userId: string;
    message: string;
    response?: string;
    timestamp: Date;
    sender?: 'user' | 'ai';
    attachmentPreview?: string;
    attachmentType?: string;
    attachmentName?: string;
    isGeneratingAudio?: boolean;
    hasAudio?: boolean;
    audioDataUri?: string;
}
