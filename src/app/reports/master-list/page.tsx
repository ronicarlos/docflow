
'use server';

import * as documentService from '@/services/documentService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import * as documentTypeService from '@/services/documentTypeService';
import * as disciplineService from '@/services/disciplineService';
import * as tenantService from '@/services/tenantService';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MasterListClient from '@/components/reports/master-list-client';

export default async function MasterListPage() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    const tenantId = currentUser.tenantId;
    
    const [initialDocuments, contracts, documentTypes, disciplines, tenantDetails] = await Promise.all([
      documentService.findAll(tenantId),
      ContractDrizzleService.findAll(tenantId),
      documentTypeService.findAll(tenantId),
      disciplineService.findAll(tenantId),
      tenantService.findTenantById(tenantId),
    ]);

    if (!tenantDetails) {
      redirect('/dashboard');
    }

    return (
      <MasterListClient
        initialDocuments={initialDocuments}
        contracts={contracts}
        documentTypes={documentTypes}
        disciplines={disciplines}
        tenantDetails={tenantDetails}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar lista mestra:', error);
    redirect('/dashboard');
  }
}
