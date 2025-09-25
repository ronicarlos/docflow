
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { upsertProcedure, generateProcedureContentAction } from '@/actions/procedureActions';
import type { Procedure, Contract, Discipline, User, ProcedureAttachment } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { WandSparkles, FileText, Save, RotateCcw, ArrowLeft, Loader2, Paperclip, Trash2, FilePlus2, Lock, AlertTriangle, ImagePlus } from 'lucide-react';

const NONE_VALUE = "_NONE_"; // Use a constant for the 'none' value

const procedureFormSchema = z.object({
  title: z.string().min(5, "Título é obrigatório (mínimo 5 caracteres)."),
  code: z.string().min(3, "Código é obrigatório (mínimo 3 caracteres)."),
  category: z.enum(['corporate', 'area', 'contract'], { required_error: "Categoria é obrigatória."}),
  area: z.string().optional(),
  contractId: z.string().optional(),
  content: z.string().min(10, "Conteúdo é obrigatório (mínimo 10 caracteres)."),
  version: z.string().min(1, "Versão é obrigatória."),
  status: z.enum(['draft', 'published', 'archived']),
  responsibleUserId: z.string().min(1, "O responsável é obrigatório."),
  approverUserId: z.string().optional(),
  associatedRisksText: z.string().optional(),
  aiPrompt: z.string().optional(),
}).refine(data => data.category !== 'area' || (data.area && data.area !== ''), {
  message: "A Área é obrigatória para a categoria 'Por Área'.",
  path: ['area'],
}).refine(data => data.category !== 'contract' || (data.contractId && data.contractId !== ''), {
  message: "O Contrato é obrigatório para a categoria 'Por Contrato'.",
  path: ['contractId'],
});

type ProcedureFormData = z.infer<typeof procedureFormSchema>;

interface ProcedureFormProps {
  initialProcedure?: Procedure | null;
  disciplines: Discipline[];
  contracts: Contract[];
  users: User[];
  currentUser: User;
}

export default function ProcedureForm({ initialProcedure, disciplines, contracts, users, currentUser }: ProcedureFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, startTransition] = React.useTransition();
  const [isGenerating, setIsGenerating] = React.useState(false);
  
  const [attachments, setAttachments] = React.useState<ProcedureAttachment[]>(initialProcedure?.attachments || []);
  const [filesToUpload, setFilesToUpload] = React.useState<File[]>([]);
