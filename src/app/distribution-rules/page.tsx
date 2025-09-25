
'use server';

import * as userService from '@/services/userService';
import * as disciplineService from '@/services/disciplineService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service'; // Importar
import { auth } from '@/lib/auth';
import DistributionRulesClient from '@/components/distribution-rules/distribution-rules-client';

export default async function DistributionRulesPage() {
  const session = await auth();
  
  if (!session?.user?.tenantId) {
    throw new Error('Usuário não autenticado');
  }
  
  const tenantId = session.user.tenantId;

  // Busca todos os dados necessários no servidor
  const [users, disciplines, contracts] = await Promise.all([
    userService.findAllUsers(tenantId),
    disciplineService.findAll(tenantId),
    ContractDrizzleService.findAll(tenantId), // Buscar os contratos
  ]);

  // Renderiza o componente de cliente, passando os dados como props
  // A busca inicial de regras agora será feita no cliente ao selecionar um contrato
  return (
    <DistributionRulesClient
      initialUsers={users}
      initialDisciplines={disciplines}
      initialContracts={contracts} // Passar contratos para o cliente
    />
  );
}
