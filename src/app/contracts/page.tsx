
'use server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";
import { getCurrentUser } from '@/lib/auth';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { findAllUsers } from '@/services/userService';
import ContractsList from '@/components/contracts/contracts-list';
import EditContractModalTrigger from "@/components/contracts/edit-contract-modal-trigger";

export default async function ContractsPage() {
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
  const [contracts, users] = await Promise.all([
    ContractDrizzleService.findAll(tenantId),
    findAllUsers(tenantId),
  ]);

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-7 h-7 text-primary" />
              Gerenciamento de Contratos
            </CardTitle>
            <CardDescription>Visualize e gerencie os contratos e suas propriedades.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/contracts">
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
              </Link>
            </Button>
            <EditContractModalTrigger users={users}>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Contrato
                </Button>
            </EditContractModalTrigger>
          </div>
        </CardHeader>
        <CardContent>
          <ContractsList contracts={contracts} users={users} />
        </CardContent>
      </Card>
    </div>
  );
}
