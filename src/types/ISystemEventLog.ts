import {SYSTEM_LOG_ACTION_TYPES, SYSTEM_LOG_ENTITY_TYPES} from "@/lib/constants";

type SystemLogActionType = keyof typeof SYSTEM_LOG_ACTION_TYPES;
type SystemLogEntityType = keyof typeof SYSTEM_LOG_ENTITY_TYPES | string;

export interface ISystemEventLog {
    tenantId: Schema.Types.ObjectId;
    contractId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    userName: string;
    userEmail: string;
    actionType: SystemLogActionType;
    entityType: SystemLogEntityType;
    entityId?: string;
    entityDescription?: string;
    details: string;
    ipAddress?: string;
}