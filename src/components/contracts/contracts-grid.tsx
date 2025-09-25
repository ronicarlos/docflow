'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  UserIcon,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Contract, ContractStatus, ContractFilters } from '@/types/Contract';
import { useToast } from '@/hooks/use-toast';
import { deleteContract } from '@/actions/contractActions';
import { ContractDetailModal } from './contract-detail-modal';
import NewEditContractForm from './new-edit-contract-form';
import type { User } from '@/types/User';

interface ContractsGridProps {
  contracts: Contract[];
  loading?: boolean;
  onCreateContract?: () => void;
  onEditContract?: (contract: Contract) => void;
  onDeleteContract?: (contractId: string) => void;
  onViewContract?: (contractId: string) => void;
  users?: User[];
}

const ALL_ITEMS_VALUE = 'all';

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
const getStatusVariant = (status: ContractStatus) => {
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
const getStatusLabel = (status: ContractStatus) => {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'inactive':
      return 'Inativo';
    default:
      return 'Desconhecido';
  }
};

export default function ContractsGrid({
  contracts,
  loading = false,
  onCreateContract,
  onEditContract,
  onDeleteContract,
  onViewContract,
  users = []
}: ContractsGridProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  // Estados para filtros e paginação
  const [filters, setFilters] = React.useState<ContractFilters>({});
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize] = React.useState(10);

  // Estados para modais
  const [selectedContract, setSelectedContract] = React.useState<Contract | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [editingContract, setEditingContract] = React.useState<Contract | null>(null);

  // Dados filtrados
  const filteredContracts = React.useMemo(() => {
    return contracts.filter(contract => {
      // Filtro por busca
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          contract.name.toLowerCase().includes(searchLower) ||
          contract.internalCode.toLowerCase().includes(searchLower) ||
          contract.client.toLowerCase().includes(searchLower) ||
          (contract.responsibleUser?.name || '').toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filtro por status
      if (filters.status && filters.status !== ALL_ITEMS_VALUE) {
        if (contract.status !== filters.status) return false;
      }

      // Filtro por responsável
      if (filters.responsibleUserId && filters.responsibleUserId !== ALL_ITEMS_VALUE) {
        if (contract.responsibleUserId !== filters.responsibleUserId) return false;
      }

      // Filtro por cliente
      if (filters.client && filters.client !== ALL_ITEMS_VALUE) {
        if (contract.client !== filters.client) return false;
      }

      return true;
    });
  }, [contracts, searchTerm, filters]);

  // Dados paginados
  const paginatedContracts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredContracts.slice(startIndex, endIndex);
  }, [filteredContracts, currentPage, pageSize]);

  // Total de páginas
  const totalPages = Math.ceil(filteredContracts.length / pageSize);

  // Valores únicos para filtros
  const uniqueStatuses = React.useMemo(() => {
    return Array.from(new Set(contracts.map(c => c.status)));
  }, [contracts]);

  const uniqueResponsibles = React.useMemo(() => {
    return Array.from(new Set(contracts.map(c => c.responsibleUser?.name).filter(Boolean))) as string[];
  }, [contracts]);

  const uniqueClients = React.useMemo(() => {
    return Array.from(new Set(contracts.map(c => c.client)));
  }, [contracts]);

  // Handlers
  const handleStatusFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value === ALL_ITEMS_VALUE ? undefined : value as ContractStatus }));
    setCurrentPage(1);
  };

  const handleResponsibleFilterChange = (value: string) => {
    const userId = value === ALL_ITEMS_VALUE ? undefined : 
      contracts.find(c => c.responsibleUser?.name === value)?.responsibleUserId;
    setFilters(prev => ({ ...prev, responsibleUserId: userId }));
    setCurrentPage(1);
  };

  const handleClientFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, client: value === ALL_ITEMS_VALUE ? undefined : value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleViewContract = (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract) {
      setSelectedContract(contract);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditContract = (contract: Contract) => {
    if (!contract.id || contract.id === 'undefined') {
      console.error('ID do contrato inválido para edição:', contract.id);
      toast({ 
        title: "Erro", 
        description: "ID do contrato inválido. Não é possível editar.", 
        variant: "destructive" 
      });
      return;
    }
    // Redireciona para a página de edição dedicada em vez de abrir modal
    router.push(`/contracts/${contract.id}/edit`);
  };

  const handleDeleteContract = async (contractId: string) => {
    const contract = contracts.find(c => c.id === contractId);
    if (contract && window.confirm(`Tem certeza que deseja excluir o contrato "${contract.name}"?`)) {
      try {
        const result = await deleteContract(contractId);
        if (result.success) {
          toast({
            title: 'Sucesso',
            description: 'Contrato excluído com sucesso!',
          });
          if (onDeleteContract) {
            onDeleteContract(contractId);
          }
        } else {
          toast({
            title: 'Erro',
            description: result.error || 'Erro ao excluir contrato',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
        toast({
          title: 'Erro',
          description: 'Erro interno do servidor',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingContract(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedContract(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contratos</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contratos
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie todos os contratos da sua organização
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => router.push('/contracts/direct')} 
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <Database className="h-4 w-4" />
              Novo Contrato (PostgreSQL Direto)
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, código, cliente ou responsável..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtros em linha */}
          <div className="flex flex-wrap gap-4">
            {/* Filtro por Status */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filters.status || ALL_ITEMS_VALUE} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEMS_VALUE}>Todos os Status</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {getStatusLabel(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por Responsável */}
            <Select 
              value={
                filters.responsibleUserId 
                  ? contracts.find(c => c.responsibleUserId === filters.responsibleUserId)?.responsibleUser?.name || ALL_ITEMS_VALUE
                  : ALL_ITEMS_VALUE
              } 
              onValueChange={handleResponsibleFilterChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_VALUE}>Todos os Responsáveis</SelectItem>
                {uniqueResponsibles.map((responsible) => (
                  <SelectItem key={responsible} value={responsible}>
                    {responsible}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro por Cliente */}
            <Select value={filters.client || ALL_ITEMS_VALUE} onValueChange={handleClientFilterChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ITEMS_VALUE}>Todos os Clientes</SelectItem>
                {uniqueClients.map((client) => (
                  <SelectItem key={client} value={client}>
                    {client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código Interno</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Término</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tenant ID</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedContracts.length > 0 ? (
                paginatedContracts.map((contract) => (
                  <TableRow key={contract.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {contract.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {contract.internalCode}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {contract.client}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <SafeDateCell dateString={contract.startDate} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <SafeDateCell dateString={contract.endDate} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                        {contract.responsibleUser?.name || 'Não definido'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-semibold", getStatusVariant(contract.status))}
                      >
                        {getStatusLabel(contract.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {contract.tenantId}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewContract(contract.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditContract(contract)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteContract(contract.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2" />
                      <p>Nenhum contrato encontrado com os filtros aplicados.</p>
                      {searchTerm || Object.keys(filters).length > 0 ? (
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setSearchTerm('');
                            setFilters({});
                            setCurrentPage(1);
                          }}
                          className="mt-2"
                        >
                          Limpar filtros
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Paginação */}
      {totalPages > 1 && (
        <CardFooter className="flex items-center justify-between px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * pageSize) + 1} a{' '}
            {Math.min(currentPage * pageSize, filteredContracts.length)}{' '}
            de {filteredContracts.length} contratos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm">Página</span>
              <strong className="text-sm">
                {currentPage} de {totalPages}
              </strong>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}

      {/* Modal de Detalhes do Contrato */}
      <ContractDetailModal
        contract={selectedContract}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEdit={handleEditContract}
        onDelete={(contract) => handleDeleteContract(contract.id)}
      />

      {/* Modal de Formulário de Contrato */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <NewEditContractForm
              contract={editingContract || undefined}
              users={users}
              mode={editingContract ? "edit" : "create"}
            />
          </div>
        </div>
      )}
    </Card>
  );
}