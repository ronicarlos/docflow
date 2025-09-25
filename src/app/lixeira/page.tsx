'use server';

import DocumentList from '@/components/dashboard/document-list';
import * as documentService from '@/services/documentService';
import { auth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';

export default async function LixeiraPage() {
  const session = await auth();
  
  if (!session?.user?.tenantId) {
    throw new Error('Usuário não autenticado');
  }
  
  const tenantId = session.user.tenantId;
  const allDocs = await documentService.findAll(tenantId, true);
  const deletedDocuments = allDocs.filter(doc => doc.isDeleted);

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Button variant="outline" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel
        </Link>
      </Button>
      <DocumentList
        documents={deletedDocuments}
        listType="deleted"
      />
    </div>
  );
}
