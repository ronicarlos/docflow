// src/components/document/document-detail-client.tsx
"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState, type FC } from 'react';
import * as LucideIcons from 'lucide-react';
import { format, parseISO, isValid, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { useAuth } from '@/hooks/use-auth';
import { updateDocumentStatus } from '@/actions/documentActions';
import type { Document, DocumentStatus, User as UserType } from '@/types';
import { cn } from '@/lib/utils';
import { DOCUMENT_STATUSES } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import RevisionHistory from '@/components/document/revision-history';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft, DownloadCloud, FileText, CalendarDays, User, Tag, MapPin, Layers, Info,
  CheckCircle2, XCircle, CircleDot, MessageSquareQuote, Save, AlertTriangle,
  Loader2 as Loader2Icon, Clock, Eye, Edit3, Link as LinkIcon, MessageSquareText, CalendarClock, TextSearch
} from 'lucide-react';

interface DocumentDetailClientProps {
  initialDocument: Document;
  tenantUsers: UserType[];
}

const InfoItem: FC<{ icon: React.ElementType; label: string; value: string | undefined | null; valueClassName?: string; isMono?: boolean; isLoading?: boolean; }> = ({ icon: Icon, label, value, valueClassName, isMono = false, isLoading }) => {
  if (!value && value !== 'Sim' && value !== 'Não' && !isLoading) return null;
  return (
    <div className="flex flex-col p-3 border rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center text-muted-foreground mb-1">
        <Icon className="h-4 w-4 mr-2" />
        <span className="font-medium">{label}:</span>
      </div>
      {isLoading ? (
        <Skeleton className="h-5 w-3/4 mt-1" />
      ) : (
         <p className={cn("text-foreground pl-1", valueClassName, isMono && "font-mono text-xs")}>{value || <span className="italic text-muted-foreground/70">Não informado</span>}</p>
      )}
    </div>
  );
};


