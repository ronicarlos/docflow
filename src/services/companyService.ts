import { prisma } from '@/lib/prisma';
import { Company, CreateCompanyData, UpdateCompanyData } from '@/types/Company';

export async function findAll(tenantId: string): Promise<Company[]> {
  const companies = await prisma.company.findMany({
    where: {
      tenantId: tenantId
    },
    orderBy: {
      nome: 'asc'
    }
  });

  return companies;
}

export async function findById(id: string, tenantId: string): Promise<Company | null> {
  const company = await prisma.company.findFirst({
    where: {
      id: id,
      tenantId: tenantId
    }
  });

  return company;
}

export async function create(data: CreateCompanyData): Promise<Company> {
  const company = await prisma.company.create({
    data: {
      nome: data.nome,
      tipo: data.tipo,
      tenantId: data.tenantId
    }
  });

  return company;
}

export async function update(id: string, tenantId: string, data: UpdateCompanyData): Promise<Company> {
  const company = await prisma.company.update({
    where: {
      id: id,
      tenantId: tenantId
    },
    data: {
      nome: data.nome,
      tipo: data.tipo
    }
  });

  return company;
}

export async function remove(id: string, tenantId: string): Promise<void> {
  await prisma.company.delete({
    where: {
      id: id,
      tenantId: tenantId
    }
  });
}