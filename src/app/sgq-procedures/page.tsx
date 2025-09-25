
'use server';

import * as procedureService from '@/services/procedureService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import * as disciplineService from '@/services/disciplineService';
import { getCurrentUser } from '@/lib/auth';
import ProcedureListClient from '@/components/procedures/procedure-list-client';
import { Card, CardContent } from '@/components/ui/card';

export default async function SgqProceduresPage() {
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
  
  const [initialProcedures, contracts, disciplines] = await Promise.all([
    procedureService.findAll(tenantId),
    ContractDrizzleService.findAll(tenantId),
    disciplineService.findAll(tenantId),
  ]);

  return (
    <ProcedureListClient
      initialProcedures={initialProcedures}
      contracts={contracts}
      disciplines={disciplines}
    />
  );
}
