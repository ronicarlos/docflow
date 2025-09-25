
'use server';

import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { findTenantById } from '@/services/tenantService';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import MyCompanyEditForm from '@/components/my-company/edit-my-company-form';

// Esta é agora uma página de servidor que busca os dados para o formulário
export default async function EditMinhaEmpresaPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin')) {
    redirect('/dashboard');
  }

  const tenantDetails = await findTenantById(currentUser.tenantId);
  if (!tenantDetails) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/minha-empresa">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <MyCompanyEditForm tenant={tenantDetails} />
    </div>
  );
}
