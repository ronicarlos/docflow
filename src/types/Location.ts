
import type { BaseDocument } from './User';


export interface LocationArea extends BaseDocument {
  tenantId: string;
  name: string;
  code?: string;
}

export interface LocationSubArea extends BaseDocument {
    tenantId: string;
    name: string;
    code?: string;
    locationAreaId: string; // Reference to LocationArea id
}

export type PopulatedLocationSubArea = Omit<LocationSubArea, 'locationAreaId'> & {
  locationArea?: Pick<LocationArea, 'id' | 'name' | 'code'> | null;
};
