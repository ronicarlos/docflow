import type { User } from './User';

export interface IUser extends User {
    tenantId: string;
    contractId: string;
    accessibleContractIds: string[];
}