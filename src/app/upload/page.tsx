
'use server';
import DocumentUploadForm from '@/components/upload/document-upload-form';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import * as documentTypeService from '@/services/documentTypeService';
import * as disciplineService from '@/services/disciplineService';
import * as userService from '@/services/userService';
import * as locationAreaService from '@/services/locationAreaService';
import * as locationSubAreaService from '@/services/locationSubAreaService';
import * as documentService from '@/services/documentService'; // For cloning
import { getCurrentUser } from '@/lib/auth';

// This is a React Server Component
export default async function UploadPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId;
  
  if (!tenantId) {
    return <div>Usuário não autenticado</div>;
  }

  // Fetch all necessary data for the form's select fields on the server
  const [
    contracts,
    documentTypes,
    disciplines,
    users,
    locationAreas,
    locationSubAreas,
  ] = await Promise.all([
    ContractDrizzleService.findAll(tenantId),
    documentTypeService.findAll(tenantId),
    disciplineService.findAll(tenantId),
    userService.findAllUsers(tenantId),
    locationAreaService.findAll(tenantId),
    locationSubAreaService.findAll(tenantId),
  ]);

  // Handle cloning logic on the server
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const similarDocId = resolvedSearchParams?.similarDocId as string | undefined;
  let originalDocForClone = null;
  if (similarDocId) {
    originalDocForClone = await documentService.findById(similarDocId);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <DocumentUploadForm
        // Pass all fetched data to the client component
        contracts={contracts}
        documentTypes={documentTypes}
        disciplines={disciplines}
        users={users}
        locationAreas={locationAreas}
        locationSubAreas={locationSubAreas}
        originalDocForClone={originalDocForClone}
      />
    </div>
  );
}
