

'use client';

import type { FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Contract } from '@/types/Contract';
import type { User } from '@/types/User';
import { FileText } from "lucide-react";
import ContractActions from './contract-actions';
import { useMemo, useState } from 'react';
import EditContractModal from './edit-contract-modal';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from "@/components/ui/badge";

interface ContractsListProps {
  contracts: Contract[];
  users: User[];
}

// Função para formatar datas de forma segura
const SafeDateCell: React.FC<{ dateString: string | null | undefined }> = ({ dateString }) => {
  if (!dateString) return <span className="text-muted-foreground">-</span>;
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return <span className="text-muted-foreground">Data inválida</span>;
    return <span>{format(date, 'dd/MM/yyyy', { locale: ptBR })}</span>;
  } catch {
    return <span className="text-muted-foreground">Data inválida</span>;
  }
};

// Função para obter a variante do badge de status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Função para obter o label do status
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'inactive':
      return 'Inativo';
    default:
      return status;
  }
};

const ContractsList: FC<ContractsListProps> = ({ contracts, users }) => {
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Criar mapa de usuários para lookup rápido
  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(user => {
      map.set(user.id, user.name);
    });
    return map;
  }, [users]);

  const handleEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingContract(null);
    setIsModalOpen(false);
  };

  return (
    <>
      {contracts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código Interno</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead>Data Término</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{contract.name}</TableCell>
                <TableCell>{contract.internalCode}</TableCell>
                <TableCell>{contract.client}</TableCell>
                <TableCell>
                  <Badge className={getStatusVariant(contract.status)}>
                    {getStatusLabel(contract.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <SafeDateCell dateString={contract.startDate} />
                </TableCell>
                <TableCell>
                  <SafeDateCell dateString={contract.endDate} />
                </TableCell>
                <TableCell>
                  {contract.responsibleUserId 
                    ? userMap.get(contract.responsibleUserId) || 'N/A'
                    : 'N/A'
                  }
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{contract.tenantId}</TableCell>
                <TableCell className="text-right">
                  <ContractActions contract={contract} onEdit={handleEdit} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Nenhum contrato encontrado.</p>
          <p>Comece adicionando contratos ao sistema.</p>
        </div>
      )}
      {isModalOpen && (
        <EditContractModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            contract={editingContract}
            users={users}
        />
      )}
    </>
  );
};

export default ContractsList;
