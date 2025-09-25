
'use server';

import EditDocumentForm from '@/components/document/edit-document-form';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import * as documentTypeService from '@/services/documentTypeService';
import * as disciplineService from '@/services/disciplineService';
import * as userService from '@/services/userService';
import * as locationAreaService from '@/services/locationAreaService';
import * as locationSubAreaService from '@/services/locationSubAreaService';
import * as documentService from '@/services/documentService';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

interface EditDocumentPageProps {
  params: Promise<{ id: string }>;
}

// Esta é agora uma página de servidor que busca todos os dados necessários.
export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const tenantId = user?.tenantId;
  
  if (!tenantId) {
    return <div>Usuário não autenticado</div>;
  }

  // Busca todos os dados em paralelo para otimizar o carregamento
  const [
    document,
    contracts,
    documentTypes,
    disciplines,
    users,
    locationAreas,
    locationSubAreas
  ] = await Promise.all([
    documentService.findById(id),
    ContractDrizzleService.findAll(tenantId),
    documentTypeService.findAll(tenantId),
    disciplineService.findAll(tenantId),
    userService.findAllUsers(tenantId),
    locationAreaService.findAll(tenantId),
    locationSubAreaService.findAll(tenantId)
  ]);

  // Se o documento não for encontrado, exibe uma página 404
  if (!document) {
    notFound();
  }

  // Passa os dados pré-buscados para o componente de formulário do cliente
  return (
    <div className="container mx-auto py-8 px-4">
      <EditDocumentForm
        initialDocument={document}
        contracts={contracts}
        documentTypes={documentTypes}
        disciplines={disciplines}
        users={users}
        locationAreas={locationAreas}
        locationSubAreas={locationSubAreas}
        currentUser={user}
      />
    </div>
  );
}
