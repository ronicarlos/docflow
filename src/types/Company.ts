import { CompanyType as PrismaCompanyType } from '@prisma/client';

export type CompanyType = PrismaCompanyType;
export { CompanyType as CompanyTypeEnum } from '@prisma/client';

export interface Company {
  id: string;
  tenantId: string;
  nome: string;
  tipo: CompanyType;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyData {
  nome: string;
  tipo: CompanyType;
  tenantId: string;
}

export interface UpdateCompanyData {
  nome?: string;
  tipo?: CompanyType;
}