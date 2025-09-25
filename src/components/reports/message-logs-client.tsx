
"use client";

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import type { UserNotification, NotificationMessage, User, NotificationTargetType, ITenant } from "@/types";
import { MailCheck, ArrowUpDown, ChevronDown, ChevronRight, ListFilter, Columns, Download, FileSpreadsheet, FileText as PdfIcon, RefreshCw, ChevronsLeft, ChevronsRight, ChevronLeft, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter } from "next/navigation";
import * as dateFns from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';


import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type GroupingState,
  type ExpandedState,
  type VisibilityState,
  type ColumnFiltersState,
  type HeaderContext,
  getPaginationRowModel,
  type PaginationState,
  type ColumnPinningState,
} from '@tanstack/react-table';

interface CombinedMessageLog {
  userNotificationId: string;
  userId: string; // Destinatário
  userName: string;
  isRead: boolean;
  readAt?: string;
  receivedAt: string;
  messageId: string;
  senderUserId: string;
  senderName: string;
  messageTimestamp: string;
  messageTitle: string;
  messageContentSnippet: string;
  messageTargetType: NotificationTargetType;
}

const NO_GROUPING_KEY = "_NONE_GROUPING_";
const ALL_ITEMS_FILTER = "_ALL_ITEMS_";

const SafeDateCell: React.FC<{ dateString?: string }> = ({ dateString }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if (!dateString) {
            setFormattedDate('N/A');
            return;
        }
        try {
            const date = dateFns.parseISO(dateString);
            if (dateFns.isValid(date)) {
                setFormattedDate(dateFns.format(date, "dd/MM/yy HH:mm", { locale: ptBR }));
            } else {
                setFormattedDate('Data Inválida');
            }
        } catch (e) {
            setFormattedDate('Erro de Data');
        }
    }, [dateString]);
    
    if (formattedDate === null) {
        return <Skeleton className="h-4 w-24" />;
    }
    
    return <span className="text-sm whitespace-nowrap">{formattedDate}</span>;
};


