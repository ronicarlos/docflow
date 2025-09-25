'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel, 
  flexRender, 
  type ColumnDef 
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowUpDown, 
  Search, 
  Filter, 
  X, 
  ChevronsLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsRight,
  FileText,
  Calendar,
  User as UserIcon,
  Building
} from "lucide-react";
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from "@/lib/utils";
import type { Contract, User } from '@/types';
import ContractActions from './contract-actions';
import { Skeleton } from '../ui/skeleton';
import useLocalStorage from '@/hooks/use-local-storage';

const ALL_ITEMS_VALUE = "_ALL_";

interface ContractsListClientProps {
  contracts: Contract[];
  users: User[];
  tenantId: string;
}

interface FilterState {
  globalFilter: string;
  statusFilter: string;
  responsibleFilter: string;
  clientFilter: string;
  showFilters: boolean;
}

const defaultFilterState: FilterState = {
  globalFilter: '',
  statusFilter: '',
  responsibleFilter: '',
  clientFilter: '',
  showFilters: false,
};

const getStatusLabel = (statusKey: Contract["status"]): string => {
  return statusKey === 'active' ? 'Ativo' : 'Inativo';
};

const getStatusVariant = (status: Contract['status']) => {
  return status === 'active' 
    ? 'text-green-700 border-green-500 bg-green-100 dark:bg-green-700/20 dark:text-green-400 dark:border-green-600'
    : 'text-red-700 border-red-500 bg-red-100 dark:bg-red-700/20 dark:text-red-400 dark:border-red-600';
};

// Componente para renderizar datas de forma segura
const SafeDateCell: React.FC<{ dateString?: string }> = ({ dateString }) => {
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    try {
      if (dateString) {
        const date = parseISO(dateString);
        if (isValid(date)) {
          setFormattedDate(format(date, 'dd/MM/yyyy', { locale: ptBR }));
        } else {
          setFormattedDate("Data inválida");
        }
      } else {
        setFormattedDate("N/A");
      }
    } catch (e) {
      setFormattedDate("Erro");
    }
  }, [dateString]);

  if (formattedDate === null) {
    return <Skeleton className="h-4 w-[80px]" />;
  }
  
  return <span>{formattedDate}</span>;
};

export default function ContractsListClient({ contracts, users, tenantId }: ContractsListClientProps) {
  const router = useRouter();
  
  // Estados para filtros
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [responsibleFilter, setResponsibleFilter] = React.useState('');
  const [clientFilter, setClientFilter] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);

  // Persistência de filtros no localStorage (simplificada)
  const [, setFilterState] = useLocalStorage<FilterState>(
    'contracts-filters',
    defaultFilterState
  );

  // Sincronizar mudanças de filtros com localStorage (debounced)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilterState({
        globalFilter,
        statusFilter,
        responsibleFilter,
        clientFilter,
        showFilters,
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [globalFilter, statusFilter, responsibleFilter, clientFilter, showFilters, setFilterState]);

  // Definição das colunas
  const columns: ColumnDef<Contract>[] = React.useMemo(() => [
    {
      accessorKey: 'id',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-xs text-muted-foreground max-w-[100px] truncate" title={row.getValue('id')}>
          {row.getValue('id')}
        </div>
      ),
      size: 100,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Nome do Contrato
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('name')}</div>
      ),
    },
    {
      accessorKey: 'internalCode',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Código Interno
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'client',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-auto p-0 font-semibold"
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'startDate',
      header: 'Data de Início',
      cell: ({ row }) => <SafeDateCell dateString={row.getValue('startDate')} />,
    },
    {
      accessorKey: 'endDate',
      header: 'Data de Término',
      cell: ({ row }) => <SafeDateCell dateString={row.getValue('endDate')} />,
    },
    {
      id: 'responsibleUser',
      accessorFn: (row) => row.responsibleUser?.name || 'Não definido',
      header: 'Responsável',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-muted-foreground" />
          {row.original.responsibleUser?.name || 'Não definido'}
        </div>
      ),
      filterFn: 'includesString',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn("font-semibold", getStatusVariant(row.getValue('status')))}
        >
          {getStatusLabel(row.getValue('status'))}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value === '' || row.getValue(id) === value;
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="text-right">
          <ContractActions 
            contract={row.original}
          />
        </div>
      ),
    },
  ], []);

  // Dados filtrados para a tabela
  const filteredContracts = React.useMemo(() => {
    return contracts.filter(contract => {
      // Filtro por status
      if (statusFilter && statusFilter !== ALL_ITEMS_VALUE) {
        if (contract.status !== statusFilter) return false;
      }

      // Filtro por responsável
      if (responsibleFilter && responsibleFilter !== ALL_ITEMS_VALUE) {
        if (contract.responsibleUserId !== responsibleFilter) return false;
      }

      // Filtro por cliente
      if (clientFilter && clientFilter !== ALL_ITEMS_VALUE) {
        if (!contract.client?.toLowerCase().includes(clientFilter.toLowerCase())) return false;
      }

      return true;
    });
  }, [contracts, statusFilter, responsibleFilter, clientFilter]);

  // Função customizada de filtro global
  const globalFilterFn = (row: any, columnId: string, value: string) => {
    const search = value.toLowerCase();
    
    // Buscar em múltiplas colunas
    const searchableValues = [
      row.original.name,
      row.original.internalCode,
      row.original.client,
      row.original.responsible,
      row.original.status
    ].filter(Boolean);

    return searchableValues.some(val => 
      String(val).toLowerCase().includes(search)
    );
  };

  // Configuração da tabela
  const table = useReactTable({
    data: filteredContracts,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setGlobalFilter('');
    setStatusFilter('');
    setResponsibleFilter('');
    setClientFilter('');
    table.resetGlobalFilter();
    table.resetColumnFilters();
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = globalFilter || statusFilter || responsibleFilter || clientFilter;

  // Obter lista única de clientes para o filtro
  const uniqueClients = React.useMemo(() => {
    const clients = contracts.map(contract => contract.client).filter(Boolean);
    return [...new Set(clients)].sort();
  }, [contracts]);

  // Obter lista única de responsáveis para o filtro
  const uniqueResponsibles = React.useMemo(() => {
    const responsibles = contracts
      .map(contract => contract.responsibleUser?.name)
      .filter(Boolean) as string[];
    return [...new Set(responsibles)].sort();
  }, [contracts]);

  if (contracts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg font-semibold">Nenhum contrato encontrado.</p>
        <p>Comece adicionando um novo contrato para visualizar aqui.</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardContent className="p-6">
        {/* Barra de busca e filtros */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código ou cliente..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="shrink-0"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {[statusFilter, responsibleFilter, clientFilter].filter(Boolean).length}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="shrink-0"
              >
                <X className="mr-2 h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_ALL_">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Cliente</label>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os clientes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_ALL_">Todos os clientes</SelectItem>
                    {uniqueClients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Responsável</label>
                <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os responsáveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_ALL_">Todos os responsáveis</SelectItem>
                    {uniqueResponsibles.map((responsible) => (
                      <SelectItem key={responsible} value={responsible}>
                        {responsible}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Tabela */}
        <div className="rounded-md border mt-6">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2" />
                      <p>Nenhum contrato encontrado com os filtros aplicados.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Paginação */}
      <CardFooter className="flex items-center justify-between px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} a{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          de {table.getFilteredRowModel().rows.length} contratos
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm">Página</span>
            <strong className="text-sm">
              {table.getState().pagination.pageIndex + 1} de{' '}
              {table.getPageCount()}
            </strong>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}