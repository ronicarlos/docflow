
"use client";
import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { generateProcedureContentAction } from '@/actions/procedureActions';
import type { LocationSubArea, PopulatedLocationSubArea, Contract, DocumentType as DocTypeType, LocationArea as LocationAreaType, Document, Discipline, User } from '@/types';
import { UploadCloud, Save, RotateCcw, PlusCircle, Loader2, Sparkles, WandSparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState, useTransition } from 'react';
import { format, isValid, parseISO, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createDocument } from '@/actions/documentActions';
import SpeechToTextButton from '../shared/speech-to-text-button';
import { AlternativeSelect } from '../shared/alternative-select';
import QuickAddModal from '@/components/shared/quick-add-modal';
import EditDocumentTypeModal from '@/components/document-types/edit-document-type-modal';
import NewDisciplineForm from '@/components/disciplines/new-discipline-form';


const NONE_VALUE = "_NONE_";

const documentFormSchema = z.object({
  contractId: z.string().min(1, "Contrato é obrigatório"),
  documentTypeId: z.string().min(1, "Tipo de documento é obrigatório"),
  code: z.string().min(1, "Código do documento é obrigatório"),
  revision: z.string().min(1, "Revisão é obrigatória").default('R00'),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres."),
  aiPrompt: z.string().optional(),
  area: z.string().min(1, "Área/Setor (Disciplina) é obrigatória"),
  responsibleUserId: z.string().min(1, "Usuário responsável é obrigatório"),
  approvingUserId: z.string().optional(),
  elaborationDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), {
    message: "Data de elaboração inválida.",
  }),
  locationAreaId: z.string().optional().nullable(),
  locationSubAreaId: z.string().optional().nullable(),
  file: z.any().refine(files => files?.length === 1, "Arquivo é obrigatório."),
  requiresContinuousImprovement: z.boolean().optional().default(false),
  validityDays: z.coerce.number().int().min(0,"Prazo de validade deve ser 0 ou mais dias").max(999, "Prazo não pode exceder 999 dias").optional().nullable(),
  nextReviewDate: z.string().optional(),
  textContent: z.string().optional(),
});


type DocumentFormData = z.infer<typeof documentFormSchema>;
type ModalType = 'documentType' | 'discipline' | null;

interface DocumentUploadFormProps {
    contracts: Contract[];
    documentTypes: DocTypeType[];
    disciplines: Discipline[];
    users: User[];
    locationAreas: LocationAreaType[];
    locationSubAreas: PopulatedLocationSubArea[];
    originalDocForClone: Document | null;
}

const calculateNextReviewOrExpirationDate = (elaborationDateStr?: string, validityDays?: number | null | undefined): string => {
    if (!elaborationDateStr || !validityDays || validityDays <= 0) {
        return '';
    }
    try {
        const elaborationDate = parseISO(elaborationDateStr);
        if (isValid(elaborationDate)) {
            return format(addDays(elaborationDate, validityDays), 'yyyy-MM-dd');
        }
    } catch (e) { console.error("Erro ao calcular data:", e); }
    return '';
};


