'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Contract } from '@/types/Contract';
import { ContractEditForm } from '@/components/contracts/contract-edit-form';

interface EditContractClientProps {
  contract: Contract;
}

export function EditContractClient({ contract }: EditContractClientProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push('/contracts');
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Contrato</h1>
            <p className="text-muted-foreground">
              {contract.name} - {contract.internalCode}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractEditForm contract={contract} />
        </CardContent>
      </Card>
    </div>
  );
}