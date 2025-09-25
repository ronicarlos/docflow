

'use client';
import type { FC } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import QuickAddModal from '@/components/shared/quick-add-modal';
import RevisionHistory from '@/components/document/revision-history';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { LocationSubArea, PopulatedLocationSubArea, Document, Contract as ContractType, DocumentType as DocTypeType, LocationArea as LocationAreaType, Discipline, User, DocumentStatus } from '@/types';
import { DOCUMENT_STATUSES } from '@/lib/constants';
import { Save, RotateCcw, Edit3, ArrowLeft, Loader2 as Loader2Icon, PlusCircle, FilePlus2, TextSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, isValid, parseISO } from 'date-fns';
import { updateDocumentMetadata, createNewRevision } from '@/actions/documentActions';
import { useAuth } from '@/hooks/use-auth';
import SpeechToTextButton from '../shared/speech-to-text-button';
import { AlternativeSelect } from '../shared/alternative-select';
import NewDisciplineForm from '@/components/disciplines/new-discipline-form';
import EditDocumentTypeModal from '@/components/document-types/edit-document-type-modal';
import NewEditContractForm from '@/components/contracts/new-edit-contract-form';
import NewLocationAreaForm from '@/components/location-areas/new-location-area-form';
import NewLocationSubAreaForm from '@/components/location-sub-areas/new-location-sub-area-form';
import NewUserForm from '@/components/users/new-user-form';


const NONE_VALUE = "_NONE_";

