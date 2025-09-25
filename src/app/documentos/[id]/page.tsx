// src/app/documentos/[id]/page.tsx
import * as documentService from '@/services/documentService';
import * as userService from '@/services/userService';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import DocumentDetailClient from '@/components/document/document-detail-client';

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({ params }: DocumentPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const tenantId = user?.tenantId;
  
  if (!tenantId) {
    return <div>Usuário não autenticado</div>;
  }

  // Busca todos os dados necessários no servidor, de forma concorrente.
  const [document, tenantUsers] = await Promise.all([
    documentService.findById(id),
    userService.findAllUsers(tenantId),
  ]);

  // Valida se o documento existe e pertence ao tenant atual.
  if (!document || document.isDeleted || document.tenantId !== tenantId) {
    notFound();
  }

  // Renderiza o componente de cliente, passando os dados pré-buscados.
  return (
    <DocumentDetailClient
      initialDocument={document}
      tenantUsers={tenantUsers}
    />
  );
}
