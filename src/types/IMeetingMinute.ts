import { MeetingMinuteStatus } from "./MeetingMinuteStatus";
import {IMeetingMinuteAttachment} from "@/types/IMeetingMinuteAttachment";

export interface IMeetingMinute {
    id: string;
    tenantId: string;
    contractId: string;
    contractName: string;
    title: string;
    meetingDate: Date; // YYYY-MM-DD
    generatedMarkdown: string;
    status: MeetingMinuteStatus;
    attachments: IMeetingMinuteAttachment[];
    createdByUserId: string;
}