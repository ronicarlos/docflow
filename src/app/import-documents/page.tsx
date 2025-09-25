
"use client";

import { useState, useEffect, ChangeEvent, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useImportData } from "@/hooks/use-import-data";
import { importDocumentsFromSheet } from '@/actions/documentImportActions';
import type { Contract } from '@/types/Contract';
import type { User } from '@/types/User';
import { FileSpreadsheet, UploadCloud, Download, AlertTriangle, Loader2, Trash2, ListChecks } from "lucide-react";

interface ParsedSheetRow {
  rowIndex: number;
  codigo_documento?: string;
  revisao?: string;
  descricao?: string;
  data_elaboracao?: string;
  disciplina_area_setor?: string;
  tipo_documento_codigo?: string;
  usuario_responsavel_email?: string;
  localizacao_codigo?: string;
  sub_localizacao_codigo?: string;
  errors?: string[];
}

const EXPECTED_HEADERS = [
  "codigo_documento", "revisao", "descricao", "data_elaboracao",
  "disciplina_area_setor", "tipo_documento_codigo", "usuario_responsavel_email",
  "localizacao_codigo", "sub_localizacao_codigo"
];


export default function ImportDocumentsPage() {
  const { toast } = useToast();
  const { contracts, currentUser, loading, error } = useImportData();
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, startImportingTransition] = useTransition();
  const [importResult, setImportResult] = useState<{ success: number, failed: number, importId: string } | null>(null);

  const [parsedData, setParsedData] = useState<ParsedSheetRow[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Mostrar loading enquanto carrega dados
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    );
  }

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validExtensions = ['.xlsx', '.csv'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: "Formato de Arquivo Inválido",
          description: "Por favor, selecione um arquivo .xlsx ou .csv.",
          variant: "destructive",
        });
        setSelectedFile(null);
        setParsedData([]);
        setSelectedRows(new Set());
        event.target.value = '';
        return;
      }
      setSelectedFile(file);
      simulateFileParsing(file);
      setImportResult(null);
    } else {
      setSelectedFile(null);
      setParsedData([]);
      setSelectedRows(new Set());
    }
  };

  const simulateFileParsing = (file: File) => {
    toast({ title: "Processando arquivo...", description: `Simulando leitura do arquivo ${file.name}.` });
    const mockParsed: ParsedSheetRow[] = [
      { rowIndex: 0, codigo_documento: "PLAN-DOC-001", revisao: "R00", descricao: "Documento de Teste da Planilha 1", data_elaboracao: "20/07/2024", disciplina_area_setor: "Engenharia", tipo_documento_codigo: "TDA001", usuario_responsavel_email: "admin@empresaA.com" },
      { rowIndex: 1, codigo_documento: "PLAN-DOC-002", revisao: "R01", descricao: "Outro Documento da Planilha", data_elaboracao: "21/07/2024", disciplina_area_setor: "Jurídico Contratual", tipo_documento_codigo: "PROJETO1", usuario_responsavel_email: "roberto@empresaA.com", localizacao_codigo: "PPA" },
      { rowIndex: 2, codigo_documento: "PLAN-DOC-003", revisao: "R00", descricao: "Especificação Técnica Detalhada", data_elaboracao: "22/07/2024", disciplina_area_setor: "Engenharia", tipo_documento_codigo: "TDA001", usuario_responsavel_email: "carolina@empresaA.com", sub_localizacao_codigo: "E101A" },
      { rowIndex: 3, codigo_documento: "PLAN-DOC-001", revisao: "R00", descricao: "Documento Duplicado Teste", data_elaboracao: "23/07/2024", disciplina_area_setor: "Engenharia", tipo_documento_codigo: "TDA001", usuario_responsavel_email: "admin@empresaA.com" }, // Duplicado para teste
      { rowIndex: 4, codigo_documento: "PLAN-DOC-004", revisao: "R00", descricao: "Documento com Tipo Inválido", data_elaboracao: "24/07/2024", disciplina_area_setor: "Financeiro", tipo_documento_codigo: "TIPO_INV", usuario_responsavel_email: "admin@empresaA.com" }, // Tipo inválido
    ];
    setParsedData(mockParsed);
    setSelectedRows(new Set(mockParsed.map(row => row.rowIndex)));
  };

  const handleDownloadTemplate = () => {
    const headerString = EXPECTED_HEADERS.join(';');
    const exampleRow = "EXEMPLO-DOC-001;R00;Descrição de Exemplo para Planilha;25/12/2024;Engenharia;TDA001;admin@empresaA.com;PPA;E101A";
    const csvContent = `\uFEFF${headerString}\n${exampleRow}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importacao_documentos.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 500);
    toast({
      title: "Download Iniciado",
      description: "A planilha modelo 'modelo_importacao_documentos.csv' (otimizada para Excel) está sendo baixada.",
      duration: 7000,
    });
  };

  const handleImportDocuments = async () => {
    if (!selectedContractId || !selectedFile || parsedData.length === 0 || (currentUser?.role === 'Admin' && selectedRows.size === 0)) {
        toast({ title: "Dados Incompletos", description: "Por favor, selecione um contrato, um arquivo e ao menos uma linha para importar.", variant: "destructive"});
        return;
    }

    setImportResult(null);
    const dataToImport = currentUser?.role === 'Admin'
      ? parsedData.filter(row => selectedRows.has(row.rowIndex))
      : parsedData;

    startImportingTransition(async () => {
        const result = await importDocumentsFromSheet(dataToImport, selectedContractId);

        setParsedData(prevData => {
            return prevData.map(row => ({
                ...row,
                errors: result.validationErrors[row.rowIndex] || undefined
            }));
        });

        setImportResult({ success: result.success, failed: result.failed, importId: result.importId });
        
        toast({
          title: "Importação Concluída",
          description: `${result.success} documentos importados com sucesso. ${result.failed} falhas.`,
          duration: 7000,
        });

        if (result.failed === 0) {
             setSelectedFile(null);
             setParsedData([]);
             setSelectedRows(new Set());
             const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
             if (fileInput) fileInput.value = '';
        }
    });
  };
  
  const handleToggleRowSelection = (rowIndex: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowIndex)) {
        newSet.delete(rowIndex);
      } else {
        newSet.add(rowIndex);
      }
      return newSet;
    });
  };

  const handleToggleSelectAllRows = (checked: boolean | string) => {
    if (checked) {
      setSelectedRows(new Set(parsedData.map(row => row.rowIndex)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const canImport = selectedContractId && selectedFile && parsedData.length > 0 && (currentUser?.role !== 'Admin' || selectedRows.size > 0) && !isImporting;

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <FileSpreadsheet className="h-7 w-7 text-primary" />
            Importar Documentos por Planilha
          </CardTitle>
          <CardDescription>
            Selecione um contrato, faça upload de uma planilha (.xlsx ou .csv) com os dados dos documentos e importe-os em lote.
            Os cabeçalhos esperados são: {EXPECTED_HEADERS.join('; ')}. O delimitador de colunas deve ser ponto e vírgula (;).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="contractSelect">Contrato (Obrigatório)</Label>
            <Select value={selectedContractId} onValueChange={setSelectedContractId} disabled={contracts.length === 0}>
              <SelectTrigger id="contractSelect">
                <SelectValue placeholder={contracts.length > 0 ? "Selecione o contrato" : "Nenhum contrato acessível"} />
              </SelectTrigger>
              <SelectContent>
                {contracts.map(contract => (
                  <SelectItem key={contract.id} value={contract.id}>{contract.name} ({contract.internalCode})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="fileUpload" className="block">Arquivo da Planilha (.csv)</Label>
              <Label
                htmlFor="fileUpload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-primary" />
                  <p className="mb-2 text-sm text-foreground">
                    <span className="font-semibold">Clique para carregar</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-muted-foreground">CSV ou XLSX (MAX. 5MB)</p>
                </div>
                <Input id="fileUpload" type="file" className="hidden" accept=".csv,.xlsx" onChange={handleFileChange} />
              </Label>
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Arquivo selecionado: <span className="font-medium text-foreground">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
            <Button onClick={handleDownloadTemplate} variant="outline" className="self-center md:self-end h-auto py-3 text-sm">
              <Download className="mr-2 h-4 w-4" />
              Baixar Planilha Modelo <br/>(.csv otimizado para Excel)
            </Button>
          </div>

          {parsedData.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListChecks className="h-5 w-5 text-primary" />
                  Pré-visualização dos Dados da Planilha
                </CardTitle>
                <CardDescription>
                  Confira os dados abaixo. {currentUser?.role === 'Admin' ? 'Desmarque as linhas que não deseja importar.' : 'Todas as linhas válidas serão importadas.'}
                   Total de linhas na planilha: {parsedData.length}. Linhas selecionadas para importação: {currentUser?.role === 'Admin' ? selectedRows.size : parsedData.length}.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {currentUser?.role === 'Admin' && (
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={selectedRows.size === parsedData.length && parsedData.length > 0}
                              onCheckedChange={handleToggleSelectAllRows}
                              aria-label="Selecionar todas as linhas"
                            />
                          </TableHead>
                        )}
                        {EXPECTED_HEADERS.map(header => <TableHead key={header}>{header.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.map((row) => (
                        <TableRow
                          key={row.rowIndex}
                          className={currentUser?.role === 'Admin' && !selectedRows.has(row.rowIndex) ? "opacity-50" : ""}
                        >
                          {currentUser?.role === 'Admin' && (
                            <TableCell>
                              <Checkbox
                                checked={selectedRows.has(row.rowIndex)}
                                onCheckedChange={() => handleToggleRowSelection(row.rowIndex)}
                              />
                            </TableCell>
                          )}
                          {EXPECTED_HEADERS.map(header => <TableCell key={`${row.rowIndex}-${header}`}>{(row as any)[header] || 'N/A'}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                 {parsedData.length > 0 && currentUser?.role === 'Admin' && selectedRows.size === 0 && (
                  <p className="text-sm text-destructive mt-2">Nenhuma linha selecionada para importação.</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 sm:flex-row sm:justify-between">
           <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={!canImport} className="w-full sm:w-auto">
                {isImporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <UploadCloud className="mr-2 h-4 w-4" />
                )}
                {isImporting ? 'Importando...' : `Importar ${currentUser?.role === 'Admin' ? selectedRows.size : parsedData.length} Documento(s)`}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  Confirmar Importação
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Você está prestes a importar {currentUser?.role === 'Admin' ? selectedRows.size : parsedData.length} documento(s) para o contrato "{contracts.find(c => c.id === selectedContractId)?.name || 'N/A'}".
                  Esta ação (simulada) adicionará novos registros de documentos. Deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleImportDocuments}>Confirmar e Importar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {importResult && currentUser?.role === 'Admin' && (
             <Button variant="destructive" onClick={() => toast({ title: "Rollback (Simulação)", description: `O Rollback para importId: ${importResult.importId} seria executado.`})} className="w-full sm:w-auto">
               <Trash2 className="mr-2 h-4 w-4" />
               Desfazer Importação (Rollback)
             </Button>
           )}
        </CardFooter>
      </Card>

      {importResult && (
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle>Resultado da Importação</CardTitle>
            <CardDescription>ID da Importação: {importResult.importId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Documentos importados com sucesso: <span className="font-semibold text-green-600">{importResult.success}</span></p>
            <p>Documentos com falha na importação: <span className="font-semibold text-red-600">{importResult.failed}</span></p>
            {importResult.failed > 0 && (
              <Button variant="outline" onClick={() => toast({ title: "Reimportar Falhas (Simulação)", description: "A funcionalidade para reimportar apenas documentos com falha será implementada."})}>
                Reimportar Documentos com Falha
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
