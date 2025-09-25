
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowUpDown, PlusCircle, MoreHorizontal, Edit, Trash2, BookCheck, Search, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Copy } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Procedure, Contract, Discipline } from "@/types";
import { useToast } from '@/hooks/use-toast';
import { deleteProcedure } from '@/actions/procedureActions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL_ITEMS_VALUE = "_ALL_";

interface ProcedureListClientProps {
  initialProcedures: Procedure[];
  contracts: Contract[];
  disciplines: Discipline[];
}

const getStatusVariant = (status: Procedure['status']) => {
    switch (status) {
        case 'published': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-400 dark:border-green-600';
        case 'draft': return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-600';
        case 'archived': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600/30 dark:text-yellow-400 dark:border-yellow-500';
        default: return 'outline';
    }
};

const getCategoryLabel = (category: Procedure['category']) => {
    switch (category) {
        case 'corporate': return 'Corporativo';
        case 'area': return 'Por Área';
        case 'contract': return 'Por Contrato';
        default: return category;
    }
}

export default function ProcedureListClient({ initialProcedures, contracts, disciplines }: ProcedureListClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [procedures, setProcedures] = React.useState(initialProcedures);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [areaFilter, setAreaFilter] = React.useState('');
    const [contractFilter, setContractFilter] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('');
    const [procedureToDelete, setProcedureToDelete] = React.useState<Procedure | null>(null);
    const [isDeleting, startDeleteTransition] = React.useTransition();

    React.useEffect(() => {
        setProcedures(initialProcedures);
    }, [initialProcedures]);

    const handleDelete = (procedureId: string) => {
        startDeleteTransition(async () => {
            const result = await deleteProcedure(procedureId);
            if (result.success) {
                toast({ title: 'Sucesso', description: result.message });
                router.refresh();
            } else {
                toast({ title: 'Erro', description: result.message, variant: 'destructive' });
            }
            setProcedureToDelete(null);
        });
    };

    const columns: ColumnDef<Procedure>[] = React.useMemo(() => [
        { accessorKey: 'code', header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>Código <ArrowUpDown className="ml-2 h-4 w-4" /></Button>},
        { accessorKey: 'title', header: 'Título' },
        { accessorKey: 'category', header: 'Categoria', cell: ({ row }) => <span className="capitalize">{getCategoryLabel(row.original.category)}</span> },
        { 
          id: 'contract',
          header: 'Contrato',
          cell: ({ row }) => {
            const contract = contracts.find(c => c.id === row.original.contractId);
            return contract ? <Badge variant="outline">{contract.name}</Badge> : 'N/A';
          }
        },
        { accessorKey: 'version', header: 'Versão' },
        { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline" className={cn(getStatusVariant(row.original.status), "font-semibold")}>{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}</Badge> },
        { accessorKey: 'updatedAt', header: 'Última Atualização', cell: ({ row }) => format(new Date(row.original.updatedAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) },
        {
            id: 'actions',
            cell: ({ row }) => (
                <div className="text-right">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                                if (!row.original.id || row.original.id === 'undefined') {
                                    console.error('ID do procedimento inválido para edição:', row.original.id);
                                    return;
                                }
                                router.push(`/sgq-procedures/${row.original.id}/edit`);
                            }}><Edit className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                                if (!row.original.id || row.original.id === 'undefined') {
                                    console.error('ID do procedimento inválido para duplicação:', row.original.id);
                                    return;
                                }
                                router.push(`/sgq-procedures/new/edit?cloneId=${row.original.id}`);
                            }}><Copy className="mr-2 h-4 w-4" /> Duplicar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setProcedureToDelete(row.original)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ], [router, contracts]);
    
    const table = useReactTable({
        data: procedures,
        columns,
        state: { 
          globalFilter,
          columnFilters: [
            { id: 'area', value: areaFilter },
            { id: 'contractId', value: contractFilter },
            { id: 'status', value: statusFilter }
          ].filter(f => f.value),
        },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="container mx-auto py-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <BookCheck className="w-7 h-7 text-primary" />
                            Gerenciador de Procedimentos do SGQ
                        </CardTitle>
                        <CardDescription>Crie, edite e gerencie os procedimentos do seu Sistema de Gestão da Qualidade.</CardDescription>
                    </div>
                    <Button onClick={() => router.push('/sgq-procedures/new/edit')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Novo Procedimento
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Input placeholder="Buscar por código ou título..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="lg:col-span-2" />
                        <Select value={areaFilter} onValueChange={v => setAreaFilter(v === ALL_ITEMS_VALUE ? '' : v)}>
                           <SelectTrigger><SelectValue placeholder="Filtrar por Área..." /></SelectTrigger>
                           <SelectContent><SelectItem value={ALL_ITEMS_VALUE}>Todas as Áreas</SelectItem>{disciplines.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={v => setStatusFilter(v === ALL_ITEMS_VALUE ? '' : v)}>
                           <SelectTrigger><SelectValue placeholder="Filtrar por Status..." /></SelectTrigger>
                           <SelectContent>
                              <SelectItem value={ALL_ITEMS_VALUE}>Todos os Status</SelectItem>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="published">Publicado</SelectItem>
                              <SelectItem value="archived">Arquivado</SelectItem>
                           </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.length ? table.getRowModel().rows.map(row => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                        ))}
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={columns.length} className="h-24 text-center">Nenhum procedimento encontrado.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <CardFooter className="justify-between">
                    <div className="text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} de {procedures.length} procedimento(s).
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="text-sm">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </CardFooter>
            </Card>

            <AlertDialog open={!!procedureToDelete} onOpenChange={() => setProcedureToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>Tem certeza que deseja excluir o procedimento "{procedureToDelete?.title}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(procedureToDelete!.id)} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">{isDeleting ? 'Excluindo...' : 'Confirmar'}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
