'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, WandSparkles, Trash2, PlusCircle, Link as LinkIcon, FileWarning, CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import { useTransition, useState, useEffect, type FC } from 'react';
import type { Contract, User, DocumentType, ContractAttachment, Document as DocumentModel } from '@/types';
import ContractFormFields from './contract-form-fields';
import { updateContract } from '@/actions/contractActions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import * as React from 'react';
import { executeContractAnalysis } from '@/actions/analysisActions';
import * as analysisResultService from '@/services/analysisResultService';
import { format, parseISO, isValid } from 'date-fns';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AttachmentManager from './attachment-manager';
import { AlternativeSelect } from '../shared/alternative-select';
import type { AnalysisResult } from '@/types/AnalysisResult';
import Link from 'next/link';
import { Textarea } from '../ui/textarea';
import type { UpdateContractData } from '@/lib/validations/contract';

interface ManageContractClientProps {
    contract: Contract;
    users: User[];
    documentTypes: DocumentType[];
    documents: DocumentModel[];
}

const contractEditSchema = z.object({
  name: z.string().min(3, "Nome do contrato deve ter pelo menos 3 caracteres."),
  internalCode: z.string().min(1, "Código interno é obrigatório."),
  client: z.string().min(1, "Nome do cliente é obrigatório."),
  startDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de início inválida." }),
  endDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de término inválida." }),
  scope: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  commonRisksText: z.string().optional(),
  alertKeywordsText: z.string().optional(),
  documentTypeIdsForAnalysis: z.array(z.string()).optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "A data de término não pode ser anterior à data de início.",
  path: ["endDate"],
});

type ContractEditFormData = z.infer<typeof contractEditSchema>;

const formatDateForInput = (dateString?: string): string => {
    if (!dateString) return '';
    try {
        const date = parseISO(dateString);
        if (isValid(date)) {
            return format(date, 'yyyy-MM-dd');
        }
    } catch (e) {
        console.error("Invalid date for formatting:", dateString);
    }
    return '';
};

