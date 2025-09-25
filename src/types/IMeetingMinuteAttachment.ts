export interface IMeetingMinuteAttachment {
    id?: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileLink: string;
    uploadedAt: string;
    meetingMinuteId?: string;
}