
'use client';

import * as React from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ChevronLeft, ChevronRight, Thermometer, AlertTriangle } from "lucide-react";
import { format, parseISO, isBefore, addDays, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import type { CalibrationInstrument } from "@/types";
import InstrumentActions from './instrument-actions';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const getStatusVariant = (status: CalibrationInstrument['status']) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-700/20 dark:text-green-400 dark:border-green-600';
    case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/20 dark:text-slate-400 dark:border-slate-600';
    case 'maintenance': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600/30 dark:text-yellow-400 dark:border-yellow-500';
    default: return 'outline';
  }
};

const NextCalibrationCell: React.FC<{ dateString?: string }> = ({ dateString }) => {
  const [clientData, setClientData] = React.useState<{
    displayDate: string | null;
    isPast: boolean;
    isApproaching: boolean;
  }>({ displayDate: null, isPast: false, isApproaching: false });

  React.useEffect(() => {
    // This effect runs only on the client, after hydration.
    // It's safe to use time-sensitive and locale-sensitive functions here.
    try {
      if (!dateString) {
        setClientData({ displayDate: 'N/A', isPast: false, isApproaching: false });
        return;
      }
      const nextDate = parseISO(dateString);
      if (isValid(nextDate)) {
        const now = new Date();
        const past = isBefore(nextDate, new Date(now.getFullYear(), now.getMonth(), now.getDate()));
        const approaching = !past && isBefore(nextDate, addDays(now, 30));
        const formatted = format(nextDate, "dd/MM/yyyy", { locale: ptBR });
        setClientData({ displayDate: formatted, isPast: past, isApproaching: approaching });
      } else {
        setClientData({ displayDate: 'Data Inválida', isPast: false, isApproaching: false });
      }
    } catch (e) {
      console.error("Error parsing date:", e);
      setClientData({ displayDate: 'Erro na Data', isPast: false, isApproaching: false });
    }
  }, [dateString]);
  
  const { displayDate, isPast, isApproaching } = clientData;

  const className = cn(
    "whitespace-nowrap",
    isPast && "text-red-600 font-bold dark:text-red-400",
    isApproaching && "text-yellow-600 font-bold dark:text-yellow-400"
  );
  
  if (displayDate === null) {
    // Render a skeleton or a placeholder on the server and initial client render.
    return <Skeleton className="h-4 w-24" />;
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className={className}>{displayDate}</span>
      {(isPast || isApproaching) && <AlertTriangle className={cn("h-4 w-4", className)} />}
    </div>
  );
};


const getColumns = (refreshData: () => void): ColumnDef<CalibrationInstrument>[] => [
    { accessorKey: 'tag', header: ({ column }) => <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>TAG <ArrowUpDown className="ml-2 h-4 w-4" /></Button> },
    { accessorKey: 'description', header: 'Descrição' },
    { accessorKey: 'equipmentType', header: 'Tipo' },
    { accessorKey: 'location', header: 'Localização' },
    { accessorKey: 'serialNumber', header: 'Nº de Série' },
    { accessorKey: 'nextCalibrationDate', header: 'Próxima Calibração', cell: ({ row }) => <NextCalibrationCell dateString={row.original.nextCalibrationDate} /> },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant="outline" className={getStatusVariant(row.original.status)}>{row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}</Badge> },
    { id: 'actions', header: () => <div className="text-right">Ações</div>, cell: ({ row }) => <div className="text-right"><InstrumentActions instrument={row.original} onActionComplete={refreshData} /></div> },
];

export default function InstrumentListClient({ initialInstruments }: { initialInstruments: CalibrationInstrument[] }) {
    const router = useRouter();
    const [data, setData] = React.useState(initialInstruments);
    const [globalFilter, setGlobalFilter] = React.useState('');
    const refreshData = () => router.refresh();
    const columns = React.useMemo(() => getColumns(refreshData), []);

    React.useEffect(() => {
        setData(initialInstruments);
    }, [initialInstruments]);

    const table = useReactTable({
        data,
        columns,
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="space-y-4">
            <Input
                placeholder="Buscar por TAG, descrição, tipo ou nº de série..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
            />
            {data.length > 0 ? (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.map(row => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map(cell => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="text-sm">Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}</span>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <Thermometer className="mx-auto h-12 w-12 mb-4" />
                    <p className="text-lg font-semibold">Nenhum equipamento encontrado.</p>
                    <p>Comece adicionando um novo equipamento para calibração.</p>
                </div>
            )}
        </div>
    );
}
