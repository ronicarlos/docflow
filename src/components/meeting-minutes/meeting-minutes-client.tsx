
"use client";

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { deleteMeetingMinute, updateMeetingMinute } from '@/actions/meetingMinuteActions';
import type { IMeetingMinute, Contract } from "@/types";
import { MeetingMinuteStatus } from "@/types";
import { PlusCircle, Edit, Trash2, MoreHorizontal, Briefcase, RefreshCw, Search, ListChecks, Archive, ArchiveRestore } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL_ITEMS_VALUE = "_ALL_";

interface MeetingMinutesTableProps {
  minutes: IMeetingMinute[];
  contracts: Contract[];
  onArchive: (id: string, title: string) => void;
  onUnarchive: (id: string, title: string) => void;
  onDelete: (id: string, title: string) => void;
  type: 'active' | 'archived';
}

const MeetingMinutesTable: React.FC<MeetingMinutesTableProps> = ({ minutes, contracts, onArchive, onUnarchive, onDelete, type }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [contractFilter, setContractFilter] = React.useState('');

  const filteredMinutes = React.useMemo(() => {
    return minutes.filter(minute => {
      const searchMatch = searchTerm === '' ||
        minute.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        minute.status.toLowerCase().includes(searchTerm.toLowerCase());
      const contractMatch = contractFilter === '' || minute.contractId === contractFilter;
      return searchMatch && contractMatch;
    });
  }, [minutes, searchTerm, contractFilter]);

  return (
    <CardContent>
      <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div>
            <Select value={contractFilter} onValueChange={v => setContractFilter(v === ALL_ITEMS_VALUE ? '' : v)}>
                <SelectTrigger>
                    <SelectValue placeholder="Filtrar por Contrato" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={ALL_ITEMS_VALUE}>Todos os Contratos</SelectItem>
                    {contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>
      {filteredMinutes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Data da Reunião</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMinutes.map((minute) => (
              <TableRow key={minute.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{minute.title}</TableCell>
                <TableCell>{minute.contractName}</TableCell>
                <TableCell>{format(minute.meetingDate, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell>
                  <Badge variant={minute.status === 'Concluída' ? 'default' : (minute.status === 'Arquivada' ? 'secondary' : 'outline')}>
                    {minute.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        if (!minute.id || minute.id === 'undefined') {
                          console.error('ID da ata inválido para edição:', minute.id);
                          return;
                        }
                        router.push(`/meeting-minutes/${minute.id}/edit`);
                      }}>
                        <Edit className="mr-2 h-4 w-4" /> Editar / Ver Detalhes
                      </DropdownMenuItem>
                      {type === 'active' && (
                        <DropdownMenuItem onClick={() => onArchive(minute.id, minute.title)}>
                          <Archive className="mr-2 h-4 w-4" /> Arquivar
                        </DropdownMenuItem>
                      )}
                      {type === 'archived' && (
                        <DropdownMenuItem onClick={() => onUnarchive(minute.id, minute.title)}>
                          <ArchiveRestore className="mr-2 h-4 w-4" /> Desarquivar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(minute.id, minute.title)} className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir Permanentemente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <ListChecks className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Nenhuma ata encontrada.</p>
          <p>Verifique os filtros ou gere uma nova ata para começar.</p>
        </div>
      )}
      <CardFooter className="pt-6">
        <p className="text-xs text-muted-foreground">Total de atas nesta visualização: {filteredMinutes.length}</p>
      </CardFooter>
    </CardContent>
  );
};

interface MeetingMinutesClientProps {
  initialMinutes: IMeetingMinute[];
  initialContracts: Contract[];
}

export default function MeetingMinutesClient({ initialMinutes, initialContracts }: MeetingMinutesClientProps) {
  const { toast } = useToast();
  const router = useRouter();

  const activeMinutes = React.useMemo(() => initialMinutes.filter(m => m.status !== 'Arquivada'), [initialMinutes]);
  const archivedMinutes = React.useMemo(() => initialMinutes.filter(m => m.status === 'Arquivada'), [initialMinutes]);

  const updateMinuteStatus = async (minuteId: string, newStatus: IMeetingMinute['status'], successMessage: string) => {
    const minuteToUpdate = initialMinutes.find(m => m.id === minuteId);
    if (!minuteToUpdate) {
        toast({ title: "Erro", description: "Ata não encontrada para atualização.", variant: "destructive" });
        return;
    }
    const result = await updateMeetingMinute(minuteId, { 
      ...minuteToUpdate, 
      status: newStatus,
      meetingDate: minuteToUpdate.meetingDate.toISOString()
    }, minuteToUpdate.attachments);

    if (result.success) {
      router.refresh();
      toast({ title: "Status Atualizado", description: successMessage });
    } else {
      toast({ title: "Erro", description: "Falha ao atualizar status da ata.", variant: "destructive" });
    }
  };

  const handleArchive = (minuteId: string, minuteTitle: string) => {
    updateMinuteStatus(minuteId, MeetingMinuteStatus.ARCHIVED, `A ata "${minuteTitle}" foi arquivada.`);
  };

  const handleUnarchive = (minuteId: string, minuteTitle: string) => {
    updateMinuteStatus(minuteId, MeetingMinuteStatus.COMPLETED, `A ata "${minuteTitle}" foi desarquivada e movida para ativas.`);
  };

  const handleDelete = async (minuteId: string, minuteTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir permanentemente a ata "${minuteTitle}"? Esta ação não pode ser desfeita.`)) {
      const result = await deleteMeetingMinute(minuteId);
      if (result.success) {
        router.refresh();
        toast({ title: "Ata Excluída", description: `A ata "${minuteTitle}" foi removida permanentemente.` });
      } else {
        toast({ title: "Erro", description: "Falha ao excluir ata.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Briefcase className="w-7 h-7 text-primary" />
              Gestão de Atas de Reunião
            </CardTitle>
            <CardDescription>Visualize, gerencie e filtre todas as atas de reunião salvas.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Lista
            </Button>
            <Button asChild>
              <Link href="/audio-memo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Gerar Nova Ata
              </Link>
            </Button>
          </div>
        </CardHeader>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Atas Ativas ({activeMinutes.length})</TabsTrigger>
            <TabsTrigger value="archived">Atas Arquivadas ({archivedMinutes.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <MeetingMinutesTable
              minutes={activeMinutes}
              contracts={initialContracts}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
              type="active"
            />
          </TabsContent>
          <TabsContent value="archived">
             <MeetingMinutesTable
              minutes={archivedMinutes}
              contracts={initialContracts}
              onArchive={handleArchive}
              onUnarchive={handleUnarchive}
              onDelete={handleDelete}
              type="archived"
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
