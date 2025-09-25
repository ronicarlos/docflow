
'use server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, RefreshCw, FileType2 } from "lucide-react";
import Link from "next/link";
import * as documentTypeService from '@/services/documentTypeService';
import * as disciplineService from '@/services/disciplineService';
import { getCurrentUser } from "@/lib/auth";
import DocumentTypesList from '@/components/document-types/document-types-list';
import EditDocumentTypeModal from "@/components/document-types/edit-document-type-modal";

export default async function DocumentTypesPage() {
  const user = await getCurrentUser();
  
  if (!user || !user.tenantId) {
    return (
      <div className="container mx-auto py-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Acesso não autorizado. Faça login para continuar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tenantId = user.tenantId;
  const [documentTypes, disciplines] = await Promise.all([
    documentTypeService.findAll(tenantId),
    disciplineService.findAll(tenantId),
  ]);

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileType2 className="w-7 h-7 text-primary" />
              Gerenciamento de Tipos de Documento
            </CardTitle>
            <CardDescription>Visualize e gerencie os tipos de documento e suas propriedades.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/document-types">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Link>
            </Button>
            <EditDocumentTypeModal disciplines={disciplines}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Tipo de Documento
                </Button>
            </EditDocumentTypeModal>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentTypesList documentTypes={documentTypes} disciplines={disciplines} />
        </CardContent>
      </Card>
    </div>
  );
}
