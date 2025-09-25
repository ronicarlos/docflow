
"use client";

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IDistributionEventLog, User, Document, ITenant } from "@/types";
import { ClipboardList, CheckCircle, XCircle, ArrowUpDown, ChevronDown, ChevronRight, ListFilter, Columns, Download, FileSpreadsheet, FileText as PdfIcon, RefreshCw, ChevronsLeft, ChevronLeft, ChevronsRight } from "lucide-react";
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRouter } from "next/navigation";
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
} from '@tanstack/react-table';

const NO_GROUPING_KEY = "_NONE_GROUPING_";
const ALL_ITEMS_FILTER = "_ALL_STATUS_";


const SafeDateCell: React.FC<{ dateString?: string }> = ({ dateString }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        // This effect runs only on the client, after hydration.
        if (!dateString) {
            setFormattedDate("N/A");
            return;
        }
        try {
            const date = parseISO(dateString);
            if (isValid(date)) {
                const formatted = (
                    format(date, 'dd/MM/yyyy', { locale: ptBR }) + 
                    '<br/>' + 
                    format(date, 'HH:mm:ss', { locale: ptBR })
                );
                setFormattedDate(formatted);
            } else {
                 setFormattedDate("Data Inválida");
            }
        } catch (e) {
            setFormattedDate("Erro de Data");
        }
    }, [dateString]);
    
    if (formattedDate === null) {
        return <Skeleton className="h-4 w-24" />;
    }
    
    return <div className="text-sm text-muted-foreground whitespace-nowrap" dangerouslySetInnerHTML={{ __html: formattedDate }} />;
};