const DocumentUploadForm: FC<DocumentUploadFormProps> = ({
    contracts, documentTypes, disciplines, users, locationAreas, locationSubAreas, originalDocForClone
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, startSavingTransition] = useTransition();
  const [isGenerating, startGeneratingTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);


  const { control, handleSubmit, reset, setValue, watch, getValues, formState: { errors } } = useForm<DocumentFormData>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      contractId: '',
      documentTypeId: '',
      code: '',
      revision: 'R00',
      description: '',
      aiPrompt: '',
      area: '',
      responsibleUserId: '',
      approvingUserId: NONE_VALUE,
      elaborationDate: format(new Date(), 'yyyy-MM-dd'),
      locationAreaId: NONE_VALUE,
      locationSubAreaId: NONE_VALUE,
      file: undefined,
      requiresContinuousImprovement: false,
      validityDays: null,
      nextReviewDate: '',
      textContent: '',
    }
  });

  const [availableLocationSubAreas, setAvailableLocationSubAreas] = React.useState<PopulatedLocationSubArea[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  
  const watchedElaborationDate = watch('elaborationDate');
  const watchedValidityDays = watch('validityDays');
  const watchedRequiresImprovement = watch('requiresContinuousImprovement');
  const selectedLocationAreaId = watch('locationAreaId');
  const watchedAiPrompt = watch('aiPrompt');
  const watchedContractId = watch('contractId');
  const watchedArea = watch('area');

  useEffect(() => {
    if (originalDocForClone) {
        const getClonedValue = (value: any): string => {
            if (!value) return '';
            if (typeof value === 'object' && value.id) return value.id;
            if (typeof value === 'object' && value._id && typeof value._id.toString === 'function') return value._id.toString();
            if (typeof value === 'string') return value;
            return '';
        };

        reset({
            contractId: getClonedValue(originalDocForClone.contract),
            documentTypeId: getClonedValue(originalDocForClone.documentType),
            area: originalDocForClone.area,
            responsibleUserId: getClonedValue(originalDocForClone.responsibleUser),
            approvingUserId: getClonedValue(originalDocForClone.currentRevision?.approvingUserId) || NONE_VALUE,
            elaborationDate: originalDocForClone.elaborationDate ? format(parseISO(originalDocForClone.elaborationDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            locationAreaId: getClonedValue(originalDocForClone.locationArea) || NONE_VALUE,
            requiresContinuousImprovement: originalDocForClone.requiresContinuousImprovement || false,
            code: '',
            revision: 'R00',
            description: '',
            aiPrompt: originalDocForClone.aiPrompt || '',
            file: undefined,
            textContent: '',
        });
        toast({ title: "Modo de Clonagem Ativado", description: "Dados carregados. Por favor, forneça um novo código, descrição e anexe o novo arquivo." });
    }
  }, [originalDocForClone, reset, toast]);

  useEffect(() => {
    if (watchedRequiresImprovement) {
        const calculatedDate = calculateNextReviewOrExpirationDate(watchedElaborationDate, watchedValidityDays);
        if (watch('nextReviewDate') !== calculatedDate) {
             setValue('nextReviewDate', calculatedDate, { shouldValidate: true });
        }
    } else {
        if (watch('validityDays') !== null) {
            setValue('validityDays', null, { shouldValidate: true });
        }
    }
  }, [watchedRequiresImprovement, watchedElaborationDate, watchedValidityDays, setValue, watch]);

  useEffect(() => {
    if (selectedLocationAreaId && selectedLocationAreaId !== NONE_VALUE) {
      const filtered = locationSubAreas.filter(
        (sub) => String(sub.locationArea?.id) === selectedLocationAreaId
      );
      setAvailableLocationSubAreas(filtered);
    } else {
      setAvailableLocationSubAreas([]);
    }
  }, [selectedLocationAreaId, locationSubAreas]);

  useEffect(() => {
    const currentSubAreaId = watch('locationSubAreaId');
    if (currentSubAreaId && currentSubAreaId !== NONE_VALUE) {
        const isStillAvailable = availableLocationSubAreas.some(sub => sub.id === currentSubAreaId);
        if (!isStillAvailable) {
            setValue('locationSubAreaId', NONE_VALUE, { shouldValidate: true });
        }
    }
  }, [availableLocationSubAreas, watch, setValue]);

  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setSelectedFileName(file.name);
    } else {
        setSelectedFileName(null);
    }
  };

  const handleGenerateContent = () => {
    if (!watchedAiPrompt || watchedAiPrompt.trim().length < 10) {
        toast({ title: "Instruções para IA Necessárias", description: "Forneça instruções detalhadas para a IA gerar o conteúdo do documento.", variant: "destructive" });
        return;
    }
    startGeneratingTransition(async () => {
        const file = watch('file')?.[0];
        let attachmentData;
        if (file) {
             const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            attachmentData = { fileLink: dataUrl, fileName: file.name, fileType: file.type };
        }

        const result = await generateProcedureContentAction({ 
            title: watch('code'),
            category: 'contract',
            contractName: contracts.find(c => c.id === watchedContractId)?.name,
            area: watchedArea,
            aiPrompt: watchedAiPrompt,
            attachments: attachmentData ? [attachmentData] : [],
        });
        if (result.success && result.content) {
            setValue('textContent', result.content, { shouldValidate: true });
            toast({ title: "Conteúdo Gerado!", description: "O conteúdo foi gerado pela IA. Revise e salve o documento." });
        } else {
            toast({ title: "Erro na Geração", description: result.message, variant: "destructive" });
        }
    });
  }
  
  const onSubmit = (data: DocumentFormData) => {
    const file = data.file?.[0];
    if (!file) {
        toast({ title: "Arquivo Faltando", description: "Por favor, anexe um arquivo para o documento.", variant: "destructive"});
        return;
    }

    startSavingTransition(async () => {
        const fileDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        const fileData = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileDataUrl,
        };
        const { file: _, ...formData } = data;
        const result = await createDocument(formData, fileData);

        if (result.success) {
            toast({ title: "Sucesso!", description: result.message });
            reset();
            setSelectedFileName(null);
            const fileInputEl = document.getElementById('file-upload-main') as HTMLInputElement;
            if (fileInputEl) fileInputEl.value = '';
            router.push('/dashboard');
        } else {
            toast({ title: "Erro ao Salvar", description: result.message, variant: "destructive" });
        }
    });
  };

  const handleOpenModal = (type: ModalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  
  const handleModalSaveSuccess = () => {
    setIsModalOpen(false);
    toast({ title: "Item Adicionado!", description: `As opções foram atualizadas. A página será recarregada para refletir a mudança.`});
    router.refresh();
  };

  const renderModalContent = () => {
    switch (modalType) {
      case 'documentType': return <EditDocumentTypeModal disciplines={disciplines} onSaveSuccess={handleModalSaveSuccess} />;
      case 'discipline': return <NewDisciplineForm isInModal onSaveSuccess={handleModalSaveSuccess} />;
      default: return null;
    }
  };
  
    return (
        <>
        <Card className="w-full max-w-3xl mx-auto shadow-xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <UploadCloud className="h-7 w-7 text-primary" />
                    Carregar Novo Documento {originalDocForClone ? `(Baseado em ${originalDocForClone.code})` : ""}
                </CardTitle>
                <CardDescription>Preencha os detalhes abaixo para carregar um novo documento. Campos marcados com * são obrigatórios.</CardDescription>
                {originalDocForClone && <p className="text-xs text-muted-foreground pt-1 font-mono">ID Original: {originalDocForClone.id}</p>}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="contractId-upload">Contrato *</Label>
                            <Controller name="contractId" control={control} render={({ field }) => (
                                <AlternativeSelect
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={contracts.length === 0}
                                  placeholder={contracts.length === 0 ? "Nenhum contrato" : "Selecione o contrato"}
                                  options={contracts.map(c => ({ value: c.id, label: c.name }))}
                                />
                            )} />
                            {errors.contractId && <p className="text-sm text-destructive mt-1">{errors.contractId.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="documentTypeId-upload">Tipo de Documento *</Label>
                             <div className="flex items-center gap-1">
                                <Controller name="documentTypeId" control={control} render={({ field }) => (
                                    <AlternativeSelect
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        disabled={documentTypes.length === 0}
                                        placeholder={documentTypes.length === 0 ? "Nenhum tipo" : "Selecione o tipo"}
                                        options={documentTypes.map(dt => ({ value: dt.id, label: `${dt.name} (${dt.code})` }))}
                                        containerClassName="flex-grow"
                                    />
                                )} />
                                <Button size="icon" variant="outline" type="button" onClick={() => handleOpenModal('documentType')}><PlusCircle className="h-4 w-4"/></Button>
                            </div>
                            {errors.documentTypeId && <p className="text-sm text-destructive mt-1">{errors.documentTypeId.message}</p>}
                        </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="code-upload">Código do Documento *</Label>
                            <Controller name="code" control={control} render={({ field }) => <Input id="code-upload" {...field} />} />
                            {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="revision-upload">Revisão *</Label>
                            <Controller name="revision" control={control} render={({ field }) => <Input id="revision-upload" {...field} />} />
                            {errors.revision && <p className="text-sm text-destructive mt-1">{errors.revision.message}</p>}
                        </div>
                    </div>
                     <div>
                        <div className="flex items-center justify-between mb-1">
                          <Label htmlFor="description-upload">Descrição do Documento *</Label>
                          <SpeechToTextButton targetId="description-upload" onTranscript={(t) => setValue('description', t)} onFinalTranscript={() => {}} />
                        </div>
                        <Controller name="description" control={control} render={({ field }) => <Textarea id="description-upload" placeholder="Forneça uma descrição detalhada do documento." rows={3} {...field} />} />
                        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="elaborationDate-upload">Data de Elaboração *</Label>
                        <Controller name="elaborationDate" control={control} render={({ field }) => <Input id="elaborationDate-upload" type="date" {...field} />} />
                        {errors.elaborationDate && <p className="text-sm text-destructive mt-1">{errors.elaborationDate.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="area-upload">Área/Setor (Disciplina) *</Label>
                         <div className="flex items-center gap-1">
                            <Controller name="area" control={control} render={({ field }) => (
                                <AlternativeSelect
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={disciplines.length === 0}
                                    placeholder={disciplines.length === 0 ? "Nenhuma disciplina" : "Selecione a disciplina"}
                                    options={disciplines.map(d => ({ value: d.name, label: d.name }))}
                                    containerClassName="flex-grow"
                                />
                            )} />
                            <Button size="icon" variant="outline" type="button" onClick={() => handleOpenModal('discipline')}><PlusCircle className="h-4 w-4"/></Button>
                        </div>
                        {errors.area && <p className="text-sm text-destructive mt-1">{errors.area.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="responsibleUserId-upload">Usuário Responsável *</Label>
                            <Controller name="responsibleUserId" control={control} render={({ field }) => (
                                <AlternativeSelect
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={users.length === 0}
                                    placeholder={users.length === 0 ? "Nenhum usuário" : "Selecione o responsável"}
                                    options={users.map(u => ({ value: u.id, label: u.name }))}
                                />
                            )} />
                            {errors.responsibleUserId && <p className="text-sm text-destructive mt-1">{errors.responsibleUserId.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="approvingUserId-upload">Aprovador Designado *</Label>
                            <Controller name="approvingUserId" control={control} render={({ field }) => (
                                <AlternativeSelect
                                    value={field.value || NONE_VALUE}
                                    onValueChange={field.onChange}
                                    disabled={users.filter(u => u && u.id && (u.role === 'Approver' || u.role === 'Admin')).length === 0}
                                    placeholder="Selecione o aprovador"
                                    options={[
                                        { value: NONE_VALUE, label: "Nenhum / Não Designado" },
                                        ...users.filter(u => u && u.id && (u.role === 'Approver' || u.role === 'Admin')).map(u => ({ value: u.id, label: u.name }))
                                    ]}
                                />
                            )} />
                            {errors.approvingUserId && <p className="text-sm text-destructive mt-1">{errors.approvingUserId.message}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="locationAreaId-upload">Localização</Label>
                            <Controller name="locationAreaId" control={control} render={({ field }) => ( 
                                <AlternativeSelect 
                                    value={field.value || NONE_VALUE} 
                                    onValueChange={value => field.onChange(value === NONE_VALUE ? '' : value)} 
                                    disabled={locationAreas.length === 0}
                                    placeholder="Selecione a localização"
                                    options={[{ value: NONE_VALUE, label: "Nenhuma" }, ...locationAreas.map(la => ({ value: la.id, label: la.name }))]}
                                />
                            )} />
                        </div>
                        <div>
                            <Label htmlFor="locationSubAreaId-upload">Sub Localização</Label>
                            <Controller name="locationSubAreaId" control={control} render={({ field }) => ( 
                                <AlternativeSelect 
                                    value={field.value || NONE_VALUE} 
                                    onValueChange={value => field.onChange(value === NONE_VALUE ? '' : value)} 
                                    disabled={!selectedLocationAreaId || selectedLocationAreaId === NONE_VALUE || availableLocationSubAreas.length === 0}
                                    placeholder={availableLocationSubAreas.length > 0 ? "Selecione" : "Nenhuma disponível"}
                                    options={[{ value: NONE_VALUE, label: "Nenhuma" }, ...availableLocationSubAreas.map(lsa => ({ value: lsa.id, label: lsa.name })) ]}
                                />
                            )} />
                        </div>
                    </div>
                    
                    
                    <div>
                        <Label htmlFor="file-upload-main">Arquivo do Documento *</Label>
                        <Controller
                            name="file"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    id="file-upload-main"
                                    type="file"
                                    ref={field.ref}
                                    name={field.name}
                                    onBlur={field.onBlur}
                                    onChange={(e) => {
                                        field.onChange(e.target.files);
                                        handleFileChange(e);
                                    }}
                                />
                            )}
                        />
                        {selectedFileName && <p className="text-xs text-muted-foreground mt-1">Arquivo: {selectedFileName}</p>}
                        {errors.file && <p className="text-sm text-destructive mt-1">{errors.file.message as string}</p>}
                    </div>
                    
                     <div className="space-y-4 pt-3 border-t mt-4">
                        <div className="flex items-center space-x-2">
                            <Controller name="requiresContinuousImprovement" control={control} render={({ field }) => ( <Checkbox id="requiresContinuousImprovement-upload" checked={field.value} onCheckedChange={field.onChange} /> )} />
                            <Label htmlFor="requiresContinuousImprovement-upload">Requer Melhoria Contínua?</Label>
                        </div>
                        {watchedRequiresImprovement && (
                            <>
                            <div>
                                <Label htmlFor="validityDays-upload">Prazo de Validade (dias) *</Label>
                                <Controller name="validityDays" control={control} render={({ field }) => ( <Input id="validityDays-upload" type="number" {...field} value={field.value ?? ''} /> )} />
                                {errors.validityDays && <p className="text-sm text-destructive mt-1">{errors.validityDays.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="nextReviewDate-upload">Data Próxima Análise (Calculada)</Label>
                                <Controller name="nextReviewDate" control={control} render={({ field }) => ( <Input id="nextReviewDate-upload" type="date" {...field} readOnly className="bg-muted/50" /> )} />
                            </div>
                            </>
                        )}
                    </div>
                    
                    <Card className="bg-primary/5 border-primary/20">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg text-primary"><WandSparkles className="h-5 w-5" />Instruções para IA (Opcional)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <div>
                            <div className="flex items-center justify-between mb-1">
                                <Label htmlFor="aiPrompt-upload">Descreva o que a IA deve gerar, ou o contexto para análises futuras</Label>
                                <SpeechToTextButton targetId="aiPrompt-upload" onTranscript={(t) => setValue('aiPrompt', t)} onFinalTranscript={() => {}} />
                            </div>
                            <Controller name="aiPrompt" control={control} render={({ field }) => (
                                <Textarea id="aiPrompt-upload" {...field} value={field.value || ''} rows={4} placeholder="Ex: Gere um procedimento detalhado para controle de documentos conforme a ISO 9001, incluindo etapas de criação, revisão, aprovação, distribuição e controle de versões obsoletas..." />
                            )} />
                        </div>
                         <div className="flex justify-end">
                            <Button type="button" onClick={handleGenerateContent} disabled={isGenerating || !watchedAiPrompt} size="sm" variant="outline">
                              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                              Gerar Conteúdo do Documento com IA
                            </Button>
                        </div>
                        <Controller name="textContent" control={control} render={({ field }) => <Textarea {...field} className="hidden" />} />
                      </CardContent>
                    </Card>


                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSaving ? 'Enviando...' : 'Salvar Documento'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => reset()} disabled={isSaving}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Limpar
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>

        {isModalOpen && (
            <QuickAddModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} title={`Adicionar Novo ${modalType === 'documentType' ? 'Tipo de Documento' : 'Disciplina'}`} description="">
            {renderModalContent()}
            </QuickAddModal>
        )}
        </>
    );
};

export default DocumentUploadForm;