const getMessageLogColumns = (): ColumnDef<CombinedMessageLog>[] => [
  {
    id: 'expander',
    header: ({ table }: HeaderContext<CombinedMessageLog, unknown>) => (
      table.getState().grouping.length > 0 ? (
        <Button variant="ghost" size="sm" onClick={table.getToggleAllRowsExpandedHandler()} className="p-1 h-8 w-8">
          {table.getIsAllRowsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      ) : null
    ),
    cell: ({ row }) => (
      row.getCanExpand() ? (
        <Button variant="ghost" size="sm" onClick={row.getToggleExpandedHandler()} className="p-1 h-8 w-8">
          {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      ) : null
    ),
    size: 60,
    meta: { headerLabel: 'Expandir' },
  },
  {
    accessorKey: 'messageTimestamp',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Data/Hora Envio <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Data/Hora..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => <SafeDateCell dateString={info.getValue() as string} />,
    meta: { headerLabel: 'Data/Hora Envio (Mensagem)' },
    size: 180,
  },
  {
    accessorFn: (row) => {
      if (!row.messageTimestamp) return 'N/A';
      const date = dateFns.parseISO(row.messageTimestamp);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    },
    id: 'yearMonthSent',
    header: ({ column }) => (
       <div className="flex flex-col gap-1 min-w-[150px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Ano/Mês Envio <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar AAAA-MM..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => info.getValue() as string,
    meta: { headerLabel: 'Ano/Mês Envio' },
  },
  {
    accessorKey: 'messageTitle',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[250px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Título da Mensagem <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Título..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => <span className="font-medium text-sm">{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Título da Mensagem' },
    size: 300,
  },
  {
    accessorKey: 'senderName',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Remetente <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Remetente..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => <span className="text-sm">{info.getValue() as string || 'Sistema'}</span>,
    meta: { headerLabel: 'Remetente' },
  },
  {
    accessorKey: 'userName', // Nome do destinatário
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Destinatário <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Destinatário..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => <span className="text-sm">{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Destinatário' },
  },
  {
    accessorKey: 'isRead',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[150px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Status Leitura <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Select
            value={(column.getFilterValue() as string) ?? ALL_ITEMS_FILTER}
            onValueChange={value => column.setFilterValue(value === ALL_ITEMS_FILTER ? null : value)}
        >
            <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Todos Status" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL_ITEMS_FILTER}>Todos Status</SelectItem>
                <SelectItem value="true">Lida</SelectItem>
                <SelectItem value="false">Não Lida</SelectItem>
            </SelectContent>
        </Select>
      </div>
    ),
    cell: (info) => {
      const isRead = info.getValue() as boolean;
      return isRead ? 
        <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-400 dark:border-green-600"><CheckCircle2 className="mr-1 h-3 w-3"/>Lida</Badge> :
        <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-700/20 dark:text-amber-400 dark:border-amber-600"><XCircle className="mr-1 h-3 w-3"/>Não Lida</Badge>;
    },
    meta: { headerLabel: 'Status Leitura' },
    filterFn: (row, id, filterValue) => {
        const rowValue = row.getValue(id);
        if (filterValue === null || filterValue === undefined) return true;
        return String(rowValue) === filterValue;
    }
  },
  {
    accessorKey: 'readAt',
    header: "Data Leitura",
    cell: (info) => <SafeDateCell dateString={info.getValue() as string} />,
    meta: { headerLabel: 'Data Leitura' },
  },
  {
    accessorKey: 'messageTargetType',
    header: "Tipo de Alvo",
    cell: (info) => <span className="text-sm capitalize">{(info.getValue() as string)?.replace(/_/g, ' ') || 'N/A'}</span>,
    meta: { headerLabel: 'Tipo de Alvo (Mensagem)' },
  },
];

const groupingOptions = [
  { value: NO_GROUPING_KEY, label: 'Tabela Simples' },
  { value: 'senderName', label: 'Agrupar por Remetente' },
  { value: 'userName', label: 'Agrupar por Destinatário' },
  { value: 'messageTargetType', label: 'Agrupar por Tipo de Alvo' },
  { value: 'isRead', label: 'Agrupar por Status de Leitura' },
  { value: 'yearMonthSent', label: 'Agrupar por Ano/Mês Envio' },
];

interface MessageLogsClientProps {
  initialLogs: CombinedMessageLog[];
}


export default function MessageLogsClient({ initialLogs }: MessageLogsClientProps) {
  const router = useRouter();
  const [combinedLogs] = useState<CombinedMessageLog[]>(initialLogs);
  const [clientMounted, setClientMounted] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'messageTimestamp', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [groupingMode, setGroupingMode] = useState<'single' | 'multiple'>('single');
  const [activeGroupingIds, setActiveGroupingIds] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ yearMonthSent: false });
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 });


  useEffect(() => {
    setClientMounted(true);
  }, []);

  const memoizedColumns = React.useMemo<ColumnDef<CombinedMessageLog>[]>(() => {
    if (!clientMounted) return [];
    return getMessageLogColumns();
  }, [clientMounted]);

  const table = useReactTable({
    data: combinedLogs,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
      grouping: activeGroupingIds,
      expanded,
      columnVisibility,
      columnPinning,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGroupingChange: setActiveGroupingIds,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enablePinning: true,
    autoResetPageIndex: false,
  });

  const handleGroupingModeChange = (mode: 'single' | 'multiple') => {
    setGroupingMode(mode);
    setActiveGroupingIds([]);
  };

  const handleSingleGroupChange = (columnId: string) => {
    setActiveGroupingIds(columnId === NO_GROUPING_KEY ? [] : [columnId]);
  };

  const handleMultipleGroupToggle = (columnId: string) => {
    setActiveGroupingIds(prev =>
      prev.includes(columnId) ? prev.filter(id => id !== columnId) : [...prev, columnId]
    );
  };

  const escapeCsvCell = (value: any): string => {
    const stringValue = String(value === null || value === undefined ? '' : value);
    if (/[",\r\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExport = (formatType: 'csv' | 'excel' | 'pdf') => {
    if (!clientMounted || !table || table.getFilteredRowModel().rows.length === 0) {
        alert("A tabela ainda não está pronta ou não há dados para exportar.");
        return;
    }
    const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== 'actions' && col.id !== 'expander');
    const headers = visibleColumns.map(col => (col.columnDef.meta as any)?.headerLabel || col.id);
    const dataRows = table.getFilteredRowModel().rows;
  
    if (formatType === 'pdf') {
      let htmlContent = `
        <!DOCTYPE html>
        <html><head><title>Log de Mensagens e Documentos Enviados</title><meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; } @page { size: A4 landscape; margin: 1cm !important; } body { margin: 1cm !important; }
            .print-header { display: block; position: fixed; width: calc(100% - 2cm); left: 1cm; top: 0.5cm; text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 0.5cm; }
            .print-footer { display: block; position: fixed; width: calc(100% - 2cm); left: 1cm; bottom: 0.5cm; text-align: center; font-size: 8pt; } .print-footer .line { border-top: 1px solid #000; margin-bottom: 3px; } .print-footer .page-number::after { content: "Página " counter(page) " de " counter(pages); }
            table { width: 100%; border-collapse: collapse; font-size: 7pt; table-layout: auto; margin-top: calc(0.5cm + 30px); margin-bottom: calc(0.5cm + 20px); }
            th, td { border: 1px solid #ccc; padding: 3px; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px;} th { background-color: #f2f2f2; font-weight: bold; }
            .col-messageTitle, .col-messageContentSnippet { max-width: 200px !important; white-space: normal !important; }
        </style></head><body>
        <div class="print-header">Log de Mensagens e Documentos Enviados</div><table><thead><tr>
        ${headers.map(h => `<th>${escapeCsvCell(h)}</th>`).join('')}
        </tr></thead><tbody>
        ${dataRows.map(row => `<tr>
            ${visibleColumns.map(col => {
                let cellValue = row.getValue(col.id);
                let cellClass = '';
                if (col.id === 'messageTitle' || col.id === 'messageContentSnippet') cellClass = `class="col-${col.id}"`;

                if (col.id === 'messageTimestamp' || col.id === 'receivedAt' || col.id === 'readAt') {
                    if (cellValue) cellValue = dateFns.format(dateFns.parseISO(cellValue as string), "dd/MM/yy HH:mm", { locale: ptBR });
                } else if (col.id === 'isRead') {
                    cellValue = (cellValue as boolean) ? 'Lida' : 'Não Lida';
                }
                return `<td ${cellClass}>${escapeCsvCell(cellValue)}</td>`;
            }).join('')}
        </tr>`).join('')}
        </tbody></table>
        <div class="print-footer"><div class="line"></div>Data da Extração: ${new Date().toLocaleDateString('pt-BR')}
        <span class="page-number" style="float: right;"></span></div>
        </body></html>`;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open(); printWindow.document.write(htmlContent); printWindow.document.close();
        setTimeout(() => { try { printWindow.focus(); printWindow.print(); } catch (e) { console.error("Erro ao imprimir:", e); alert("Não foi possível iniciar a impressão."); } }, 1000);
      } else { alert("Não foi possível abrir uma nova janela para a impressão."); }
      return;
    }
  
    let csvContent = "\uFEFF"; 
    csvContent += headers.map(h => escapeCsvCell(h)).join(';') + '\r\n';
    dataRows.forEach(row => {
      const rowData = visibleColumns.map(col => {
        let cellValue = row.getValue(col.id);
         if (col.id === 'messageTimestamp' || col.id === 'receivedAt' || col.id === 'readAt') {
            if (cellValue) cellValue = dateFns.format(dateFns.parseISO(cellValue as string), "dd/MM/yyyy HH:mm:ss", { locale: ptBR });
        } else if (col.id === 'isRead') {
            cellValue = (cellValue as boolean) ? 'Lida' : 'Não Lida';
        }
        return escapeCsvCell(cellValue);
      });
      csvContent += rowData.join(';') + '\r\n';
    });
    const filename = formatType === 'excel' ? `log_mensagens_para_excel.csv` : `log_mensagens.csv`;
    const mimeType = 'text/csv;charset=utf-8;';
    const blob = new Blob([csvContent], { type: mimeType });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url); link.setAttribute("download", filename);
    document.body.appendChild(link); link.click();
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 500);
  };
  
    if (!clientMounted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-xl rounded-lg">
          <CardHeader className="border-b">
             <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-primary">
                    <MailCheck className="w-7 h-7" />
                    Log de Mensagens e Documentos Enviados
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">
                    Histórico de todas as mensagens e notificações de documentos enviadas aos usuários.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4"> <Skeleton className="h-10 w-full md:w-1/3" /> <Skeleton className="h-96 w-full" /> <Skeleton className="h-8 w-full md:w-1/4" /> </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl rounded-lg">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <div>
                <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-primary">
                <MailCheck className="w-7 h-7" />
                Log de Mensagens e Documentos Enviados
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-1">
                Histórico de todas as mensagens e notificações de documentos enviadas aos usuários.
                </CardDescription>
            </div>
             <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/30 flex flex-wrap items-start gap-x-6 gap-y-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Modo de Agrupamento:</Label>
              <RadioGroup value={groupingMode} onValueChange={handleGroupingModeChange} className="flex gap-4">
                <div className="flex items-center space-x-2"><RadioGroupItem value="single" id="single-group-msg" /><Label htmlFor="single-group-msg" className="font-normal cursor-pointer text-sm">Simples</Label></div>
                <div className="flex items-center space-x-2"><RadioGroupItem value="multiple" id="multiple-group-msg" /><Label htmlFor="multiple-group-msg" className="font-normal cursor-pointer text-sm">Múltiplo</Label></div>
              </RadioGroup>
            </div>
            {groupingMode === 'single' ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="singleGroupingSelectMsg" className="text-sm font-medium flex items-center"><ListFilter className="h-4 w-4 mr-1.5 text-muted-foreground" />Agrupar por (Simples):</Label>
                <Select value={activeGroupingIds[0] || NO_GROUPING_KEY} onValueChange={handleSingleGroupChange}>
                  <SelectTrigger id="singleGroupingSelectMsg" className="w-[240px] bg-background shadow-sm h-9 text-sm"><SelectValue placeholder="Selecione como visualizar" /></SelectTrigger>
                  <SelectContent>{groupingOptions.map(opt => (<SelectItem key={opt.value} value={opt.value} className="text-sm">{opt.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Label htmlFor="multiGroupingDropdownMsg" className="text-sm font-medium flex items-center"><ListFilter className="h-4 w-4 mr-1.5 text-muted-foreground" />Agrupamento Múltiplo:</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="outline" id="multiGroupingDropdownMsg" className="w-[240px] justify-between bg-background shadow-sm h-9 text-sm">{activeGroupingIds.length > 0 ? `Árvore (${activeGroupingIds.length} nível(eis))` : 'Selecionar Colunas para Agrupar'}<ChevronDown className="ml-2 h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[280px]">
                    <DropdownMenuItem onSelect={() => setActiveGroupingIds([])} className="text-sm">Tabela Simples (Limpar)</DropdownMenuItem>
                    <DropdownMenuSeparator /><DropdownMenuLabel className="text-xs">Agrupar por (ordem importa):</DropdownMenuLabel>
                    {groupingOptions.filter(opt => opt.value !== NO_GROUPING_KEY).map(col => (<DropdownMenuCheckboxItem key={col.value} checked={activeGroupingIds.includes(col.value)} onCheckedChange={() => handleMultipleGroupToggle(col.value)} className="text-sm">{col.label.replace('Agrupar por ', '')}</DropdownMenuCheckboxItem>))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
            <div className="flex flex-col gap-2 mt-auto">
              <Label className="text-sm font-medium sr-only" htmlFor="columnVisibilityDropdownMsg">Colunas Visíveis</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" id="columnVisibilityDropdownMsg" className="bg-background shadow-sm h-9 text-sm"><Columns className="mr-2 h-4 w-4" />Colunas</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs">Exibir/Ocultar Colunas</DropdownMenuLabel><DropdownMenuSeparator />
                  {table.getAllLeafColumns().filter(c => c.id !== 'expander').map(column => (<DropdownMenuCheckboxItem key={column.id} className="capitalize text-sm" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>{(column.columnDef.meta as any)?.headerLabel || column.id}</DropdownMenuCheckboxItem>))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <Label className="text-sm font-medium sr-only" htmlFor="exportDropdownMsg">Exportar Dados</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" id="exportDropdownMsg" className="bg-background shadow-sm h-9 text-sm"><Download className="mr-2 h-4 w-4" />Exportar</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')} className="text-sm"><FileSpreadsheet className="mr-2 h-4 w-4" />Exportar para CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('excel')} className="text-sm"><FileSpreadsheet className="mr-2 h-4 w-4" />Exportar para Excel (via CSV)</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-sm"><PdfIcon className="mr-2 h-4 w-4" />Exportar para PDF (A4)</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {table.getRowModel().rows.length === 0 ? (
             <div className="text-center py-16 text-muted-foreground">
              <MailCheck className="mx-auto h-16 w-16 mb-6 text-gray-400 dark:text-gray-500" />
              <p className="text-xl font-semibold mb-2">Nenhum log de mensagem encontrado.</p>
              <p className="text-sm">Os logs aparecerão aqui quando mensagens forem enviadas ou documentos distribuídos.</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-450px)] overflow-auto relative">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          className={cn("py-2.5 px-3 text-left align-middle font-medium text-muted-foreground bg-card", header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-muted/50' : '', header.column.getIsPinned() ? 'sticky bg-card shadow-md z-20' : '')}
                          style={{ width: header.getSize() !== 150 ? header.getSize() : undefined, left: header.column.getIsPinned() === 'left' ? `${header.column.getStart('left')}px` : undefined }}
                        >
                           {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map(row => (
                    <React.Fragment key={row.id}>
                      {row.getIsGrouped() ? (
                        <TableRow className="bg-muted/30 hover:bg-muted/40 dark:bg-muted/20 dark:hover:bg-muted/30 transition-colors">
                          <TableCell colSpan={table.getVisibleLeafColumns().length} className="py-2" style={{ paddingLeft: `${row.depth * 1.5 + 0.75}rem` }}>
                            <Button variant="ghost" size="sm" onClick={row.getToggleExpandedHandler()} className="flex items-center gap-2 text-left w-auto p-1 hover:bg-primary/10 h-7">
                              {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <span className="font-semibold text-primary text-xs">{(groupingOptions.find(opt => opt.value === row.groupingColumnId)?.label?.replace('Agrupar por ', '') || row.groupingColumnId)}:</span>
                              <span className="text-xs">{String(row.getValue(row.groupingColumnId!))}</span>
                              <span className="text-xs text-muted-foreground ml-1.5">(Mostrando {row.subRows.length} log(s))</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow className="hover:bg-muted/10 dark:hover:bg-muted/50 transition-colors text-sm">
                          {row.getVisibleCells().map((cell, cellIndex) => (
                            <TableCell key={cell.id} className={cn("py-2 px-3", cell.column.getIsPinned() === 'left' ? 'sticky bg-card shadow-sm z-10' : '')}
                              style={{ paddingLeft: cell.column.getIsPinned() !== 'left' && row.depth > 0 && cellIndex === (activeGroupingIds.length > 0 ? 1 : 0) ? `${row.depth * 1.5 + 0.75}rem` : (cell.column.getIsPinned() === 'left' ? '0.75rem' : undefined), left: cell.column.getIsPinned() === 'left' ? `${cell.column.getStart('left')}px` : undefined }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
         <CardFooter className="py-3 border-t text-sm text-muted-foreground flex-wrap justify-between gap-2">
            <div>
                Total de Logs de Mensagens: {combinedLogs.length} | Exibidos na Grid: {table.getFilteredRowModel().rows.length}
            </div>
            {table.getPaginationRowModel().rows.length > 0 && table.getPageCount() > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4"/></Button>
                <span className="text-xs">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4"/></Button>
                <Select value={String(table.getState().pagination.pageSize)} onValueChange={value => table.setPageSize(Number(value))}>
                  <SelectTrigger className="h-8 w-[70px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{[10, 25, 50, 100].map(size => (<SelectItem key={size} value={String(size)} className="text-sm">{size}</SelectItem>))}</SelectContent>
                </Select>
                 <span className="text-xs whitespace-nowrap">linhas por página</span>
              </div>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
