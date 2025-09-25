import { notFound } from 'next/navigation';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { getCurrentUser } from '@/lib/auth';
import { EditContractClient } from './edit-contract-client';

interface EditContractPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditContractPage({ params }: EditContractPageProps) {
  const { id: contractId } = await params;

  if (!contractId) {
    notFound();
  }

  try {
    // Obter usuário atual para tenantId
    const user = await getCurrentUser();
    if (!user) {
      notFound();
    }
    
    // Carregar dados do contrato no servidor
    const contract = await ContractDrizzleService.findById(contractId, user.tenantId);
    
    if (!contract) {
      notFound();
    }

    // Passar dados para o Client Component
    return <EditContractClient contract={contract} />;
    
  } catch (error) {
    console.error('Erro ao carregar contrato:', error);
    throw error; // Next.js irá mostrar a página de erro
  }
}