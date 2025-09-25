

import DashboardSummary from '@/components/dashboard/dashboard-summary';
import * as documentService from '@/services/documentService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import * as documentTypeService from '@/services/documentTypeService';
import * as disciplineService from '@/services/disciplineService';
import { getCurrentUser } from '@/lib/auth';
import DashboardClientWrapper from '@/components/dashboard/dashboard-client-wrapper';
import { PopulatedDocumentType } from '@/types';
import { Card, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
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

  // Busca todos os dados necessários no servidor de forma concorrente
  const [documents, contracts, rawDocumentTypes, disciplines] = await Promise.all([
    documentService.findAll(tenantId),
    ContractDrizzleService.findAll(tenantId),
    documentTypeService.findAll(tenantId),
    disciplineService.findAll(tenantId),
  ]);

  const disciplineMap = new Map(disciplines.map(d => [d.id, d.name]));

  const documentTypes: PopulatedDocumentType[] = rawDocumentTypes.map(dt => ({
      ...dt,
      discipline: {
          id: String(dt.disciplineId),
          name: disciplineMap.get(String(dt.disciplineId)) || "Desconhecida",
          code: ''
      }
  }));

  // Lógica de cálculo dos cartões de resumo movida para o Server Component
  const summaryStats = {
    totalDocuments: documents.length,
    approvedDocuments: documents.filter(doc => doc.status === 'approved').length,
    pendingDocuments: documents.filter(doc => doc.status === 'pending_approval').length,
    rejectedDocuments: documents.filter(doc => doc.status === 'rejected').length,
    draftDocuments: documents.filter(doc => doc.status === 'draft').length,
    activeContracts: contracts.filter(c => c.status === 'active').length,
  };

  return (
    <div className="space-y-6">
      <DashboardSummary stats={summaryStats} />
      <DashboardClientWrapper 
        initialDocuments={documents}
        contracts={contracts}
        documentTypes={documentTypes}
        disciplines={disciplines}
      />
    </div>
  );
}
