

"use client";
import type { FC } from 'react';
import type { Document, DocumentStatus, Revision } from '@/types/Document';
import type { User } from '@/types/User';
import {
  Table as ShadTableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import {
  MoreHorizontal, Eye, Edit3, Trash2, DownloadCloud, AlertCircle,
  ArrowUpDown, RefreshCw, ChevronsLeft, ChevronsRight, ChevronLeft, FilePlus2, ListChecks, WandSparkles, Printer, FileText, RotateCcw
} from 'lucide-react';

import { DOCUMENT_STATUSES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { softDeleteDocument, restoreDocument, permanentlyDeleteDocument } from '@/actions/documentActions';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from '@tanstack/react-table';
import React, { useTransition } from 'react';
import { Skeleton } from '../ui/skeleton';

interface DocumentListProps {
  documents: Document[];
  listType?: 'active' | 'deleted';
  onDocumentsChange?: () => void;
}

const StatusBadge: FC<{ status: DocumentStatus | undefined }> = ({ status }) => {
  if (!status) return <Badge variant="outline">N/A</Badge>;
  const statusInfo = DOCUMENT_STATUSES[status];
  if (!statusInfo) return <Badge variant="outline" className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />Desconhecido</Badge>;

  let badgeColorClass = "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500";
  if (status === 'approved') badgeColorClass = "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-400 dark:border-green-600";
  if (status === 'pending_approval') badgeColorClass = "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600/30 dark:text-yellow-400 dark:border-yellow-500";
  if (status === 'rejected') badgeColorClass = "bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-600";
  if (status === 'draft') badgeColorClass = "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600";

  const IconComponent = (LucideIcons as any)[statusInfo.icon] || AlertCircle;

  return (
    <Badge variant="outline" className={cn("flex items-center gap-1.5 font-semibold whitespace-nowrap", badgeColorClass, "border-transparent")}>
      <IconComponent className={cn("h-3.5 w-3.5")} />
      {statusInfo.label}
    </Badge>
  );
};

interface DocumentActionsCellProps {
  doc: Document;
  listType: 'active' | 'deleted';
  onActionComplete: () => void;
}

const DocumentActionsCell: FC<DocumentActionsCellProps> = ({ doc, listType, onActionComplete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isPermDeleteDialogOpen, setIsPermDeleteDialogOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const handleSoftDelete = () => {
    startTransition(async () => {
      const result = await softDeleteDocument(doc.id);
      if (result.success) {
        toast({ title: "Documento Movido", description: result.message });
        onActionComplete();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
      setIsDeleteDialogOpen(false);
    });
  };

  const handleRestore = () => {
    startTransition(async () => {
      const result = await restoreDocument(doc.id);
       if (result.success) {
        toast({ title: "Documento Restaurado", description: result.message });
        onActionComplete();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
    });
  };

  const handlePermDelete = () => {
    startTransition(async () => {
      const result = await permanentlyDeleteDocument(doc.id);
       if (result.success) {
        toast({ title: "Documento Excluído", description: result.message, variant: "destructive" });
        onActionComplete();
      } else {
        toast({ title: "Erro", description: result.message, variant: "destructive" });
      }
      setIsPermDeleteDialogOpen(false);
    });
  };

  const handleCloneToEdit = (originalDocId: string) => {
    if (!originalDocId || originalDocId === 'undefined') {
      console.error('ID do documento inválido para clonagem:', originalDocId);
      toast({ 
        title: "Erro", 
        description: "ID do documento inválido. Não é possível clonar.", 
        variant: "destructive" 
      });
      return;
    }
    router.push(`/upload?similarDocId=${originalDocId}`);
  };

  if (listType === 'active') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isPending}>
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ações para {doc.code}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Opções</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            {doc.id && doc.id !== 'undefined' ? (
              <Link href={`/documentos/${doc.id}`}>
                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
              </Link>
            ) : (
              <span className="flex items-center text-muted-foreground cursor-not-allowed">
                <Eye className="mr-2 h-4 w-4" /> Ver Detalhes (ID inválido)
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            {doc.id && doc.id !== 'undefined' ? (
              <Link href={`/documentos/${doc.id}/editar`}>
                <Edit3 className="mr-2 h-4 w-4" /> Editar
              </Link>
            ) : (
              <span className="flex items-center text-muted-foreground cursor-not-allowed">
                <Edit3 className="mr-2 h-4 w-4" /> Editar (ID inválido)
              </span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleCloneToEdit(doc.id)}>
            <FilePlus2 className="mr-2 h-4 w-4" /> Clonar (Carregar Semelhante)
          </DropdownMenuItem>
          {doc.currentRevision?.fileLink && (
            <DropdownMenuItem asChild>
              <a href={doc.currentRevision?.fileLink} download={doc.currentRevision?.fileName} target="_blank" rel="noopener noreferrer">
                <DownloadCloud className="mr-2 h-4 w-4" /> Baixar
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir (Mover para Lixeira)
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja mover o documento "{doc.code}" para a lixeira? Ele poderá ser restaurado posteriormente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleSoftDelete} disabled={isPending}>
                  {isPending ? 'Excluindo...' : 'Sim, Mover para Lixeira'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
  
  if (listType === 'deleted') {
    return (
      <div className="flex gap-1 justify-end">
        <Button variant="outline" size="sm" onClick={handleRestore} disabled={isPending}>
          <RotateCcw className="h-4 w-4 mr-1"/> Restaurar
        </Button>
        <AlertDialog open={isPermDeleteDialogOpen} onOpenChange={setIsPermDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isPending}>
              <Trash2 className="h-4 w-4 mr-1"/> Excluir Perm.
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Exclusão Permanente</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é irreversível. O documento "{doc.code}" será removido permanentemente. Deseja continuar?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handlePermDelete} disabled={isPending}>
                {isPending ? 'Excluindo...' : 'Sim, Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
  
  return null;
};


// Componente para renderizar datas de forma segura no cliente e evitar hydration error
const DateCell: React.FC<{ dateString?: string }> = ({ dateString }) => {
  const [formattedDate, setFormattedDate] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Esta lógica só executa no lado do cliente, após a hidratação inicial.
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

  // Renderiza um placeholder no servidor e na primeira renderização do cliente
  return <>{formattedDate ?? '...'}</>;
};

const getColumns = (
  listType: 'active' | 'deleted',
  onActionComplete: () => void,
): ColumnDef<Document>[] => [
  {
    accessorKey: 'code',
    header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Código <ArrowUpDown className="ml-2 h-4 w-4" /></Button>,
    cell: (info) => <span className="font-medium">{info.getValue<string>()}</span>,
  },
  {
    accessorKey: 'description',
    header: 'Descrição',
    cell: (info) => <span className="block max-w-sm truncate" title={info.getValue<string>()}>{info.getValue<string>()}</span>,
  },
   {
    accessorKey: 'id',
    header: 'ID do Documento',
    cell: (info) => <span className="text-xs text-muted-foreground font-mono">{info.getValue<string>()}</span>,
  },
  {
    accessorKey: 'tenantId',
    header: 'Tenant ID',
    cell: (info) => <span className="text-xs text-muted-foreground font-mono">{info.getValue<string>()}</span>,
  },
  {
    accessorFn: (row) => typeof row.contract === 'object' ? row.contract?.name : row.contract,
    id: 'contractName',
    header: 'Contrato',
  },
  {
    accessorFn: (row) => {
      if (!row.documentType) return 'N/A';
      if (typeof row.documentType === 'string') return row.documentType;
      return `${row.documentType.name} (${row.documentType.code})`;
    },
    id: 'documentTypeName',
    header: 'Tipo',
  },
  {
    accessorFn: (row) => row.currentRevision?.revisionNumber,
    id: 'revisionNumber',
    header: 'Revisão',
  },
  {
    accessorKey: 'area',
    header: 'Área/Setor',
  },
  ...(listType === 'deleted' ? [
    {
      accessorKey: 'deletedAt',
      header: 'Data de Exclusão',
      cell: ({ row }: { row: { original: Document } }) => <DateCell dateString={row.original.deletedAt} />,
    },
  ] : [
    {
      accessorFn: (row: Document) => typeof row.responsibleUser === 'object' ? row.responsibleUser?.name : row.responsibleUser,
      id: 'responsibleUserName',
      header: 'Responsável',
    },
    {
      accessorKey: 'elaborationDate',
      header: 'Data Elaboração',
      cell: ({ row }: { row: { original: Document } }) => <DateCell dateString={row.original.elaborationDate} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />,
    },
  ]),
  {
    id: 'actions',
    cell: ({ row }) => <DocumentActionsCell doc={row.original} listType={listType} onActionComplete={onActionComplete} />,
  },
];

const DocumentList: FC<DocumentListProps> = ({ documents, listType = 'active', onDocumentsChange }) => {
    const router = useRouter();
    const handleActionComplete = onDocumentsChange || (() => router.refresh());

    const tableData = React.useMemo(() => documents, [documents]);
    const tableColumns = React.useMemo(() => getColumns(listType, handleActionComplete), [listType, handleActionComplete]);
    
    const table = useReactTable({
      data: tableData,
      columns: tableColumns,
      state: {
        // A filtragem agora é feita no componente pai
      },
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });

  return (
    <Card className="shadow-lg rounded-lg border bg-card mt-6">
       <CardHeader className="border-b p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ListChecks className="w-6 h-6 text-primary" />
                  {listType === 'active' ? 'Lista Mestra de Documentos' : 'Lixeira de Documentos'}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                {listType === 'active'
                    ? 'Visualize, filtre e gerencie todos os documentos ativos no sistema.'
                    : 'Documentos excluídos que podem ser restaurados ou removidos permanentemente.'
                }
                </CardDescription>
            </div>
             <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/reports/master-list">
                      <Printer className="mr-2 h-4 w-4" />
                      Imprimir Lista Mestra (PDF)
                    </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleActionComplete}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar Lista
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <ShadTableComponent>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                    {listType === 'active' ? 'Nenhum documento encontrado com os filtros atuais.' : 'A lixeira está vazia.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </ShadTableComponent>
        </div>
      </CardContent>
       <CardFooter className="justify-between text-sm text-muted-foreground py-3 border-t flex-wrap gap-2">
            <div>
                Total de Documentos: {table.getFilteredRowModel().rows.length}
            </div>
            {table.getPageCount() > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4"/></Button>
                <span className="text-xs">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4"/></Button>
              </div>
            )}
        </CardFooter>
    </Card>
  );
};

export default DocumentList;
