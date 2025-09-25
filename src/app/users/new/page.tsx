
import NewUserForm from '@/components/users/new-user-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as disciplineService from '@/services/disciplineService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

// Esta é agora uma página de servidor que busca os dados para os selects
export default async function NewUserPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  // Busca os dados diretamente do banco de dados no servidor
  const disciplines = await disciplineService.findAll(currentUser.tenantId);
  const contracts = await ContractDrizzleService.findAll(currentUser.tenantId);

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/users">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <NewUserForm disciplines={disciplines} contracts={contracts} />
    </div>
  );
}