const documentEditSchema = z.object({
  contractId: z.string().min(1, "Contrato é obrigatório"),
  documentTypeId: z.string().min(1, "Tipo de documento é obrigatório"),
  code: z.string().min(1, "Código do documento é obrigatório"),
  revision: z.string().min(1, "Revisão é obrigatória"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  aiPrompt: z.string().optional(),
  area: z.string().min(1, "Área/Setor (Disciplina) é obrigatória"),
  status: z.enum(Object.keys(DOCUMENT_STATUSES) as [DocumentStatus, ...DocumentStatus[]]).default('draft'),
  responsibleUserId: z.string().min(1, "Usuário responsável é obrigatório"),
  approvingUserId: z.string().optional(),
  elaborationDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de elaboração inválida." }),
  locationAreaId: z.string().optional().nullable(),
  locationSubAreaId: z.string().optional().nullable(),
  file: z.any().optional(), // File is optional on edit
  requiresContinuousImprovement: z.boolean().optional().default(false),
  validityDays: z.coerce.number().int().min(0).optional().nullable(),
  nextReviewDate: z.string().optional(),
  textContent: z.string().optional(),
});

type DocumentEditFormData = z.infer<typeof documentEditSchema>;
type ModalType = 'documentType' | 'discipline' | 'contract' | 'user' | 'locationArea' | 'locationSubArea' | null;

interface EditDocumentFormProps {
  initialDocument: Document;
  contracts: ContractType[];
  documentTypes: DocTypeType[];
  disciplines: Discipline[];
  users: User[];
  locationAreas: LocationAreaType[];
  locationSubAreas: PopulatedLocationSubArea[];
  currentUser?: Pick<User, 'id' | 'name' | 'email' | 'role' | 'tenantId'> | null;
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

export default function EditDocumentForm({
  initialDocument,
  contracts,
  documentTypes,
  disciplines,
  users,
  locationAreas,
  locationSubAreas,
  currentUser
}: EditDocumentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSaving, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);

  const [availableSubAreas, setAvailableSubAreas] = useState<PopulatedLocationSubArea[]>([]);
  const [showNewRevisionForm, setShowNewRevisionForm] = useState(false);
  const [newRevisionObservation, setNewRevisionObservation] = useState('');
  const [newRevisionFile, setNewRevisionFile] = useState<FileList | null>(null);
  const [isSavingNewRevision, startSavingNewRevision] = useTransition();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(initialDocument.currentRevision?.fileName || null);

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DocumentEditFormData>({
    resolver: zodResolver(documentEditSchema),
    defaultValues: {
      contractId: '',
      documentTypeId: '',
      code: '',
      revision: '',
      description: '',
      aiPrompt: '',
      area: '',
      status: 'draft',
      responsibleUserId: '',
      approvingUserId: NONE_VALUE,
      elaborationDate: '',
      locationAreaId: NONE_VALUE,
      locationSubAreaId: NONE_VALUE,
      file: undefined,
      requiresContinuousImprovement: false,
      validityDays: null,
      nextReviewDate: '',
      textContent: ''
    }
  });
  
  const getSafeId = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field.id) return field.id;
    if (typeof field === 'object' && field._id) return field._id.toString();
    return '';
  };
  
  const handleModalSaveSuccess = () => {
    setIsModalOpen(false);
    toast({ title: "Item Adicionado!", description: `As opções foram atualizadas. A página será recarregada para refletir a mudança.`});
    router.refresh();
  };

  const openModal = (type: ModalType) => {
      setModalType(type);
      setIsModalOpen(true);
  };
  
  const renderModalContent = () => {
    switch(modalType) {
        case 'documentType': return <EditDocumentTypeModal disciplines={disciplines} onSaveSuccess={handleModalSaveSuccess}/>;
        case 'discipline': return <NewDisciplineForm isInModal onSaveSuccess={handleModalSaveSuccess} />;
        case 'contract': return <NewEditContractForm users={users} mode="create" />;
        case 'user': return <NewUserForm disciplines={disciplines} contracts={contracts} />;
        case 'locationArea': return <NewLocationAreaForm />;
        case 'locationSubArea': return <NewLocationSubAreaForm locationAreas={locationAreas} />;
        default: return null;
    }
  };

  const selectedLocationAreaId = watch('locationAreaId');
  const watchedRequiresImprovement = watch('requiresContinuousImprovement');
  const watchedElaborationDate = watch('elaborationDate');
  const watchedValidityDays = watch('validityDays');

  useEffect(() => {
    if (initialDocument) {
      reset({
          contractId: getSafeId(initialDocument.contract),
          documentTypeId: getSafeId(initialDocument.documentType),
          code: initialDocument.code,
          revision: initialDocument.currentRevision?.revisionNumber || 'R00',
          description: initialDocument.description,
          aiPrompt: initialDocument.aiPrompt || '',
          area: initialDocument.area,
          status: initialDocument.status,
          responsibleUserId: getSafeId(initialDocument.responsibleUser),
          approvingUserId: initialDocument.currentRevision?.approvingUserId || NONE_VALUE,
          elaborationDate: initialDocument.elaborationDate ? format(parseISO(initialDocument.elaborationDate), 'yyyy-MM-dd') : '',
          locationAreaId: getSafeId(initialDocument.locationArea) || NONE_VALUE,
          locationSubAreaId: getSafeId(initialDocument.locationSubArea) || NONE_VALUE,
          requiresContinuousImprovement: initialDocument.requiresContinuousImprovement,
          validityDays: initialDocument.validityDays,
          nextReviewDate: initialDocument.nextReviewDate ? format(parseISO(initialDocument.nextReviewDate), 'yyyy-MM-dd') : '',
      });
    }
  }, [initialDocument, reset]);

  
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
    const filtered = selectedLocationAreaId && selectedLocationAreaId !== NONE_VALUE
      ? locationSubAreas.filter(sub => sub.locationArea?.id === selectedLocationAreaId)
      : [];
    setAvailableSubAreas(filtered);
    if (!filtered.find(sub => sub.id === watch('locationSubAreaId'))) {
      setValue('locationSubAreaId', '');
    }
  }, [selectedLocationAreaId, locationSubAreas, setValue, watch]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (initialDocument.status !== 'draft') {
        toast({ title: "Ação Inválida", description: "Não é possível substituir o arquivo de uma revisão que não está em rascunho. Crie uma nova revisão.", variant: "destructive" });
        e.target.value = ''; // Limpa o input
        return;
      }
      setSelectedFileName(file.name);
      setValue('file', e.target.files, { shouldValidate: true });
    } else {
      setSelectedFileName(initialDocument.currentRevision?.fileName || null);
    }
  };

  const onSubmit: SubmitHandler<DocumentEditFormData> = (data) => {
    startTransition(async () => {
      const documentId = initialDocument?.id;
      if (!documentId) {
        toast({ title: "Erro Crítico", description: "O ID do documento para atualização é inválido.", variant: "destructive" });
        return;
      }

      let fileUploadData;
      const file = data.file?.[0];

      if (file) {
        try {
          const fileDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          fileUploadData = {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            fileDataUrl,
          };
        } catch (error) {
          toast({ title: "Erro de Arquivo", description: "Não foi possível processar o arquivo.", variant: "destructive" });
          return;
        }
      }

      const { file: _, ...formData } = data;
      
      if (!user || !user.tenantId) {
        toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
        return;
      }
      
      const dataWithTenantId = {
        ...formData,
        tenantId: user.tenantId
      };
      const result = await updateDocumentMetadata(documentId, dataWithTenantId, fileUploadData);

      if (result.success) {
        toast({ title: "Documento Atualizado!", description: result.message });
        router.refresh();
      } else {
        toast({ title: "Falha ao Atualizar", description: result.message, variant: "destructive" });
      }
    });
  };

  const handleSaveNewRevision = async () => {
    if (!currentUser) {
        toast({ title: "Erro", description: "Usuário não identificado para criar revisão.", variant: "destructive" });
        return;
    }
    const file = newRevisionFile?.[0];
    if (!file) {
      toast({ title: "Arquivo Obrigatório", description: "Por favor, anexe o arquivo da nova revisão.", variant: "destructive" });
      return;
    }

    let fileDataUrl: string;
    try {
        fileDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    } catch(error) {
        toast({ title: "Erro de Arquivo", description: "Não foi possível ler o arquivo da nova revisão.", variant: "destructive" });
        return;
    }
    
    startSavingNewRevision(async () => {
      if (!user || !user.tenantId) {
        toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
        return;
      }
      
      const result = await createNewRevision(initialDocument.id, newRevisionObservation, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileDataUrl,
      });

      if (result.success) {
          toast({ title: "Nova Revisão Criada", description: result.message });
          router.refresh(); // Refresh the page to show the new data
          setShowNewRevisionForm(false);
          setNewRevisionFile(null);
          setNewRevisionObservation('');
      } else {
          toast({ title: "Erro ao criar revisão", description: result.message, variant: "destructive" });
      }
    });
  };
  
  const canCreateNewRevision = initialDocument?.status === 'approved';

  const getNextRevisionNumber = (currentRevisionNumber?: string): string => {
    if (!currentRevisionNumber) return 'R00';
    const matchNumeric = currentRevisionNumber.match(/^(R)?(\d+)$/i);
    if (matchNumeric && matchNumeric[2]) {
      const num = parseInt(matchNumeric[2], 10);
      return `R${String(num + 1).padStart(2, '0')}`;
    }
    
    const matchAlpha = currentRevisionNumber.match(/^([A-Z])(\d*)$/i);
    if (matchAlpha && matchAlpha[1]) {
        const letter = matchAlpha[1].toUpperCase();
        const numberPart = matchAlpha[2] ? parseInt(matchAlpha[2], 10) : -1; 
        
        if (numberPart !== -1 && !isNaN(numberPart)) { 
            return `${letter}${String(numberPart + 1).padStart(String(numberPart).length > 1 ? String(numberPart).length : 0, '0')}`;
        } else if (letter >= 'A' && letter < 'Z') { 
            return String.fromCharCode(letter.charCodeAt(0) + 1);
        }
    }
    return `${currentRevisionNumber}-Nova`;
  };

  const calculatedNewRevisionNumber = initialDocument && initialDocument.currentRevision ? getNextRevisionNumber(initialDocument.currentRevision.revisionNumber) : 'R??';

  return (
    <>
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Edit3 className="h-7 w-7 text-primary" /> Editar Documento: {initialDocument.code}
          </CardTitle>
          <p className="text-xs text-muted-foreground pt-1 font-mono">ID: {initialDocument.id}</p>
          <CardDescription>Modifique os metadados do documento. Para criar uma nova versão, use o botão "Adicionar Nova Revisão".</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <Label htmlFor="contractId-edit">Contrato *</Label>
                    <Controller name="contractId" control={control} render={({ field }) => (
                        <AlternativeSelect
                          value={field.value} onValueChange={field.onChange} disabled={contracts.length === 0}
                          placeholder={contracts.length === 0 ? "Nenhum contrato" : "Selecione o contrato"}
                          options={contracts.map(c => ({ value: c.id, label: c.name }))}
                        />
                    )} />
                    {errors.contractId && <p className="text-sm text-destructive mt-1">{errors.contractId.message}</p>}
                </div>
                <div>
                    <Label htmlFor="documentTypeId-edit">Tipo de Documento *</Label>
                    <div className="flex items-center gap-1">
                        <Controller name="documentTypeId" control={control} render={({ field }) => (
                            <AlternativeSelect
                                value={field.value} onValueChange={field.onChange} disabled={documentTypes.length === 0}
                                placeholder={documentTypes.length === 0 ? "Nenhum tipo" : "Selecione o tipo"}
                                options={documentTypes.map(dt => ({ value: dt.id, label: `${dt.name} (${dt.code})` }))}
                                containerClassName="flex-grow"
                            />
                        )} />
                        <Button size="icon" variant="outline" type="button" onClick={() => openModal('documentType')}><PlusCircle className="h-4 w-4"/></Button>
                    </div>
                    {errors.documentTypeId && <p className="text-sm text-destructive mt-1">{errors.documentTypeId.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="code-edit">Código do Documento *</Label>
                    <Controller name="code" control={control} render={({ field }) => <Input id="code-edit" {...field} value={field.value ?? ''} />} />
                    {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
                </div>
                <div>
                    <Label htmlFor="revision-edit">Revisão (Atual) *</Label>
                    <Controller name="revision" control={control} render={({ field }) => <Input id="revision-edit" {...field} value={field.value ?? ''} />} />
                    {errors.revision && <p className="text-sm text-destructive mt-1">{errors.revision.message}</p>}
                </div>
            </div>
            <div>
                <Label htmlFor="elaborationDate-edit">Data de Elaboração *</Label>
                <Controller name="elaborationDate" control={control} render={({ field }) => <Input id="elaborationDate-edit" type="date" {...field} value={field.value ?? ''} />} />
                {errors.elaborationDate && <p className="text-sm text-destructive mt-1">{errors.elaborationDate.message}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="area-edit">Área/Setor (Disciplina) *</Label>
                    <div className="flex items-center gap-1">
                        <Controller name="area" control={control} render={({ field }) => (
                            <AlternativeSelect
                                value={field.value} onValueChange={field.onChange} disabled={disciplines.length === 0}
                                placeholder={disciplines.length === 0 ? "Nenhuma disciplina" : "Selecione a disciplina"}
                                options={disciplines.map(d => ({ value: d.name, label: d.name }))}
                                containerClassName="flex-grow"
                            />
                        )} />
                        <Button size="icon" variant="outline" type="button" onClick={() => openModal('discipline')}><PlusCircle className="h-4 w-4"/></Button>
                    </div>
                    {errors.area && <p className="text-sm text-destructive mt-1">{errors.area.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="status-edit">Status *</Label>
                     <Controller name="status" control={control} render={({ field }) => (
                        <AlternativeSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            placeholder="Selecione o status"
                            options={Object.entries(DOCUMENT_STATUSES).map(([key, value]) => ({ value: key, label: value.label }))}
                        />
                     )} />
                    {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="responsibleUserId-edit">Usuário Responsável *</Label>
                    <Controller name="responsibleUserId" control={control} render={({ field }) => (
                        <AlternativeSelect
                            value={field.value} onValueChange={field.onChange} disabled={users.length === 0}
                            placeholder={users.length === 0 ? "Nenhum usuário" : "Selecione o responsável"}
                            options={users.map(u => ({ value: u.id, label: u.name }))}
                        />
                    )} />
                    {errors.responsibleUserId && <p className="text-sm text-destructive mt-1">{errors.responsibleUserId.message}</p>}
                </div>
                 <div>
                    <Label htmlFor="approvingUserId-edit">Usuário Responsável pela Aprovação (Opcional se não "Em Aprovação")</Label>
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
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <Label htmlFor="locationAreaId-edit">Localização</Label>
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
                    <Label htmlFor="locationSubAreaId-edit">Sub Localização</Label>
                    <Controller name="locationSubAreaId" control={control} render={({ field }) => ( 
                        <AlternativeSelect 
                            value={field.value || NONE_VALUE} 
                            onValueChange={value => field.onChange(value === NONE_VALUE ? '' : value)} 
                            disabled={!selectedLocationAreaId || selectedLocationAreaId === NONE_VALUE || availableSubAreas.length === 0}
                            placeholder={availableSubAreas.length > 0 ? "Selecione" : "Nenhuma disponível"}
                            options={[{ value: NONE_VALUE, label: "Nenhuma" }, ...availableSubAreas.map(lsa => ({ value: lsa.id, label: lsa.name })) ]}
                        />
                    )} />
                </div>
            </div>
             <div>
                <Label htmlFor="description-edit">Descrição *</Label>
                <Controller name="description" control={control} render={({ field }) => ( <Textarea id="description-edit" {...field} value={field.value ?? ''} rows={4} placeholder="Descreva o propósito e o conteúdo do documento." /> )} />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
            </div>
             <div className="flex items-center space-x-2">
                <Controller name="requiresContinuousImprovement" control={control} render={({ field }) => ( <Checkbox id="requiresContinuousImprovement-edit" checked={field.value} onCheckedChange={field.onChange} /> )} />
                <Label htmlFor="requiresContinuousImprovement-edit">Requer Melhoria Contínua?</Label>
            </div>
            {watchedRequiresImprovement && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label htmlFor="validityDays-edit">Prazo de Validade (dias) *</Label>
                        <Controller name="validityDays" control={control} render={({ field }) => ( <Input id="validityDays-edit" type="number" {...field} value={field.value ?? ''} /> )} />
                        {errors.validityDays && <p className="text-sm text-destructive mt-1">{errors.validityDays.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="nextReviewDate-edit">Data Próxima Análise (Calculada)</Label>
                        <Controller name="nextReviewDate" control={control} render={({ field }) => ( <Input id="nextReviewDate-edit" type="date" {...field} value={field.value ?? ''} readOnly className="bg-muted/50" /> )} />
                    </div>
                </div>
            )}
            
            <div>
                <Label htmlFor="file-upload-edit">Substituir Arquivo (somente para Rascunho)</Label>
                <Controller name="file" control={control} render={({ field }) => (
                    <Input id="file-upload-edit" type="file" ref={field.ref} name={field.name} onBlur={field.onBlur}
                        onChange={(e) => {
                            field.onChange(e.target.files);
                            handleFileChange(e);
                        }}
                    />
                )} />
                 {selectedFileName && <p className="text-xs text-muted-foreground mt-1">Arquivo atual: {selectedFileName}</p>}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                 <Button type="submit" className="w-full sm:w-auto" disabled={isSaving || showNewRevisionForm}>
                     <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                 </Button>
                 
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* O AlertDialog fica em volta do botão para funcionar */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button type="button" variant="outline" className="w-full sm:w-auto" disabled={!canCreateNewRevision}>
                                        <FilePlus2 className="mr-2 h-4 w-4" /> Adicionar Nova Revisão
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirmar Nova Revisão</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Isto criará a revisão '{calculatedNewRevisionNumber}' e a submeterá para aprovação. Deseja continuar?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => setShowNewRevisionForm(true)}>Sim, Criar Revisão</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TooltipTrigger>
                        {!canCreateNewRevision && (
                            <TooltipContent>
                                <p>Apenas documentos com status "Aprovado" podem ter novas revisões.</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                 </TooltipProvider>

                <Button type="button" variant="outline" onClick={() => router.push('/dashboard')} className="w-full sm:w-auto" disabled={isSaving || showNewRevisionForm}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Cancelar Edição
                </Button>
             </div>
          </form>
        </CardContent>
      </Card>

        {showNewRevisionForm && (
            <Card className="w-full max-w-3xl mx-auto shadow-xl mt-8 border-primary border-2">
                <CardHeader>
                    <CardTitle className="text-xl">Nova Revisão: {calculatedNewRevisionNumber}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="newRevisionObservation">Observações da Revisão *</Label>
                        <Textarea id="newRevisionObservation" value={newRevisionObservation} onChange={(e) => setNewRevisionObservation(e.target.value)} disabled={isSavingNewRevision} />
                    </div>
                    <div>
                        <Label htmlFor="newRevisionFile">Arquivo da Nova Revisão *</Label>
                        <Input id="newRevisionFile" type="file" onChange={(e) => setNewRevisionFile(e.target.files)} disabled={isSavingNewRevision} />
                    </div>
                </CardContent>
                <CardFooter className="gap-3">
                    <Button onClick={handleSaveNewRevision} disabled={isSavingNewRevision || !newRevisionObservation || !newRevisionFile}>
                       {isSavingNewRevision ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar Revisão
                    </Button>
                     <Button variant="outline" onClick={() => setShowNewRevisionForm(false)} disabled={isSavingNewRevision}>Cancelar</Button>
                </CardFooter>
            </Card>
        )}
      
      <div className="mt-8">
        <RevisionHistory revisions={initialDocument.revisions} documentCode={initialDocument.code} />
      </div>

       {isModalOpen && (
            <QuickAddModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} title={`Adicionar Novo ${modalType === 'documentType' ? 'Tipo de Documento' : 'Disciplina'}`} description="">
            {renderModalContent()}
            </QuickAddModal>
        )}
    </>
  );
}

