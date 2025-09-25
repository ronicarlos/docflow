
"use client";

import { useState, useMemo, FC } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import type { Document, Contract, DocumentType, Discipline, ITenant } from "@/types";
import { generateMasterList } from '@/actions/documentActions';
import { DOCUMENT_STATUSES } from '@/lib/constants';
import { Filter, Search, Loader2, Printer, FileText as FileTextIcon } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MasterListClientProps {
  initialDocuments: Document[];
  contracts: Contract[];
  documentTypes: DocumentType[];
  disciplines: Discipline[];
  tenantDetails: ITenant;
}

const ALL_ITEMS_VALUE = "_ALL_";

const MasterListClient: FC<MasterListClientProps> = ({
  initialDocuments,
  contracts,
  documentTypes,
  disciplines,
  tenantDetails
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    search: '',
    contractId: '',
    documentTypeId: '',
    area: '',
    status: '',
  });
  const [documents, setDocuments] = useState(initialDocuments);
  const [isSearching, setIsSearching] = useState(false);

  const handleFilterChange = (field: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value === ALL_ITEMS_VALUE ? '' : value }));
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const result = await generateMasterList(filters);
      setDocuments(result);
      toast({
        title: "Busca Concluída",
        description: `${result.length} documento(s) encontrado(s).`,
      });
    } catch (error) {
      toast({
        title: "Erro na Busca",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };
  
    const handlePrint = () => {
        const reportDate = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast({ title: "Erro", description: "Não foi possível abrir a janela de impressão.", variant: "destructive" });
            return;
        }

        printWindow.document.write('<html><head><title>Lista Mestra de Documentos</title><style>body{font-family:Arial,sans-serif;margin:1cm;}@page{size:A4 landscape;margin:1cm;}table{width:100%;border-collapse:collapse;font-size:8pt;}th,td{border:1px solid #ccc;padding:2px 5px;text-align:left;word-break:break-word;}thead{display:table-header-group;}th{background-color:#f0f0f0!important;font-weight:bold;}tr{page-break-inside:avoid!important;}.report-header{text-align:center;margin-bottom:20px;}</style></head><body>');
        printWindow.document.write(`<div class="report-header"><h1>Lista Mestra de Documentos</h1><p>Data de Emissão: ${reportDate}</p><p>Filtros Aplicados: ${JSON.stringify(filters)}</p></div>`);
        printWindow.document.write('<table><thead><tr><th>Contrato</th><th>Área/Setor</th><th>Código</th><th>Revisão</th><th>Descrição</th><th>Status</th><th>Data Elaboração</th><th>Responsável</th></tr></thead><tbody>');
        documents.forEach(doc => {
             printWindow.document.write(`<tr>
                <td>${typeof doc.contract === 'string' ? doc.contract : doc.contract.name}</td>
                <td>${doc.area}</td>
                <td>${doc.code}</td>
                <td>${doc.currentRevision?.revisionNumber || 'N/A'}</td>
                <td>${doc.description}</td>
                <td>${DOCUMENT_STATUSES[doc.status as keyof typeof DOCUMENT_STATUSES]?.label || doc.status}</td>
                <td>${doc.elaborationDate ? format(parseISO(doc.elaborationDate), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}</td>
                <td>${typeof doc.responsibleUser === 'string' ? doc.responsibleUser : doc.responsibleUser.name}</td>
            </tr>`);
        });
        printWindow.document.write('</tbody></table></body></html>');
        printWindow.document.close();
        setTimeout(() => {
             try { printWindow.focus(); printWindow.print(); }
             catch (e) {
                console.error("Erro ao imprimir:", e);
                toast({ title: "Erro de Impressão", description: "Não foi possível iniciar a impressão.", variant: "destructive"});
            }
        }, 750);
    }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="w-6 h-6 text-primary"/>
            Gerar Relatório - Lista Mestra
          </CardTitle>
          <CardDescription>
            Use os filtros abaixo para gerar uma lista de documentos personalizada e depois exporte para PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             <div><Label htmlFor="search">Buscar</Label><Input id="search" placeholder="Código, descrição..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} /></div>
             <div><Label htmlFor="contract">Contrato</Label><Select value={filters.contractId} onValueChange={(v) => handleFilterChange('contractId', v)}><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value={ALL_ITEMS_VALUE}>Todos</SelectItem>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
             <div><Label htmlFor="docType">Tipo de Documento</Label><Select value={filters.documentTypeId} onValueChange={(v) => handleFilterChange('documentTypeId', v)}><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value={ALL_ITEMS_VALUE}>Todos</SelectItem>{documentTypes.map(dt => <SelectItem key={dt.id} value={dt.id}>{dt.name} ({dt.code})</SelectItem>)}</SelectContent></Select></div>
             <div><Label htmlFor="area">Área/Setor</Label><Select value={filters.area} onValueChange={(v) => handleFilterChange('area', v)}><SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger><SelectContent><SelectItem value={ALL_ITEMS_VALUE}>Todas</SelectItem>{disciplines.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent></Select></div>
             <div><Label htmlFor="status">Status</Label><Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger><SelectContent><SelectItem value={ALL_ITEMS_VALUE}>Todos</SelectItem>{Object.entries(DOCUMENT_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent></Select></div>
          </div>
           <div className="flex justify-end pt-4">
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Filter className="mr-2 h-4 w-4" />}
              Aplicar Filtros e Gerar Pré-visualização
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Pré-visualização do Relatório</CardTitle>
            <Button onClick={handlePrint} disabled={documents.length === 0}>
                <Printer className="mr-2 h-4 w-4" />
                Gerar PDF
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh] border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Contrato</TableHead>
                            <TableHead>Código</TableHead>
                            <TableHead>Revisão</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documents.length > 0 ? documents.map(doc => (
                            <TableRow key={doc.id}>
                                <TableCell>{typeof doc.contract === 'string' ? doc.contract : doc.contract.name}</TableCell>
                                <TableCell>{doc.code}</TableCell>
                                <TableCell>{doc.currentRevision?.revisionNumber || 'N/A'}</TableCell>
                                <TableCell className="max-w-xs truncate">{doc.description}</TableCell>
                                <TableCell>{DOCUMENT_STATUSES[doc.status as keyof typeof DOCUMENT_STATUSES]?.label || doc.status}</TableCell>
                                <TableCell>{format(parseISO(doc.elaborationDate), "dd/MM/yyyy")}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">Aplique os filtros para gerar uma pré-visualização.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>
          </CardContent>
      </Card>

    </div>
  );
};

export default MasterListClient;
