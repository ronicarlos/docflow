
"use client";

import { useState, useEffect, useCallback, ChangeEvent, type FC } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { updateMeetingMinute } from '@/actions/meetingMinuteActions';
import type { IMeetingMinute, IMeetingMinuteAttachment, MeetingMinuteStatus, Contract } from '@/types';
import { MEETING_MINUTE_STATUSES } from '@/lib/constants';
import { ArrowLeft, Save, Loader2, Edit, Trash2, Paperclip, FileText as PdfIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const meetingMinuteEditSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  meetingDate: z.string().refine(val => !isNaN(Date.parse(val)), "Data inválida."),
  status: z.enum(Object.keys(MEETING_MINUTE_STATUSES) as [MeetingMinuteStatus, ...MeetingMinuteStatus[]]),
  contractId: z.string().min(1, "O contrato é obrigatório."),
  generatedMarkdown: z.string().min(10, "O conteúdo da ata não pode estar vazio."),
  newAttachments: z.any().optional(),
});

type MeetingMinuteEditFormData = z.infer<typeof meetingMinuteEditSchema>;

interface EditMeetingMinuteFormProps {
    initialMinute: IMeetingMinute;
    contracts: Contract[];
}

const EditMeetingMinuteForm: FC<EditMeetingMinuteFormProps> = ({ initialMinute, contracts }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [minute, setMinute] = useState<IMeetingMinute>(initialMinute);
  const [attachments, setAttachments] = useState<IMeetingMinuteAttachment[]>(initialMinute.attachments || []);
  
  const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<MeetingMinuteEditFormData>({
    resolver: zodResolver(meetingMinuteEditSchema),
  });

  useEffect(() => {
    setMinute(initialMinute);
    setAttachments(initialMinute.attachments || []);
    reset({
        title: initialMinute.title,
        meetingDate: format(initialMinute.meetingDate, 'yyyy-MM-dd'),
        status: initialMinute.status,
        contractId: initialMinute.contractId,
        generatedMarkdown: initialMinute.generatedMarkdown,
    });
  }, [initialMinute, reset]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      let validFiles: File[] = [];
      for (const file of Array.from(files)) {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast({ title: "Arquivo muito grande", description: `O arquivo "${file.name}" excede ${MAX_FILE_SIZE_MB}MB.`, variant: "destructive" });
        } else {
          validFiles.push(file);
        }
      }
      setValue('newAttachments', validFiles, { shouldDirty: true });
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId));
    toast({ title: "Anexo removido da lista", description: "A remoção será permanente ao salvar." });
  };
  
  const handleGeneratePdf = () => {
    if (!minute || !currentUser) return;
    const doc = new jsPDF();
    const tenantName = (currentUser as any).tenantName || 'Sua Empresa';
    const margin = 15;
    let y = 20;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(tenantName, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 7;
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Ata de Reunião - ${minute.title}`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 15;
    
    const lines = minute.generatedMarkdown.split('\n');
    let tableHead: string[][] = [];
    let tableBody: string[][] = [];
    let inTable = false;

    const renderTable = () => {
      if (tableBody.length > 0) {
        autoTable(doc, { head: tableHead, body: tableBody, startY: y, theme: 'grid' });
        y = (doc as any).lastAutoTable.finalY + 10;
        tableHead = []; tableBody = [];
      }
    };

    lines.forEach(line => {
        if (line.trim().startsWith('|')) {
            inTable = true;
            const cells = line.split('|').slice(1, -1).map(cell => cell.trim());
            if (cells.every(cell => /^-+$/.test(cell))) { /* é a linha separadora */ } 
            else if (tableHead.length === 0) { tableHead.push(cells); } 
            else { tableBody.push(cells); }
        } else {
            if (inTable) { renderTable(); inTable = false; }
            if (y > 270) { doc.addPage(); y = 20; }
            if (line.trim() === '') { y += 5; return; }
            if (line.startsWith('# ')) { doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.text(line.substring(2), margin, y); y += 10; } 
            else if (line.startsWith('## ')) { doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text(line.substring(3), margin, y); y += 8; }
            else if (line.startsWith('- ') || line.startsWith('* ')) { doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.text(`• ${line.substring(2)}`, margin + 5, y); y += 7; }
            else { doc.setFontSize(11); doc.setFont("helvetica", "normal"); const splitText = doc.splitTextToSize(line, doc.internal.pageSize.getWidth() - margin * 2); doc.text(splitText, margin, y); y += (splitText.length * 6); }
        }
    });
    if (inTable) renderTable();
    
    if (minute.attachments.length > 0) {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("Anexos", margin, y); y += 8;
        doc.setFontSize(11); doc.setFont("helvetica", "normal");
        minute.attachments.forEach(att => { doc.text(`- ${att.fileName}`, margin + 5, y); y += 7; });
    }

    y += 20;
    if (y > 250) { doc.addPage(); y = 30; }
    doc.text("Assinaturas:", margin, y); y += 20;
    doc.text("________________________________________", margin + 5, y);
    doc.text("________________________________________", margin + 100, y); y += 5;
    doc.text("Responsável 1", margin + 30, y);
    doc.text("Responsável 2", margin + 125, y);

    doc.save(`${minute.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  };

  const onSubmit = async (data: MeetingMinuteEditFormData) => {
    let newAttachments: IMeetingMinuteAttachment[] = [...attachments];
    if (data.newAttachments && data.newAttachments.length > 0) {
      for (const file of data.newAttachments) {
        newAttachments.push({
          id: uuidv4(),
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileLink: `/uploads/mock/attachments/${file.name}`,
          uploadedAt: new Date().toISOString(),
        });
      }
    }
    
    const result = await updateMeetingMinute(minute.id, data, newAttachments);

    if (result.success) {
      toast({ title: "Ata Atualizada!", description: "As alterações foram salvas com sucesso." });
      router.refresh();
    } else {
      toast({ title: "Erro ao salvar", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => router.push('/meeting-minutes')} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista de Atas
      </Button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="w-full mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Edit className="h-7 w-7 text-primary" /> Editar Ata de Reunião
            </CardTitle>
            <CardDescription>Revise, edite o conteúdo, anexe arquivos e altere o status da ata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <Label htmlFor="contractId">Contrato *</Label>
                <Controller name="contractId" control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={contracts.length === 0}>
                        <SelectTrigger id="contractId"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        <SelectContent>{contracts.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
                    </Select>
                )} />
                {errors.contractId && <p className="text-sm text-destructive mt-1">{errors.contractId.message}</p>}
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="title">Título da Ata</Label>
                <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Controller name="status" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(MEETING_MINUTE_STATUSES).map(([key, value]) => <SelectItem key={key} value={key}>{value.label}</SelectItem>)}</SelectContent>
                  </Select>
                )} />
              </div>
            </div>
            <div>
              <Label htmlFor="generatedMarkdown">Conteúdo da Ata (Markdown)</Label>
              <Controller name="generatedMarkdown" control={control} render={({ field }) => (
                <Textarea id="generatedMarkdown" {...field} rows={20} className="font-mono text-sm" />
              )} />
              {errors.generatedMarkdown && <p className="text-sm text-destructive mt-1">{errors.generatedMarkdown.message}</p>}
            </div>
            <div>
              <Label>Anexos</Label>
              <Card className="p-4 border-dashed">
                <div className="space-y-2">
                  {attachments.map(att => (
                    <div key={att.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded-md">
                      <a href={att.fileLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                        <Paperclip className="h-4 w-4" /> {att.fileName}
                      </a>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAttachment(att.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {attachments.length === 0 && <p className="text-xs text-muted-foreground text-center">Nenhum anexo existente.</p>}
                </div>
                <div className="mt-4">
                    <Label htmlFor="new-attachments">Adicionar Novos Anexos</Label>
                    <Input id="new-attachments" type="file" multiple onChange={handleFileChange} />
                </div>
              </Card>
            </div>
          </CardContent>
          <CardFooter className="gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Alterações
            </Button>
            <Button variant="secondary" onClick={handleGeneratePdf} type="button">
                <PdfIcon className="mr-2 h-4 w-4"/> Gerar PDF da Versão Salva
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default EditMeetingMinuteForm;
