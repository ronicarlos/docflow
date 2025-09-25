
"use client";

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ISystemEventLog } from "@/types";
import { History, ArrowUpDown, ChevronDown, ChevronRight, ListFilter, Columns, Download, FileSpreadsheet, FileText as PdfIcon, RefreshCw, ChevronsLeft, ChevronsRight, ChevronLeft } from "lucide-react";
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
import { SYSTEM_LOG_ACTION_TYPES, SYSTEM_LOG_ENTITY_TYPES } from '@/lib/constants';
import { useRouter } from "next/navigation";

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
const ALL_ITEMS_FILTER = "_ALL_ITEMS_";

const SafeDateCell: React.FC<{ dateString?: string }> = ({ dateString }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if (!dateString) {
            setFormattedDate("N/A");
            return;
        }
        try {
            const date = new Date(dateString);
            const formatted = (
                date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }) + 
                ' ' + 
                date.toLocaleTimeString('pt-BR')
            );
            setFormattedDate(formatted);
        } catch (e) {
            setFormattedDate("Data Inválida");
        }
    }, [dateString]);
    
    if (formattedDate === null) {
        return <Skeleton className="h-4 w-24" />;
    }
    
    // Using dangerouslySetInnerHTML to render the <br/> tag
    return <div className="text-sm text-muted-foreground whitespace-nowrap" dangerouslySetInnerHTML={{ __html: formattedDate.replace(' ', '<br/>') }} />;
};