export default function ManageContractClient({ contract, users, documentTypes, documents }: ManageContractClientProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, startSavingTransition] = useTransition();
    const [isAnalyzing, startAnalysisTransition] = useTransition();

    const [attachments, setAttachments] = useState<ContractAttachment[]>(contract.attachments || []);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    
    // State for the new evidence document selection UI
    const [evidenceDocTypeIds, setEvidenceDocTypeIds] = useState<string[]>(
        contract.analysisDocumentTypeIds || []
    );
    const [selectedDocTypeToAdd, setSelectedDocTypeToAdd] = useState<string>(''); // Holds the ID of the selected item
    
    const [analysisHistory, setAnalysisHistory] = React.useState<AnalysisResult[]>([]);
    const [selectedAnalysis, setSelectedAnalysis] = React.useState<AnalysisResult | null>(null);
    const [dateRange, setDateRange] = React.useState<{ from?: string; to?: string }>({});
    const [dateFilterType, setDateFilterType] = React.useState<'elaborationDate' | 'approvalDate'>('elaborationDate');

    const methods = useForm<ContractEditFormData>({
        resolver: zodResolver(contractEditSchema),
    });

    useEffect(() => {
        if (contract) {
            methods.reset({
                name: contract.name || '',
                internalCode: contract.internalCode || '',
                client: contract.client || '',
                startDate: formatDateForInput(contract.startDate),
                endDate: formatDateForInput(contract.endDate),
                scope: contract.scope || '',
                status: contract.status || 'active',
                commonRisksText: contract.commonRisks?.join('\n') || '',
                alertKeywordsText: contract.alertKeywords?.join('\n') || '',
            });
            // Sync evidence doc types with contract data on load/reset
            setEvidenceDocTypeIds(contract.analysisDocumentTypeIds || []);
        }
    }, [contract, methods]);

    // Load analysis history when component mounts
    useEffect(() => {
        const loadAnalysisHistory = async () => {
            try {
                const result = await analysisResultService.findAllForContract(contract.id);
                if (result && Array.isArray(result)) {
                    setAnalysisHistory(result);
                }
            } catch (error) {
                console.error('Erro ao carregar histórico de análises:', error);
            }
        };

        loadAnalysisHistory();
    }, [contract.id]);

    const handleSaveChanges = async (formData: ContractEditFormData) => {
      startSavingTransition(async () => {
        try {
          const newFilesData = await Promise.all(
            filesToUpload.map(file => 
              new Promise<{ name: string; size: number; type: string; dataUrl: string }>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type, dataUrl: reader.result as string });
                reader.onerror = reject;
                reader.readAsDataURL(file);
              })
            )
          );

          // Prepare typed object payload for the action
          const commonRisks = formData.commonRisksText
            ? formData.commonRisksText.split('\n').map((s) => s.trim()).filter(Boolean)
            : [];
          const alertKeywords = formData.alertKeywordsText
            ? formData.alertKeywordsText.split('\n').map((s) => s.trim()).filter(Boolean)
            : [];

          const payload: UpdateContractData = {
            name: formData.name,
            internalCode: formData.internalCode,
            client: formData.client,
            startDate: formData.startDate,
            endDate: formData.endDate,
            scope: formData.scope ?? undefined,
            status: formData.status,
            responsibleUserId: (((formData as any).responsibleUserId ?? '') as string).trim() === ''
              ? null
              : ((formData as any).responsibleUserId as string),
            commonRisks,
            alertKeywords,
            analysisDocumentTypeIds: evidenceDocTypeIds,
          };

          const contractUpdateResult = await updateContract(
            contract.id,
            payload
          );

          if (!contractUpdateResult.success) {
            toast({ title: "Falha ao Salvar Contrato", description: contractUpdateResult.message, variant: "destructive" });
            return;
          }

          toast({ title: "Sucesso!", description: "Todas as alterações foram salvas." });
          router.refresh();

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
          toast({ title: "Erro Inesperado", description: errorMessage, variant: "destructive" });
        }
      });
    };

    const availableDocTypesForSelect = documentTypes
        .filter(dt => !evidenceDocTypeIds.includes(dt.id))
        .map(dt => ({ value: dt.id, label: `${dt.name} (${dt.code})` }));

    const handleExecuteAnalysis = () => {
        startAnalysisTransition(async () => {
            try {
                const result = await executeContractAnalysis({
                    contractId: contract.id,
                    dateFilterType: 'elaborationDate'
                });
                if (result.success) {
                    toast({ title: "Análise Executada!", description: "A análise de IA foi executada com sucesso." });
                    // Reload analysis history
                    const historyResult = await analysisResultService.findAllForContract(contract.id);
                    if (historyResult && Array.isArray(historyResult)) {
                        setAnalysisHistory(historyResult);
                    }
                } else {
                    toast({ title: "Falha na Análise", description: result.message, variant: "destructive" });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
                toast({ title: "Erro na Análise", description: errorMessage, variant: "destructive" });
            }
        });
    };

    const handleAddEvidenceDocType = () => {
        if (selectedDocTypeToAdd && !evidenceDocTypeIds.includes(selectedDocTypeToAdd)) {
            setEvidenceDocTypeIds(prev => [...prev, selectedDocTypeToAdd]);
            setSelectedDocTypeToAdd('');
        }
    };

    const handleRemoveEvidenceDocType = (docTypeId: string) => {
        setEvidenceDocTypeIds(prev => prev.filter(id => id !== docTypeId));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/contracts')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Sair
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Gerenciar Contrato Inteligente</h1>
                        <p className="text-muted-foreground">{contract.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button type="button" onClick={() => {
                        if (!contract.id || contract.id === 'undefined') {
                            console.error('ID do contrato inválido para visualização:', contract.id);
                            return;
                        }
                        router.push(`/contracts/${contract.id}`);
                    }} variant="secondary">
                        <Eye className="mr-2 h-4 w-4" /> Visualizar
                    </Button>
                    <Button type="submit" form="edit-contract-form" disabled={isSaving}>
                        {isSaving ? (<Loader2 className="animate-spin mr-2 h-4 w-4" />) : (<Save className="mr-2 h-4 w-4" />)}
                        Salvar Alterações
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados do Contrato</CardTitle>
                            <CardDescription>Edite as informações básicas do contrato.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <FormProvider {...methods}>
                              <form id="edit-contract-form" onSubmit={methods.handleSubmit(handleSaveChanges)} className="space-y-6">
                                <ContractFormFields 
                                    control={methods.control}
                                    errors={methods.formState.errors}
                                    users={users}
                                    isLoading={isSaving}
                                    watch={methods.watch}
                                    setValue={methods.setValue}
                                />
                            
                                <div className="space-y-4">
                                    <Label htmlFor="commonRisks">Riscos Comuns (um por linha)</Label>
                                    <Textarea id="commonRisks" placeholder="Ex.: Atraso na entrega\nFalta de material" {...methods.register('commonRisksText')} />
                                </div>
                                <div className="space-y-4">
                                    <Label htmlFor="alertKeywords">Palavras de Alerta (uma por linha)</Label>
                                    <Textarea id="alertKeywords" placeholder="Ex.: Reprovação\nNão conforme" {...methods.register('alertKeywordsText')} />
                                </div>
                            </form>
                            </FormProvider>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentos Base</CardTitle>
                            <CardDescription>Gerencie os documentos que definem as regras do contrato.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttachmentManager
                                existingAttachments={attachments}
                                filesToUpload={filesToUpload}
                                onExistingRemove={setAttachments}
                                onNewRemove={setFilesToUpload}
                                onFileChange={setFilesToUpload}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Tipos de Documento para Análise</CardTitle>
                            <CardDescription>Selecione os tipos de documento que serão cruzados com os documentos base.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <div className="flex-1">
                                    <AlternativeSelect
                                        options={documentTypes
                                            .filter(dt => !evidenceDocTypeIds.includes(dt.id))
                                            .map(dt => ({ value: dt.id, label: `${dt.name} (${dt.code})` }))}
                                        value={selectedDocTypeToAdd}
                                        onValueChange={setSelectedDocTypeToAdd}
                                        placeholder="Selecione um tipo de documento..."
                                    />
                                </div>
                                <Button type="button" variant="secondary" onClick={handleAddEvidenceDocType}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {evidenceDocTypeIds.length > 0 ? (
                                    evidenceDocTypeIds.map((docTypeId) => {
                                        const dt = documentTypes.find(d => d.id === docTypeId);
                                        return dt ? (
                                            <div key={docTypeId} className="flex items-center justify-between p-2 border rounded-md">
                                                <span>{dt.name} ({dt.code})</span>
                                                <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveEvidenceDocType(docTypeId)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : null;
                                    })
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">Nenhum tipo de documento selecionado para análise.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Análise de IA</CardTitle>
                            <CardDescription>Execute análises de risco e visualize o histórico.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Execute análises de risco e visualize o histórico.</p>
                                </div>
                                <Button type="button" onClick={handleExecuteAnalysis} disabled={isAnalyzing}>
                                    {isAnalyzing ? (
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                    ) : (
                                        <WandSparkles className="mr-2 h-4 w-4" />
                                    )}
                                    Executar Análise
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}