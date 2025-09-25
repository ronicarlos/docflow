
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { DocumentType, Discipline, PopulatedDocumentType } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { createDocumentType, updateDocumentType } from '@/actions/documentTypeActions';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { AlternativeSelect } from '../shared/alternative-select';
import { Checkbox } from '../ui/checkbox';
import { Loader2, Save } from 'lucide-react';

const documentTypeSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  code: z.string().min(1, "Código é obrigatório."),
  disciplineId: z.string().min(1, "A disciplina é obrigatória."),
  requiresCriticalAnalysis: z.boolean().default(false),
  criticalAnalysisDays: z.coerce.number().int().min(0).default(0),
}).refine(data => !data.requiresCriticalAnalysis || (data.criticalAnalysisDays && data.criticalAnalysisDays > 0), {
  message: "O prazo em dias é obrigatório se a análise crítica for requerida.",
  path: ["criticalAnalysisDays"],
});

type DocumentTypeFormData = z.infer<typeof documentTypeSchema>;

interface EditDocumentTypeModalProps {
  docType?: DocumentType | PopulatedDocumentType | null;
  disciplines: Discipline[];
  children?: React.ReactNode; // For the trigger button
  isOpen?: boolean;
  onClose?: () => void;
  onSaveSuccess?: () => void;
}

export default function EditDocumentTypeModal({ docType, disciplines, children, isOpen: externalOpen, onClose: externalOnClose, onSaveSuccess }: EditDocumentTypeModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  const isControlled = externalOpen !== undefined && externalOnClose !== undefined;
  const isOpen = isControlled ? externalOpen : internalOpen;
  const onOpenChange = isControlled ? externalOnClose : setInternalOpen;

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<DocumentTypeFormData>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: {
      name: '',
      code: '',
      disciplineId: '',
      requiresCriticalAnalysis: false,
      criticalAnalysisDays: 0,
    }
  });
  
  const requiresAnalysis = watch('requiresCriticalAnalysis');

  React.useEffect(() => {
    if (isOpen) {
      reset({
        name: docType?.name || '',
        code: docType?.code || '',
        disciplineId: typeof docType?.disciplineId === 'object' ? docType.disciplineId.id : docType?.disciplineId?.toString() || '',
        requiresCriticalAnalysis: docType?.requiresCriticalAnalysis || false,
        criticalAnalysisDays: docType?.criticalAnalysisDays || 0,
      });
    }
  }, [isOpen, docType, reset]);
  
  const onSubmit = (data: DocumentTypeFormData) => {
    startTransition(async () => {
      const result = docType
        ? await updateDocumentType(docType.id, data)
        : await createDocumentType(data);

      if (result.success) {
        toast({ title: "Sucesso!", description: result.message });
        onOpenChange(false);
        if (onSaveSuccess) {
          onSaveSuccess();
        }
        router.refresh(); // Refreshes server components on the current route
      } else {
        toast({ title: "Erro", description: result.message, variant: 'destructive' });
      }
    });
  };

  const disciplineOptions = disciplines.map(d => ({ value: d.id, label: d.name }));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{docType ? `Editar Tipo de Documento: ${docType.name}` : 'Criar Novo Tipo de Documento'}</DialogTitle>
          <DialogDescription>{docType ? 'Modifique os detalhes abaixo.' : 'Preencha os detalhes para criar um novo tipo.'}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" {...field} />} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="code">Código *</Label>
              <Controller name="code" control={control} render={({ field }) => <Input id="code" {...field} />} />
              {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="disciplineId">Área Principal (Disciplina) *</Label>
              <Controller name="disciplineId" control={control} render={({ field }) => (
                <AlternativeSelect value={field.value} onValueChange={field.onChange} options={disciplineOptions} placeholder="Selecione a disciplina" disabled={disciplines.length === 0} />
              )} />
              {errors.disciplineId && <p className="text-sm text-destructive mt-1">{errors.disciplineId.message}</p>}
            </div>
            <div className="space-y-4 pt-3 border-t">
              <div className="flex items-center space-x-2">
                  <Controller name="requiresCriticalAnalysis" control={control} render={({ field }) => <Checkbox id="requires-analysis" checked={field.value} onCheckedChange={field.onChange} />} />
                  <Label htmlFor="requires-analysis">Requer Análise Crítica Periódica?</Label>
              </div>
              {requiresAnalysis && (
                   <div>
                      <Label htmlFor="criticalAnalysisDays">Prazo da Análise Crítica (dias) *</Label>
                      <Controller name="criticalAnalysisDays" control={control} render={({ field }) => <Input id="criticalAnalysisDays" type="number" placeholder="Ex: 365" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />} />
                      {errors.criticalAnalysisDays && <p className="text-sm text-destructive mt-1">{errors.criticalAnalysisDays.message}</p>}
                  </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={isPending}>Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