const getLogColumns = (): ColumnDef<IDistributionEventLog>[] => [
  {
    id: 'expander',
    header: ({ table }: HeaderContext<IDistributionEventLog, unknown>) => (
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
    accessorKey: 'date',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Data/Hora <ArrowUpDown className="ml-2 h-3 w-3" />
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
    meta: { headerLabel: 'Data/Hora' },
  },
  {
    accessorFn: (row) => {
      if (!row.eventDate) return 'N/A';
      const date = new Date(row.eventDate);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    },
    id: 'yearMonth',
    header: ({ column }) => (
       <div className="flex flex-col gap-1 min-w-[150px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Ano/Mês <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Ano/Mês (AAAA-MM)..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => info.getValue() as string,
    meta: { headerLabel: 'Ano/Mês' },
  },
  {
    accessorKey: 'documentCode',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Cód. Documento <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Cód..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => <span className="font-medium text-primary hover:underline cursor-pointer">{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Cód. Documento' },
  },
  {
    accessorKey: 'documentRevision',
    header: "Revisão",
    cell: (info) => <span className="text-sm">{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Revisão' },
  },
   {
    accessorKey: 'documentDescription',
    header: ({ column }) => (
        <div className="flex flex-col gap-1 min-w-[250px]">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start text-xs">
                Descrição Documento <ArrowUpDown className="ml-1.5 h-3 w-3" />
            </Button>
            <Input
              type="text"
              value={(column.getFilterValue() as string) ?? ''}
              onChange={event => column.setFilterValue(event.target.value)}
              placeholder="Filtrar Descrição..."
              className="h-7 text-xs"
              onClick={(e) => e.stopPropagation()}
            />
        </div>
    ),
    cell: (info) => <span className="text-xs text-muted-foreground min-w-[250px] max-w-lg truncate" title={info.getValue() as string}>{info.getValue() as string || 'N/A'}</span>,
    size: 350,
    meta: { headerLabel: 'Descrição do Documento' },
  },
  {
    accessorKey: 'documentArea',
    header: ({ column }) => (
        <div className="flex flex-col gap-1 min-w-[180px]">
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
                Área do Documento <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
            <Input
              type="text"
              value={(column.getFilterValue() as string) ?? ''}
              onChange={event => column.setFilterValue(event.target.value)}
              placeholder="Filtrar Área..."
              className="h-7 text-xs"
            />
        </div>
    ),
    cell: (info) => <span className="text-sm">{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Área do Documento' },
  },
  {
    accessorKey: 'distributedToUserName',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[200px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Destinatário <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
         <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Usuário..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => <span className="text-sm">{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Usuário Destinatário' },
  },
   {
    accessorKey: 'distributedToUserEmail',
    header: "Email Destinatário",
    cell: (info) => <span className="text-sm">{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Email Destinatário' },
  },
  {
    accessorKey: 'method',
    header: "Método",
    cell: (info) => {
      const method = info.getValue() as string;
      return <span className="text-sm">{method === 'email' ? 'Email' : (method === 'system_notification' ? 'Notif. Sistema' : (method || 'N/A'))}</span>;
    },
    meta: { headerLabel: 'Método' },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Status <ArrowUpDown className="ml-2 h-3 w-3" />
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
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failed">Falha</SelectItem>
            </SelectContent>
        </Select>
      </div>
    ),
    cell: (info) => {
      const status = info.getValue() as 'success' | 'failed';
      if (!status) return <Badge variant="outline">N/A</Badge>;
      
      let label = '';
      let icon = XCircle;
      let styleClass = 'bg-red-100 text-red-700 border-red-300 dark:bg-red-700/20 dark:text-red-400 dark:border-red-600';

      if (status === 'success') {
        label = 'Sucesso';
        icon = CheckCircle;
        styleClass = 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-400 dark:border-green-600';
      } else if (status === 'failed') {
        label = 'Falha';
      }
      const IconComponent = icon;

      return (
        <Badge
          variant={'outline'}
          className={cn("text-xs font-semibold py-1 px-2.5 whitespace-nowrap", styleClass)}
        >
          <IconComponent className="mr-1.5 h-3.5 w-3.5" />
          {label}
        </Badge>
      );
    },
    meta: { headerLabel: 'Status' },
    filterFn: (row, id, filterValue) => {
        const rowValue = row.getValue(id);
        if (filterValue === null || filterValue === undefined) return true;
        return String(rowValue) === filterValue;
    }
  },
  {
    accessorKey: 'details',
    header: "Detalhes da Ação",
    cell: (info) => <span className="text-xs text-muted-foreground max-w-xs truncate" title={info.getValue() as string}>{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Detalhes da Ação' },
    size: 400,
  },
];

const groupingOptions = [
  { value: NO_GROUPING_KEY, label: 'Tabela Simples' },
  { value: 'documentCode', label: 'Agrupar por Documento' },
  { value: 'distributedToUserName', label: 'Agrupar por Usuário' },
  { value: 'yearMonth', label: 'Agrupar por Ano/Mês' },
  { value: 'status', label: 'Agrupar por Status' },
  { value: 'documentArea', label: 'Agrupar por Área do Documento' },
];

interface DistributionLogsClientProps {
  initialLogs: IDistributionEventLog[];
  tenantDetails: ITenant;
}

export default function DistributionLogsClient({ initialLogs, tenantDetails }: DistributionLogsClientProps) {
  const router = useRouter();
  const [logs] = useState<IDistributionEventLog[]>(initialLogs);
  const [clientMounted, setClientMounted] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    'yearMonth': false, 
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 });


  useEffect(() => {
    setClientMounted(true);
  }, []);

  const memoizedColumns = React.useMemo<ColumnDef<IDistributionEventLog>[]>(() => {
    if (!clientMounted) return []; 
    return getLogColumns();
  }, [clientMounted]);

  const tableData = React.useMemo(() => clientMounted ? logs : [], [clientMounted, logs]);

  const table = useReactTable({
    data: tableData,
    columns: memoizedColumns,
    state: {
      sorting,
      grouping,
      expanded,
      columnVisibility,
      columnFilters,
      pagination,
    },
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onExpandedChange: setExpanded,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableExpanding: true,
    autoResetPageIndex: false, 
  });

  const handleGroupingChange = (columnId: string) => {
    if (columnId === NO_GROUPING_KEY) {
      setGrouping([]);
    } else {
      setGrouping([columnId]);
    }
  };

  const escapeCsvCell = (value: any): string => {
    const stringValue = String(value === null || value === undefined ? '' : value);
    if (/[",\r\n]/.test(stringValue)) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (!clientMounted || !table || table.getFilteredRowModel().rows.length === 0) {
        alert("A tabela ainda não está pronta ou não há dados para exportar.");
        return;
    }

    const visibleColumns = table.getVisibleLeafColumns().filter(col => col.id !== 'actions' && col.id !== 'expander');
    const headers = visibleColumns.map(col => (col.columnDef.meta as any)?.headerLabel || col.id);
    const dataRows = table.getFilteredRowModel().rows;
    const tenantInfo = tenantDetails;
  
    if (format === 'pdf') {
        const numColumns = headers.length;
        const logoHtml = tenantInfo?.logoUrl ? `<img src="${tenantInfo.logoUrl}" style="height: 40px; width: auto; max-width: 150px;"/>` : '<div></div>';
        
        let htmlContent = `
            <!DOCTYPE html>
            <html><head><title>Logs de Distribuição</title><meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; margin: 0; }
                @page { size: A4 landscape; margin: 1cm !important; }
                body { margin: 1cm !important; }
                .report-header-content { display: flex; justify-content: space-between; align-items: center; width: 100%; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 15px; }
                .logo { height: 40px; width: auto; max-width: 150px; }
                .title-block { text-align: center; flex-grow: 1; }
                .title-block h1 { font-size: 14pt; margin: 0; }
                .title-block p { font-size: 9pt; margin: 0; color: #555; }
                .print-footer { position: fixed; bottom: 0.5cm; left: 1cm; right: 1cm; text-align: right; font-size: 8pt; }
                .print-footer .page-number::after { content: "Página " counter(page); }
                table { width: 100%; border-collapse: collapse; font-size: 8pt; table-layout: auto; }
                th, td { border: 1px solid #ccc; padding: 3px; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px; }
                th { background-color: #f2f2f2; font-weight: bold; }
                tr { page-break-inside: avoid !important; }
                thead { display: table-header-group; }
                .col-details, .col-documentDescription { max-width: 200px !important; white-space: normal !important; } 
            </style></head><body>
            <div class="report-header-content">
              ${logoHtml}
              <div class="title-block">
                <h1>Logs de Distribuição de Documentos</h1>
                <p>Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
              </div>
              <div style="width: ${tenantDetails?.logoUrl ? '150px' : '0'}; visibility: hidden;"></div>
            </div>
            <table><thead><tr>
            ${headers.map(h => `<th>${escapeCsvCell(h)}</th>`).join('')}
            </tr></thead><tbody>
            ${dataRows.map(row => `<tr>
                ${visibleColumns.map(col => {
                    let cellValue = row.getValue(col.id);
                    if (col.id === 'date' && cellValue) {
                        const date = new Date(cellValue as string);
                        cellValue = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;
                    } else if (col.id === 'status' && cellValue) {
                         cellValue = cellValue === 'success' ? 'Sucesso' : 'Falha';
                    } else if (col.id === 'method' && cellValue) {
                        cellValue = cellValue === 'system_notification' ? 'Notif. Sistema' : cellValue;
                    }
                     const cellClass = col.id === 'details' ? 'col-details' : (col.id === 'documentDescription' ? 'col-documentDescription' : '');
                    return `<td class="${cellClass}">${escapeCsvCell(cellValue)}</td>`;
                }).join('')}
            </tr>`).join('')}
            </tbody></table>
            <div class="print-footer"><span class="page-number"></span></div>
            </body></html>`;
  
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open(); printWindow.document.write(htmlContent); printWindow.document.close();
        setTimeout(() => {
            try { printWindow.focus(); printWindow.print(); } catch (e) {
                console.error("Erro ao imprimir:", e);
                alert("Não foi possível iniciar a impressão. Verifique as permissões do navegador.");
            }
        }, 1000);
      } else {
        alert("Não foi possível abrir uma nova janela para a impressão. Verifique bloqueadores de pop-up.");
      }
      return;
    }
  
    let csvContent = "\uFEFF"; 
    csvContent += headers.map(h => escapeCsvCell(h)).join(';') + '\r\n';
  
    dataRows.forEach(row => {
      const rowData = visibleColumns.map(col => {
        let cellValue = row.getValue(col.id);
         if (col.id === 'status' && cellValue) {
           cellValue = cellValue === 'success' ? 'Sucesso' : 'Falha';
        } else if (col.id === 'date' && cellValue) {
            const date = new Date(cellValue as string);
            cellValue = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;
        } else if (col.id === 'method' && cellValue) {
            cellValue = cellValue === 'system_notification' ? 'Notif. Sistema' : cellValue;
        }
        return escapeCsvCell(cellValue);
      });
      csvContent += rowData.join(';') + '\r\n';
    });
  
    const filename = format === 'excel' ? `logs_distribuicao_para_excel.csv` : `logs_distribuicao.csv`;
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
                    <ClipboardList className="w-7 h-7" />
                    Logs de Distribuição de Documentos
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">
                    Histórico de distribuições automáticas de documentos aprovados para os usuários designados.
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" disabled>
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
                <ClipboardList className="w-7 h-7" />
                Logs de Distribuição de Documentos
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-1">
                Histórico de distribuições automáticas de documentos aprovados para os usuários designados.
                </CardDescription>
            </div>
             <Button variant="outline" size="sm" onClick={() => router.refresh()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/30 flex flex-wrap items-center gap-x-4 gap-y-2">
            <div>
              <Label htmlFor="groupingSelectLogDist" className="text-sm font-medium text-foreground whitespace-nowrap mr-2">Visualizar como:</Label>
              <Select
                value={grouping[0] || NO_GROUPING_KEY}
                onValueChange={handleGroupingChange}
              >
                <SelectTrigger id="groupingSelectLogDist" className="w-[240px] bg-background shadow-sm h-9">
                  <SelectValue placeholder="Selecione como visualizar" />
                </SelectTrigger>
                <SelectContent>
                  {groupingOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto h-9">
                    <Columns className="mr-2 h-4 w-4" /> Colunas
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Exibir/Ocultar Colunas</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {table.getAllLeafColumns().map(column => {
                         if (column.id === 'expander') return null;
                         const headerLabel = (column.columnDef.meta as any)?.headerLabel || column.id;
                        return (
                            <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                            {headerLabel}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9"> <Download className="mr-2 h-4 w-4" /> Exportar </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}> <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar para CSV </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}> <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar para Excel (via CSV) </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}> <PdfIcon className="mr-2 h-4 w-4" /> Exportar para PDF (A4) </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {table.getRowModel().rows.length === 0 ? (
             <div className="text-center py-16 text-muted-foreground">
              <ClipboardList className="mx-auto h-16 w-16 mb-6 text-gray-400 dark:text-gray-500" />
              <p className="text-xl font-semibold mb-2">Nenhum log de distribuição encontrado.</p>
              <p className="text-sm">Os logs aparecerão aqui quando documentos aprovados forem distribuídos.</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-450px)] overflow-auto"> 
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "py-2 px-3 text-left align-middle font-semibold text-muted-foreground bg-card", 
                            header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-muted/50' : '',
                            header.column.getIsPinned() ? 'sticky bg-card shadow-md z-1' : '' 
                          )}
                           style={{
                            width: header.getSize() !== 150 ? header.getSize() : undefined, 
                            left: header.column.getIsPinned() === 'left' ? `${header.column.getStart('left')}px` : undefined,
                            right: header.column.getIsPinned() === 'right' ? `${header.column.getStart('right')}px` : undefined,
                          }}
                        >
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
                  {table.getRowModel().rows.map(row => (
                    <React.Fragment key={row.id}>
                      {row.getIsGrouped() ? (
                        <TableRow className="bg-muted/50 hover:bg-muted/40 dark:bg-muted/20 dark:hover:bg-muted/30 transition-colors">
                          <TableCell colSpan={table.getVisibleLeafColumns().length} className="py-2 px-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={row.getToggleExpandedHandler()}
                              className="flex items-center gap-2 text-left w-auto p-1 hover:bg-primary/10 h-7"
                            >
                              {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <span className="font-semibold text-primary">
                                {(groupingOptions.find(opt => opt.value === row.groupingColumnId)?.label?.replace('Agrupar por ', '') || row.groupingColumnId)}:
                              </span>
                              {String(row.getValue(row.groupingColumnId!))}
                              <span className="text-xs text-muted-foreground ml-1.5">
                                (Mostrando {row.subRows.length} log(s))
                              </span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <TableRow className="hover:bg-muted/10 dark:hover:bg-muted/50 transition-colors text-sm">
                          {row.getVisibleCells().map((cell, cellIndex) => (
                            <TableCell
                              key={cell.id}
                              className={cn(
                                "py-2 px-3",
                                cell.column.getIsPinned() ? 'sticky bg-card shadow-sm z-0' : ''
                              )}
                               style={{
                                paddingLeft: row.depth > 0 && cellIndex === (table.getState().grouping.length > 0 ? 1:0) && cell.column.id !== 'expander' ? `${row.depth * 1.5 + 0.5}rem` : undefined,
                                left: cell.column.getIsPinned() === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                                right: cell.column.getIsPinned() === 'right' ? `${cell.column.getStart('right')}px` : undefined,
                              }}
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
                Total de Logs: {logs.length} | Logs Exibidos na Grid: {table.getFilteredRowModel().rows.length}
            </div>
            {tableData.length > 0 && table.getPageCount() > 1 && (
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

    