const getSystemLogColumns = (
  columnFilters: ColumnFiltersState,
  _setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>
): ColumnDef<ISystemEventLog>[] => [
  {
    id: 'expander',
    header: ({ table }: HeaderContext<ISystemEventLog, unknown>) => (
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
    enableColumnFilter: false,
  },
  {
    accessorKey: 'timestamp',
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
    enableColumnFilter: true,
  },
  {
    accessorKey: 'userName',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[150px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Usuário <ArrowUpDown className="ml-2 h-3 w-3" />
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
    cell: (info) => <span className="text-sm">{info.getValue() as string || 'Sistema'}</span>,
    meta: { headerLabel: 'Usuário' },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'actionType',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Tipo de Ação <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Select
          value={(column.getFilterValue() as string) ?? ALL_ITEMS_FILTER}
          onValueChange={value => column.setFilterValue(value === ALL_ITEMS_FILTER ? null : value)}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Todos Tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ITEMS_FILTER}>Todos Tipos de Ação</SelectItem>
            {Object.entries(SYSTEM_LOG_ACTION_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ),
    cell: (info) => {
        const actionKey = info.getValue() as keyof typeof SYSTEM_LOG_ACTION_TYPES;
        return <Badge variant="outline" className="text-xs whitespace-nowrap">{SYSTEM_LOG_ACTION_TYPES[actionKey] || actionKey}</Badge>;
    },
    meta: { headerLabel: 'Tipo de Ação' },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'entityType',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Tipo de Entidade <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
         <Select
          value={(column.getFilterValue() as string) ?? ALL_ITEMS_FILTER}
          onValueChange={value => column.setFilterValue(value === ALL_ITEMS_FILTER ? null : value)}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="Todos Tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ITEMS_FILTER}>Todos Tipos de Entidade</SelectItem>
            {Object.entries(SYSTEM_LOG_ENTITY_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
            <SelectItem value="N/A">N/A (Login, Logout, etc)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    ),
    cell: (info) => {
        const entityKey = info.getValue() as keyof typeof SYSTEM_LOG_ENTITY_TYPES;
        return <span className="text-sm">{SYSTEM_LOG_ENTITY_TYPES[entityKey] || entityKey || 'N/A'}</span>;
    },
    meta: { headerLabel: 'Tipo de Entidade' },
    enableColumnFilter: true,
  },
  {
    accessorKey: 'entityDescription',
    header: ({ column }) => (
      <div className="flex flex-col gap-1 min-w-[250px]">
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="px-1 py-0.5 h-auto justify-start">
          Descrição da Entidade <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
        <Input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={event => column.setFilterValue(event.target.value)}
          placeholder="Filtrar Desc. Entidade..."
          className="h-7 text-xs"
        />
      </div>
    ),
    cell: (info) => <span className="text-xs text-muted-foreground max-w-md truncate" title={info.getValue() as string}>{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Descrição da Entidade' },
    size: 300,
    enableColumnFilter: true,
  },
  {
    accessorKey: 'details',
    header: "Detalhes da Ação",
    cell: (info) => <span className="text-xs text-muted-foreground max-w-lg truncate" title={info.getValue() as string}>{info.getValue() as string || 'N/A'}</span>,
    meta: { headerLabel: 'Detalhes da Ação' },
    size: 400,
    enableColumnFilter: false,
  },
];

const systemLogGroupingOptions = [
  { value: NO_GROUPING_KEY, label: 'Tabela Simples' },
  { value: 'userName', label: 'Agrupar por Usuário' },
  { value: 'actionType', label: 'Agrupar por Tipo de Ação' },
  { value: 'entityType', label: 'Agrupar por Tipo de Entidade' },
];

interface SystemEventsClientProps {
  initialLogs: ISystemEventLog[];
}

export default function SystemEventsClient({ initialLogs }: SystemEventsClientProps) {
  const router = useRouter();
  const [logs] = useState<ISystemEventLog[]>(initialLogs);
  const [clientMounted, setClientMounted] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([{ id: 'timestamp', desc: true }]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 25 });

  useEffect(() => {
    setClientMounted(true);
  }, []);

  const memoizedColumns = React.useMemo<ColumnDef<ISystemEventLog>[]>(() => {
    if (!clientMounted) return [];
    return getSystemLogColumns(columnFilters, setColumnFilters);
  }, [clientMounted, columnFilters]);

  const table = useReactTable({
    data: logs,
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

    if (format === 'pdf') {
      let htmlContent = `
        <!DOCTYPE html>
        <html><head><title>Log Geral do Sistema</title><meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 0; }
            @page { size: A4 landscape; margin: 1cm; }
            body { margin: 1cm; }
            .print-header { text-align: center; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 8pt; table-layout: auto; }
            th, td { border: 1px solid #ccc; padding: 3px; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
            tr { page-break-inside: avoid !important; }
            thead { display: table-header-group; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .col-details, .col-entityDescription { max-width: 200px !important; white-space: normal !important; }
        </style></head><body>
        <div class="print-header"><h1>Log Geral de Eventos do Sistema</h1><p>Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}</p></div>
        <table><thead><tr>
        ${headers.map(h => `<th>${escapeCsvCell(h)}</th>`).join('')}
        </tr></thead><tbody>
        ${dataRows.map(row => `<tr>
            ${visibleColumns.map(col => {
                let cellValue = row.getValue(col.id);
                if (col.id === 'timestamp' && cellValue) {
                    const date = new Date(cellValue as string); cellValue = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`;
                } else if (col.id === 'actionType' && cellValue) {
                    cellValue = SYSTEM_LOG_ACTION_TYPES[cellValue as keyof typeof SYSTEM_LOG_ACTION_TYPES] || cellValue;
                } else if (col.id === 'entityType' && cellValue) {
                    cellValue = SYSTEM_LOG_ENTITY_TYPES[cellValue as keyof typeof SYSTEM_LOG_ENTITY_TYPES] || cellValue;
                }
                const cellClass = col.id === 'details' ? 'col-details' : (col.id === 'entityDescription' ? 'col-entityDescription' : '');
                return `<td class="${cellClass}">${escapeCsvCell(cellValue)}</td>`;
            }).join('')}
        </tr>`).join('')}
        </tbody></table></body></html>`;

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
        if (col.id === 'actionType' && cellValue) { cellValue = SYSTEM_LOG_ACTION_TYPES[cellValue as keyof typeof SYSTEM_LOG_ACTION_TYPES] || cellValue; }
        else if (col.id === 'entityType' && cellValue) { cellValue = SYSTEM_LOG_ENTITY_TYPES[cellValue as keyof typeof SYSTEM_LOG_ENTITY_TYPES] || cellValue; }
        else if (col.id === 'timestamp' && cellValue) { const date = new Date(cellValue as string); cellValue = `${date.toLocaleDateString('pt-BR')} ${date.toLocaleTimeString('pt-BR')}`; }
        return escapeCsvCell(cellValue);
      });
      csvContent += rowData.join(';') + '\r\n';
    });
    const filename = format === 'excel' ? `log_geral_sistema_para_excel.csv` : `log_geral_sistema.csv`;
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
                    <History className="w-7 h-7" />
                    Log Geral de Eventos do Sistema
                    </CardTitle>
                    <CardDescription className="text-base text-muted-foreground mt-1">
                    Rastreamento de todas as ações importantes realizadas no sistema.
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
                <History className="w-7 h-7" /> Log Geral de Eventos do Sistema
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground mt-1">
                Rastreamento de todas as ações importantes realizadas no sistema.
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
              <Label htmlFor="groupingSelectSysLog" className="text-sm font-medium text-foreground whitespace-nowrap mr-2">Visualizar como:</Label>
              <Select value={grouping[0] || NO_GROUPING_KEY} onValueChange={handleGroupingChange}>
                <SelectTrigger id="groupingSelectSysLog" className="w-[240px] bg-background shadow-sm h-9">
                  <SelectValue placeholder="Selecione como visualizar" />
                </SelectTrigger>
                <SelectContent>
                  {systemLogGroupingOptions.map(opt => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto h-9"> <Columns className="mr-2 h-4 w-4" /> Colunas </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Exibir/Ocultar Colunas</DropdownMenuLabel> <DropdownMenuSeparator />
                {table.getAllLeafColumns().map(column => {
                  if (column.id === 'expander') return null;
                  const headerLabel = (column.columnDef.meta as any)?.headerLabel || column.id;
                  return (<DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>{headerLabel}</DropdownMenuCheckboxItem>)
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
              <History className="mx-auto h-16 w-16 mb-6 text-gray-400 dark:text-gray-500" />
              <p className="text-xl font-semibold mb-2">Nenhum evento de sistema encontrado.</p>
              <p className="text-sm">Os logs aparecerão aqui conforme as ações são realizadas no sistema.</p>
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
                          className={cn("py-2 px-3 text-left align-middle font-semibold text-muted-foreground bg-card", header.column.getCanSort() ? 'cursor-pointer select-none hover:bg-muted/50' : '', header.column.getIsPinned() ? 'sticky bg-card shadow-md z-1' : '')}
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
                                {(systemLogGroupingOptions.find(opt => opt.value === row.groupingColumnId)?.label?.replace('Agrupar por ', '') || row.groupingColumnId)}:
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
            <div>Total de Logs: {logs.length} | Exibidos na Grid: {table.getFilteredRowModel().rows.length}</div>
            {table.getPageCount() > 1 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}><ChevronsLeft className="h-4 w-4" /></Button>
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4"/></Button>
                <span className="text-xs">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4"/></Button>
                <Button variant="outline" size="sm" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}><ChevronsRight className="h-4 w-4"/></Button>
                <Select value={String(table.getState().pagination.pageSize)} onValueChange={value => table.setPageSize(Number(value))}>
                  <SelectTrigger className="h-8 w-[70px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{[25, 50, 100, 250].map(size => (<SelectItem key={size} value={String(size)} className="text-sm">{size}</SelectItem>))}</SelectContent>
                </Select>
                <span className="text-xs whitespace-nowrap">linhas por página</span>
              </div>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
