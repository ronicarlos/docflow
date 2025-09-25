'use server';
import { getCurrentUser } from '@/lib/auth';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { redirect } from 'next/navigation';
import { AudioMemoForm } from '@/components/audio-memo/audio-memo-form';
import { UserRole } from '@/lib/constants';

export default async function AudioMemoPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  // Buscar contratos acessíveis
  const allContracts = await ContractDrizzleService.findAll(currentUser.tenantId);
  
  // Filtrar contratos baseado no papel do usuário
  let accessibleContracts = allContracts;
  
  if (currentUser.role === 'Viewer' && currentUser.accessibleContractIds) {
    accessibleContracts = allContracts.filter(contract => 
      currentUser.accessibleContractIds?.includes(contract.id)
    );
  }

  return (
    <AudioMemoForm
      contracts={accessibleContracts}
      currentUser={currentUser}
    />
  );
}