export default function DocumentDetailClient({ initialDocument, tenantUsers }: DocumentDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();

  const [document, setDocument] = useState<Document>(initialDocument);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | undefined>(document.currentRevision?.status);
  const [revisionObservation, setRevisionObservation] = useState(document.currentRevision?.approverObservation || '');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  
  const [formattedDates, setFormattedDates] = useState({
      elaborationDate: '',
      createdAt: '',
      lastStatusChangeDate: '',
      approvalDate: '',
      nextReviewDate: '',
  });

  const [isMounted, setIsMounted] = useState(false);
  const [isNextReviewDatePast, setIsNextReviewDatePast] = useState(false);
  const [isNextReviewDateApproaching, setIsNextReviewDateApproaching] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const formatDateSafely = (dateString: string | undefined, formatStr: string) => {
      if (!dateString) return 'N/A';
      try {
        const date = parseISO(dateString);
        return isValid(date) ? format(date, formatStr, { locale: ptBR }) : 'Data inválida';
      } catch (e) {
        return 'Erro';
      }
    };

    setFormattedDates({
        elaborationDate: formatDateSafely(document.elaborationDate, "dd/MM/yyyy"),
        createdAt: formatDateSafely(document.createdAt, "dd/MM/yyyy HH:mm"),
        lastStatusChangeDate: formatDateSafely(document.lastStatusChangeDate, "dd/MM/yyyy HH:mm"),
        approvalDate: formatDateSafely(document.currentRevision?.approvalDate, "dd/MM/yyyy"),
        nextReviewDate: formatDateSafely(document.nextReviewDate, "dd/MM/yyyy"),
    });

    if (document.nextReviewDate) {
      try {
        const nextReviewDate = parseISO(document.nextReviewDate);
        if (isValid(nextReviewDate)) {
          const now = new Date();
          const nextReviewWarningDays = 7;
          
          const isPast = isBefore(nextReviewDate, new Date(now.getFullYear(), now.getMonth(), now.getDate()));
          const isApproaching = !isPast && isBefore(nextReviewDate, addDays(now, nextReviewWarningDays));
          
          setIsNextReviewDatePast(isPast);
          setIsNextReviewDateApproaching(isApproaching);
        }
      } catch (e) {
        console.error("Error parsing next review date:", e);
      }
    }

  }, [document]);


  const refreshData = () => {
    router.refresh();
  };

  const handleSaveRevisionStatus = async () => {
    if (!selectedStatus || !currentUser) {
      toast({ title: "Erro", description: "Status ou usuário atual não definido.", variant: "destructive" });
      return;
    }
    
    if (selectedStatus === 'rejected' && !revisionObservation.trim()) {
      toast({ title: "Observação Obrigatória", description: "Por favor, forneça uma observação para reprovar a revisão.", variant: "destructive" });
      return;
    }

    setIsSavingStatus(true);
    
    const result = await updateDocumentStatus(document.id, selectedStatus, revisionObservation);

    if (result.success) {
      toast({
        title: "Status da Revisão Atualizado!",
        description: result.message,
        duration: (result.notificationsSent > 0) ? 7000 : 5000,
        action: (result.notificationsSent > 0) ? (<Button variant="outline" size="sm" asChild> <Link href="/notifications/history"> <MessageSquareText className="mr-2 h-4 w-4" /> Ver Central </Link> </Button>) : undefined,
      });
      refreshData();
      setRevisionObservation('');
    } else {
      toast({ title: "Erro ao Atualizar", description: result.message, variant: "destructive" });
    }
    
    setIsSavingStatus(false);
  };

  const statusInfo = DOCUMENT_STATUSES[document.status];
  const StatusIcon = (LucideIcons as any)[statusInfo.icon] || Info;

  const canManageThisRevisionStatus = currentUser?.role === 'Admin' || (currentUser?.id === document.currentRevision?.approvingUserId && document.status === 'pending_approval');
  const currentRevision = document.currentRevision;
  const isImage = currentRevision?.fileType?.startsWith('image/');
  const isPdf = currentRevision?.fileType === 'application/pdf';
  const isUrlAbsolute = (url: string | undefined): url is string => typeof url === 'string' && /^(?:[a-z]+:)?\/\//i.test(url);


  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        {document.id && document.id !== 'undefined' ? (
          <Button asChild>
            <Link href={`/documentos/${document.id}/editar`}>
              <Edit3 className="mr-2 h-4 w-4" /> Editar Documento
            </Link>
          </Button>
        ) : (
          <Button disabled>
            <Edit3 className="mr-2 h-4 w-4" /> Editar Documento (ID inválido)
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2 xl:w-2/5 space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <CardTitle className="text-3xl font-bold text-primary flex items-center gap-3"> <FileText className="h-8 w-8" /> {document.code} </CardTitle>
                <Badge className={cn(`text-sm px-3 py-1 border-2`, statusInfo.textColor, statusInfo.color.replace('bg-', 'border-'), statusInfo.color.replace('-500', '-300'))} variant="outline"> <StatusIcon className={cn(`mr-2 h-5 w-5`, statusInfo.textColor)} /> {statusInfo.label} </Badge>
              </div>
              <CardDescription className="text-lg mt-1">{document.description}</CardDescription>
               <p className="text-xs text-muted-foreground pt-1 font-mono">ID: {document.id}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <InfoItem icon={FileText} label="Contrato" value={typeof document.contract === 'object' ? document.contract?.name : document.contract} isLoading={!isMounted} />
                <InfoItem icon={Tag} label="Tipo de Documento" value={typeof document.documentType === 'object' ? document.documentType?.name : document.documentType} isLoading={!isMounted}/>
                <InfoItem icon={Layers} label="Área/Setor (Disciplina)" value={document.area} isLoading={!isMounted}/>
                <InfoItem icon={User} label="Usuário Criador (Sistema)" value={document.createdBy.name} isLoading={!isMounted}/>
                <InfoItem icon={User} label="Usuário Responsável (Gestor)" value={typeof document.responsibleUser === 'object' ? document.responsibleUser?.name : document.responsibleUser} isLoading={!isMounted}/>
                 {document.currentRevision?.approvingUserId && tenantUsers.find(u => u.id === document.currentRevision?.approvingUserId) && (
                  <InfoItem icon={User} label="Aprovador Designado (Rev. Atual)" value={tenantUsers.find(u => u.id === document.currentRevision?.approvingUserId)?.name} isLoading={!isMounted}/>
                )}
                <InfoItem icon={CalendarDays} label="Data de Elaboração" value={formattedDates.elaborationDate} isLoading={!isMounted}/>
                <InfoItem icon={Clock} label="Data de Criação (Sistema)" value={formattedDates.createdAt} isLoading={!isMounted}/>
                <InfoItem icon={Clock} label="Última Mudança de Status" value={formattedDates.lastStatusChangeDate} isLoading={!isMounted}/>
                <InfoItem icon={FileText} label="Revisão Atual" value={document.currentRevision?.revisionNumber} isLoading={!isMounted}/>
                {document.currentRevision?.approvalDate && document.approver && (
                  <InfoItem icon={CalendarDays} label="Data da Aprovação (Rev. Atual)" value={formattedDates.approvalDate} isLoading={!isMounted}/>
                )}
                {document.requiresContinuousImprovement && (
                    <InfoItem icon={LucideIcons.Repeat} label="Requer Melhoria Contínua" value="Sim" isLoading={!isMounted}/>
                )}
                {document.nextReviewDate && (
                    <InfoItem
                        icon={CalendarClock}
                        label="Data Prevista Próxima Análise Crítica"
                        value={formattedDates.nextReviewDate}
                        valueClassName={isNextReviewDatePast ? "text-red-600 font-bold dark:text-red-400" : (isNextReviewDateApproaching ? "text-yellow-600 font-bold dark:text-yellow-400" : "")}
                        isLoading={!isMounted}
                    />
                )}
                {document.validityDays && document.validityDays > 0 && (
                  <InfoItem icon={CalendarClock} label="Prazo de Validade" value={`${document.validityDays} dias`} isLoading={!isMounted}/>
                )}
                {document.locationArea && ( <InfoItem icon={MapPin} label="Localização" value={typeof document.locationArea === 'object' ? `${document.locationArea.name} ${document.locationArea.code ? `(${document.locationArea.code})` : ''}` : document.locationArea} isLoading={!isMounted}/> )}
                {document.locationSubArea && ( <InfoItem icon={MapPin} label="Sub Localização" value={typeof document.locationSubArea === 'object' ? `${document.locationSubArea.name} ${document.locationSubArea.code ? `(${document.locationSubArea.code})` : ''}` : document.locationSubArea} isLoading={!isMounted}/> )}
                {document.approver && ( <InfoItem icon={User} label="Aprovado por (Rev. Atual)" value={document.approver.name} isLoading={!isMounted}/> )}
                 {currentRevision?.approverObservation && (
                    <div className="md:col-span-full p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center text-muted-foreground mb-1"> <MessageSquareQuote className="h-4 w-4 mr-2 text-primary" /> <span className="font-medium text-sm">Observação do Aprovador (Rev. {currentRevision?.revisionNumber}):</span> </div>
                        <p className="text-foreground text-sm pl-1">{currentRevision?.approverObservation}</p>
                    </div>
                )}
                {currentRevision?.observation && currentRevision?.observation !== currentRevision?.approverObservation && (
                    <div className="md:col-span-full p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center text-muted-foreground mb-1"> <MessageSquareQuote className="h-4 w-4 mr-2" /> <span className="font-medium text-sm">Observação da Revisão ({currentRevision?.revisionNumber}):</span> </div>
                        <p className="text-foreground text-sm pl-1">{currentRevision?.observation}</p>
                    </div>
                )}
              </div>
              {document.currentRevision?.fileLink && (
                <div className="mt-6">
                  <Button asChild variant="outline" size="lg">
                    <a href={document.currentRevision?.fileLink} target="_blank" rel="noopener noreferrer" download={document.currentRevision?.fileName}>
                      <DownloadCloud className="mr-2 h-5 w-5" /> Baixar Documento (Revisão {document.currentRevision?.revisionNumber})
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isMounted && document.requiresContinuousImprovement && document.status === 'approved' && (isNextReviewDatePast || isNextReviewDateApproaching) && (currentUser?.id === (document.currentRevision?.approvingUserId || document.currentRevision?.approvedByUserId) || currentUser?.role === 'Admin') && (
            <Card className={cn("shadow-lg border-2", isNextReviewDatePast ? "border-red-500 bg-red-50 dark:bg-red-900/30" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30")}>
                <CardHeader>
                    <CardTitle className={cn("flex items-center gap-2 text-xl", isNextReviewDatePast ? "text-red-700 dark:text-red-400" : "text-yellow-700 dark:text-yellow-400")}>
                        <CalendarClock className="h-6 w-6"/> Atenção: Próxima Análise Crítica
                    </CardTitle>
                    <CardDescription className={cn(isNextReviewDatePast ? "text-red-600 dark:text-red-500" : "text-yellow-600 dark:text-yellow-500")}>
                        Este documento requer melhoria contínua. A data prevista para a próxima análise crítica é <strong>{formattedDates.nextReviewDate}</strong>.
                        {isNextReviewDatePast && " Esta data já passou!"}
                        {isNextReviewDateApproaching && " Esta data está se aproximando!"}
                         Por favor, indique a ação apropriada (ex: criar nova revisão, revalidar, ou tornar obsoleto na tela de edição).
                    </CardDescription>
                </CardHeader>
            </Card>
          )}

          { document.status === 'pending_approval' && canManageThisRevisionStatus && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"> <CheckCircle2 className="w-6 h-6 text-primary" /> Aprovar/Reprovar Revisão: {document.currentRevision?.revisionNumber} </CardTitle>
                <CardDescription> Atualize o status da revisão atual. Se reprovar, forneça uma observação. </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="revisionStatus">Novo Status para Revisão {document.currentRevision?.revisionNumber}</Label>
                  <Select value={selectedStatus} onValueChange={(value: DocumentStatus) => setSelectedStatus(value)}>
                    <SelectTrigger id="revisionStatus"> <SelectValue placeholder="Selecione um status" /> </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">{DOCUMENT_STATUSES['approved'].label}</SelectItem>
                      <SelectItem value="rejected">{DOCUMENT_STATUSES['rejected'].label}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="revisionNewObservation">Observação para esta Ação de Status {selectedStatus === 'rejected' ? '*' : '(Opcional)'}</Label>
                  <Textarea id="revisionNewObservation" placeholder="Digite sua observação..." value={revisionObservation} onChange={(e) => setRevisionObservation(e.target.value)} rows={3} disabled={isSavingStatus}/>
                  <p className="text-xs text-muted-foreground mt-1"> Esta observação será registrada para a revisão {document.currentRevision?.revisionNumber} e no histórico de aprovações. </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveRevisionStatus} disabled={!selectedStatus || (selectedStatus === document.currentRevision?.status && revisionObservation === (document.currentRevision?.approverObservation || '')) || isSavingStatus }>
                  {isSavingStatus ? <><Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Salvando...</> : <><Save className="mr-2 h-4 w-4" /> Salvar Status da Revisão</>}
                </Button>
              </CardFooter>
            </Card>
          )}

          <RevisionHistory revisions={document.revisions} documentCode={document.code} />
        </div>

        <div className="lg:w-1/2 xl:w-3/5 lg:sticky lg:top-20 self-start">
            <Tabs defaultValue="file-preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="file-preview"><Eye className="mr-2 h-4 w-4" /> Pré-visualização</TabsTrigger>
                <TabsTrigger value="ocr-content" disabled={!currentRevision?.textContent}><TextSearch className="mr-2 h-4 w-4" /> Texto Extraído (OCR)</TabsTrigger>
              </TabsList>

              <TabsContent value="file-preview">
                 {currentRevision && currentRevision.fileLink ? (
                    <Card className="shadow-lg h-full">
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg">Visualização: {currentRevision.fileName || 'Documento'}</CardTitle>
                        <CardDescription>Revisão: {currentRevision.revisionNumber}</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[calc(100vh-340px)] min-h-[500px] p-2 md:p-4 overflow-hidden">
                        {isImage && isUrlAbsolute(currentRevision.fileLink) ? (
                          <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                            <Image src={currentRevision.fileLink} alt={`Pré-visualização de ${currentRevision.fileName || 'documento'}`} width={800} height={600} className="max-w-full max-h-full object-contain rounded-md" data-ai-hint="document image" />
                          </div>
                        ) : isPdf && isUrlAbsolute(currentRevision.fileLink) ? (
                          <object data={currentRevision.fileLink} type="application/pdf" width="100%" height="100%" className="rounded-md border" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-muted rounded-md">
                            <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-semibold text-foreground mb-2">Pré-visualização não disponível</p>
                            <p className="text-sm text-muted-foreground mb-4">Arquivo: {currentRevision.fileName || 'Nome não disponível'}</p>
                            <Button asChild variant="secondary"><a href={currentRevision.fileLink} target="_blank" rel="noopener noreferrer" download={currentRevision.fileName}><DownloadCloud className="mr-2 h-4 w-4" /> Baixar Arquivo</a></Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="shadow-lg h-full"><CardHeader><CardTitle>Sem Arquivo</CardTitle></CardHeader><CardContent><p>Nenhum arquivo associado a esta revisão.</p></CardContent></Card>
                  )}
              </TabsContent>
              <TabsContent value="ocr-content">
                  <Card className="shadow-lg h-full">
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg">Conteúdo Extraído do Documento</CardTitle>
                         <CardDescription>Texto extraído via OCR para fins de busca e análise. Pode conter imprecisões.</CardDescription>
                      </CardHeader>
                      <CardContent className="h-[calc(100vh-340px)] min-h-[500px]">
                         <ScrollArea className="h-full w-full rounded-md border p-4 bg-muted/50">
                            <pre className="whitespace-pre-wrap break-words text-sm font-mono text-foreground">{currentRevision?.textContent || "Nenhum texto foi extraído deste documento."}</pre>
                         </ScrollArea>
                      </CardContent>
                    </Card>
              </TabsContent>
            </Tabs>
        </div>
      </div>
    </div>
  );
}