// Removido: const contentTextAreaRef = React.useRef<HTMLTextAreaElement>(null);


  const isCloneMode = !!searchParams.get('cloneId');
  const isFormLocked = !isCloneMode && (initialProcedure?.status === 'published' || initialProcedure?.status === 'archived');

  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ProcedureFormData>({
    resolver: zodResolver(procedureFormSchema),
    defaultValues: {
      title: initialProcedure?.title || '',
      code: isCloneMode ? '' : initialProcedure?.code || '',
      category: initialProcedure?.category || 'corporate',
      area: initialProcedure?.area || '',
      contractId: isCloneMode ? '' : initialProcedure?.contractId || '', // Clear contract for clone
      content: initialProcedure?.content || '',
      version: isCloneMode ? '1.0' : initialProcedure?.version || '1.0',
      status: isCloneMode ? 'draft' : initialProcedure?.status || 'draft',
      responsibleUserId: initialProcedure?.responsibleUser?.id || currentUser.id,
      approverUserId: initialProcedure?.approverUser?.id || NONE_VALUE,
      associatedRisksText: initialProcedure?.associatedRisks?.join('\n') || '',
      aiPrompt: initialProcedure?.aiPrompt || '',
    },
  });

  const watchedCategory = watch('category');
  const watchedTitle = watch('title');
  const watchedArea = watch('area');
  const watchedContractId = watch('contractId');
  const watchedAiPrompt = watch('aiPrompt');

  React.useEffect(() => {
    if (isCloneMode) {
        toast({
            title: "Modo de Duplicação",
            description: "Dados carregados. Preencha o novo código e selecione o novo contrato.",
        });
    }
  }, [isCloneMode, toast]);

  const handleGenerateContent = async () => {
    if (!watchedTitle) {
        toast({ title: "Título Necessário", description: "Por favor, preencha o título do procedimento para que a IA possa gerar o conteúdo.", variant: "destructive" });
        return;
    }
    setIsGenerating(true);
    
    const attachmentData = await Promise.all(
        [...attachments, ...filesToUpload.map(f => ({ fileLink: '', fileName: f.name, fileType: f.type, id: '', fileSize: 0, uploadedAt: ''}))].map(async (fileOrAttachment) => {
            if ('size' in fileOrAttachment && typeof fileOrAttachment.size === 'number') { // It's a File object
                const file = fileOrAttachment as unknown as File;
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                return { fileLink: dataUrl, fileName: file.name, fileType: file.type };
            }
            return fileOrAttachment; // It's already a ProcedureAttachment
        })
    );
    
    const result = await generateProcedureContentAction({ 
        title: watchedTitle,
        category: watchedCategory,
        area: watchedArea,
        contractName: contracts.find(c => c.id === watchedContractId)?.name,
        aiPrompt: watchedAiPrompt,
        attachments: attachmentData,
    });
    if (result.success && result.content) {
        setValue('content', result.content, { shouldValidate: true });
        toast({ title: "Conteúdo Gerado!", description: "O conteúdo do procedimento foi preenchido pela IA. Revise e ajuste conforme necessário." });
    } else {
        toast({ title: "Erro na Geração", description: result.message, variant: "destructive" });
    }
    setIsGenerating(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFilesToUpload(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeNewFile = (fileNameToRemove: string) => {
    setFilesToUpload(prev => prev.filter(file => file.name !== fileNameToRemove));
  };

  const removeExistingAttachment = (attachmentIdToRemove: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentIdToRemove));
  }

  const insertImageMarkdown = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const markdown = `![${file.name}](${dataUrl})\n`;
      // Usar document.getElementById para acessar o textarea
      const textarea = document.getElementById('content') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentContent = textarea.value;
        const newContent = currentContent.substring(0, start) + markdown + currentContent.substring(end);
        setValue('content', newContent, { shouldValidate: true });
        textarea.focus();
        textarea.setSelectionRange(start + markdown.length, start + markdown.length);
      }
    };
    reader.readAsDataURL(file);
  };
  
  const onSubmit = (data: ProcedureFormData) => {
    startTransition(async () => {
      const filesData = await Promise.all(
        filesToUpload.map(file =>
          new Promise<{ name: string; size: number; type: string; dataUrl: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type, dataUrl: reader.result as string });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        )
      );
      
      const payload = {
        ...data,
        approverUserId: data.approverUserId === NONE_VALUE ? undefined : data.approverUserId,
        associatedRisks: data.associatedRisksText?.split('\n').filter(s => s.trim()) || [],
      };
      
      const { associatedRisksText, ...finalPayload } = payload;

      const result = await upsertProcedure({ id: isCloneMode ? undefined : initialProcedure?.id, ...finalPayload, attachments }, filesData);

      if (result.success) {
        toast({ title: 'Sucesso!', description: result.message });
        router.push('/sgq-procedures');
        router.refresh();
      } else {
        toast({ title: 'Erro', description: result.message, variant: 'destructive' });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      {isFormLocked && (
        <Card className="mb-6 bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-600">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                    <CardTitle className="text-base text-yellow-800 dark:text-yellow-300">Modo de Visualização</CardTitle>
                    <CardDescription className="text-sm text-yellow-700 dark:text-yellow-500">
                        Este procedimento está {initialProcedure.status === 'published' ? 'publicado' : 'arquivado'} e não pode ser editado. Para fazer alterações, crie uma nova versão.
                    </CardDescription>
                </div>
            </CardHeader>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-7 w-7 text-primary" />
              {initialProcedure && !isCloneMode ? 'Editar Procedimento do SGQ' : 'Novo Procedimento do SGQ'}
            </CardTitle>
            <CardDescription>
              {isCloneMode ? `Duplicando o procedimento: ${initialProcedure?.title}. Forneça um novo código e contrato.` : (initialProcedure ? `Editando o procedimento: ${initialProcedure.title}` : 'Preencha os detalhes para criar um novo procedimento.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} disabled={isFormLocked} />} />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="code">Código *</Label>
                <Controller name="code" control={control} render={({ field }) => <Input id="code" {...field} disabled={isFormLocked} />} />
                {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
              </div>
              <div>
                <Label htmlFor="version">Versão *</Label>
                <Controller name="version" control={control} render={({ field }) => <Input id="version" {...field} disabled={isFormLocked} />} />
                {errors.version && <p className="text-sm text-destructive mt-1">{errors.version.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Controller name="category" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormLocked}>
                          <SelectTrigger id="category"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="corporate">Corporativo</SelectItem>
                              <SelectItem value="area">Por Área</SelectItem>
                              <SelectItem value="contract">Por Contrato</SelectItem>
                          </SelectContent>
                      </Select>
                  )} />
                  {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isFormLocked}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
            </div>

            {watchedCategory === 'area' && (
              <div>
                  <Label htmlFor="area">Área/Disciplina *</Label>
                  <Controller name="area" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormLocked}>
                          <SelectTrigger id="area"><SelectValue placeholder="Selecione a área" /></SelectTrigger>
                          <SelectContent>{disciplines.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                      </Select>
                  )} />
                  {errors.area && <p className="text-sm text-destructive mt-1">{errors.area.message}</p>}
              </div>
            )}
            
            {watchedCategory === 'contract' && (
              <div>
                  <Label htmlFor="contractId">Contrato *</Label>
                  <Controller name="contractId" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormLocked}>
                          <SelectTrigger id="contractId"><SelectValue placeholder="Selecione o contrato" /></SelectTrigger>
                          <SelectContent>{contracts.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                  )} />
                  {errors.contractId && <p className="text-sm text-destructive mt-1">{errors.contractId.message}</p>}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <Label htmlFor="responsibleUserId">Responsável *</Label>
                  <Controller name="responsibleUserId" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormLocked}>
                          <SelectTrigger id="responsibleUserId"><SelectValue placeholder="Selecione um usuário" /></SelectTrigger>
                          <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                      </Select>
                  )} />
                  {errors.responsibleUserId && <p className="text-sm text-destructive mt-1">{errors.responsibleUserId.message}</p>}
              </div>
              <div>
                  <Label htmlFor="approverUserId">Aprovador (Opcional)</Label>
                  <Controller name="approverUserId" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={isFormLocked}>
                          <SelectTrigger id="approverUserId"><SelectValue placeholder="Selecione um aprovador" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value={NONE_VALUE}>Nenhum</SelectItem>
                              {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  )} />
              </div>
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-primary">
                  <WandSparkles className="h-5 w-5" />
                  Geração de Conteúdo com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div>
                    <Label htmlFor="aiPrompt">Descreva o que a IA deve gerar *</Label>
                    <Controller name="aiPrompt" control={control} render={({ field }) => (
                        <Textarea id="aiPrompt" {...field} rows={4} placeholder="Ex: Gere um procedimento detalhado para controle de documentos conforme a ISO 9001, incluindo etapas de criação, revisão, aprovação, distribuição e controle de versões obsoletas. O responsável por aprovar é o Coordenador da Qualidade." disabled={isFormLocked} />
                    )} />
                </div>
                 <div className="flex justify-end">
                    <Button type="button" variant="default" size="sm" onClick={handleGenerateContent} disabled={isGenerating || !watchedTitle || isFormLocked}>
                      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
                      {isGenerating ? 'Gerando...' : 'Gerar Conteúdo do Procedimento'}
                    </Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label htmlFor="content">Conteúdo do Procedimento (em Markdown) *</Label>
              <Controller name="content" control={control} render={({ field }) => <Textarea {...field} ref={field.ref} id="content" rows={25} className="font-mono text-sm" disabled={isFormLocked} />} />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-yellow-500" /> Riscos Associados</Label>
              <Controller name="associatedRisksText" control={control} render={({field}) => 
                <Textarea 
                  id="associatedRisksText" 
                  {...field} 
                  rows={4} 
                  placeholder="Liste os riscos que este procedimento mitiga, um por linha. Ex: Risco de Conformidade Legal, Risco Operacional de Segurança..." 
                  disabled={isFormLocked}
                />
              } />
            </div>

            <div className="space-y-4 pt-4 border-t">
              <Label>Anexos de Evidência / Imagens para Inserir</Label>
              <div className="space-y-2">
                {attachments.map(att => {
                  const isImage = att.fileType.startsWith('image/');
                  return (
                    <div key={att.id} className="text-sm flex items-center justify-between p-2 bg-muted rounded-md">
                      <a href={att.fileLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                        <Paperclip className="h-4 w-4" />{att.fileName}
                      </a>
                      <div className="flex items-center gap-1">
                        {isImage && (
                          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {/* TODO: Implement insert for existing files */}} disabled={isFormLocked}>
                            <ImagePlus className="h-4 w-4"/>
                          </Button>
                        )}
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExistingAttachment(att.id)} disabled={isFormLocked}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                 {filesToUpload.map((file, index) => {
                    const isImage = file.type.startsWith('image/');
                    return (
                      <div key={index} className="text-sm flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" />{file.name} (novo)</span>
                          <div className="flex items-center gap-1">
                            {isImage && (
                              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => insertImageMarkdown(file)} disabled={isFormLocked}>
                                <ImagePlus className="h-4 w-4"/> Inserir
                              </Button>
                            )}
                            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeNewFile(file.name)} disabled={isFormLocked}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                      </div>
                    );
                })}
              </div>
              <Input id="attachments-upload" type="file" multiple onChange={handleFileChange} disabled={isFormLocked}/>
            </div>

          </CardContent>
          <CardFooter className="flex gap-3">
              <Button type="submit" disabled={isSubmitting || isFormLocked}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {initialProcedure?.status === 'published' && !isCloneMode ? 'Criar Nova Versão' : 'Salvar Procedimento'}
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()} disabled={isSubmitting || isFormLocked}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Resetar Formulário
              </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
