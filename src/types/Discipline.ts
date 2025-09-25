
import type { BaseDocument } from './User';

export interface Discipline extends BaseDocument {
    tenantId: string;
    name: string;
    code?: string;
}
