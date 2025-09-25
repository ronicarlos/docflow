
'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useState, useEffect } from 'react';
import { format, addDays, parseISO, isValid } from 'date-fns';

import { upsertCalibrationInstrument } from '@/actions/calibrationActions';
import type { CalibrationInstrument, CalibrationInstrumentAttachment } from '@/types/Calibration';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Thermometer, PlusCircle, Save, RotateCcw, Loader2, Paperclip, Trash2 } from 'lucide-react';

const attachmentSchema = z.object({
  id: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  fileLink: z.string().url(),
  uploadedAt: z.string(),
});

const calibrationInstrumentSchema = z.object({
  tag: z.string().min(1, "TAG é obrigatória."),
  description: z.string().min(3, "Descrição é obrigatória."),
  equipmentType: z.string().min(1, "Tipo de equipamento é obrigatório."),
  location: z.string().min(1, "Localização é obrigatória."),
  brand: z.string().min(1, "Marca é obrigatória."),
  model: z.string().min(1, "Modelo é obrigatório."),
  serialNumber: z.string().min(1, "Número de série é obrigatório."),
  calibrationFrequency: z.coerce.number().int().min(1, "Frequência deve ser ao menos 1 dia."),
  lastCalibrationDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data da última calibração é inválida." }),
  nextCalibrationDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data da próxima calibração é inválida." }),
  status: z.enum(['active', 'inactive', 'maintenance']),
  attachments: z.array(attachmentSchema).optional(),
});

type FormData = z.infer<typeof calibrationInstrumentSchema>;

interface InstrumentFormProps {
    instrument?: CalibrationInstrument;
}

export default function InstrumentForm({ instrument }: InstrumentFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, startTransition] = useTransition();

    const [attachments, setAttachments] = useState<CalibrationInstrumentAttachment[]>(instrument?.attachments || []);
    const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
    
    const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(calibrationInstrumentSchema),
        defaultValues: {
            tag: instrument?.tag || '',
            description: instrument?.description || '',
            equipmentType: instrument?.equipmentType || '',
            location: instrument?.location || '',
            brand: instrument?.brand || '',
            model: instrument?.model || '',
            serialNumber: instrument?.serialNumber || '',
            calibrationFrequency: instrument?.calibrationFrequency || 365,
            lastCalibrationDate: instrument?.lastCalibrationDate ? format(parseISO(instrument.lastCalibrationDate), 'yyyy-MM-dd') : '',
            nextCalibrationDate: instrument?.nextCalibrationDate ? format(parseISO(instrument.nextCalibrationDate), 'yyyy-MM-dd') : '',
            status: instrument?.status || 'active',
            attachments: instrument?.attachments || [],
        },
    });

    const watchedLastCalibrationDate = watch('lastCalibrationDate');
    const watchedFrequency = watch('calibrationFrequency');

    useEffect(() => {
        if (watchedLastCalibrationDate && watchedFrequency > 0) {
            try {
                const lastDate = parseISO(watchedLastCalibrationDate);
                if(isValid(lastDate)) {
                    const nextDate = addDays(lastDate, watchedFrequency);
                    setValue('nextCalibrationDate', format(nextDate, 'yyyy-MM-dd'), { shouldValidate: true });
                }
            } catch(e) {
                // Invalid date format, do nothing
            }
        }
    }, [watchedLastCalibrationDate, watchedFrequency, setValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFilesToUpload(Array.from(e.target.files));
        }
    };

    const onSubmit = (data: FormData) => {
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

            const result = await upsertCalibrationInstrument({ ...data, id: instrument?.id, attachments }, filesData);
            if (result.success) {
                toast({ title: 'Sucesso!', description: result.message });
                router.push('/quality-modules/equipment-control');
                router.refresh();
            } else {
                toast({ title: 'Erro', description: result.message, variant: 'destructive' });
            }
        });
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl">
             <form onSubmit={handleSubmit(onSubmit)}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        {instrument ? <Thermometer className="h-7 w-7 text-primary" /> : <PlusCircle className="h-7 w-7 text-primary" />}
                        {instrument ? `Editar Equipamento: ${instrument.tag}` : 'Adicionar Novo Equipamento'}
                    </CardTitle>
                    <CardDescription>
                        Preencha os detalhes do equipamento de calibração. Campos com * são obrigatórios.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="tag">TAG *</Label><Controller name="tag" control={control} render={({ field }) => <Input id="tag" {...field} />} />{errors.tag && <p className="text-sm text-destructive mt-1">{errors.tag.message}</p>}</div>
                        <div><Label htmlFor="serialNumber">Nº de Série *</Label><Controller name="serialNumber" control={control} render={({ field }) => <Input id="serialNumber" {...field} />} />{errors.serialNumber && <p className="text-sm text-destructive mt-1">{errors.serialNumber.message}</p>}</div>
                    </div>
                     <div><Label htmlFor="description">Descrição *</Label><Controller name="description" control={control} render={({ field }) => <Input id="description" {...field} />} />{errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}</div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label htmlFor="equipmentType">Tipo *</Label><Controller name="equipmentType" control={control} render={({ field }) => <Input id="equipmentType" placeholder="Ex: Manômetro" {...field} />} />{errors.equipmentType && <p className="text-sm text-destructive mt-1">{errors.equipmentType.message}</p>}</div>
                        <div><Label htmlFor="brand">Marca *</Label><Controller name="brand" control={control} render={({ field }) => <Input id="brand" {...field} />} />{errors.brand && <p className="text-sm text-destructive mt-1">{errors.brand.message}</p>}</div>
                        <div><Label htmlFor="model">Modelo *</Label><Controller name="model" control={control} render={({ field }) => <Input id="model" {...field} />} />{errors.model && <p className="text-sm text-destructive mt-1">{errors.model.message}</p>}</div>
                     </div>
                     <div><Label htmlFor="location">Localização *</Label><Controller name="location" control={control} render={({ field }) => <Input id="location" {...field} />} />{errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}</div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><Label htmlFor="calibrationFrequency">Frequência (dias) *</Label><Controller name="calibrationFrequency" control={control} render={({ field }) => <Input id="calibrationFrequency" type="number" {...field} />} />{errors.calibrationFrequency && <p className="text-sm text-destructive mt-1">{errors.calibrationFrequency.message}</p>}</div>
                        <div><Label htmlFor="lastCalibrationDate">Última Calibração *</Label><Controller name="lastCalibrationDate" control={control} render={({ field }) => <Input id="lastCalibrationDate" type="date" {...field} />} />{errors.lastCalibrationDate && <p className="text-sm text-destructive mt-1">{errors.lastCalibrationDate.message}</p>}</div>
                        <div><Label htmlFor="nextCalibrationDate">Próxima Calibração</Label><Controller name="nextCalibrationDate" control={control} render={({ field }) => <Input id="nextCalibrationDate" type="date" {...field} readOnly className="bg-muted/50" />} />{errors.nextCalibrationDate && <p className="text-sm text-destructive mt-1">{errors.nextCalibrationDate.message}</p>}</div>
                     </div>
                      <div>
                        <Label htmlFor="status">Status *</Label>
                        <Controller name="status" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Ativo</SelectItem>
                                    <SelectItem value="inactive">Inativo</SelectItem>
                                    <SelectItem value="maintenance">Em Manutenção</SelectItem>
                                </SelectContent>
                            </Select>
                        )} />
                     </div>
                     <div className="space-y-2">
                        <Label>Anexos (Certificados)</Label>
                        {attachments.length > 0 && (
                            <div className="space-y-2">
                                {attachments.map(att => (
                                    <div key={att.id} className="text-sm flex items-center justify-between p-2 bg-muted rounded-md">
                                        <a href={att.fileLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline"><Paperclip className="h-4 w-4" />{att.fileName}</a>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Input id="attachments-upload" type="file" multiple onChange={handleFileChange} />
                     </div>
                </CardContent>
                <CardFooter className="flex gap-3">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Salvar
                    </Button>
                     <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSaving}>
                        <RotateCcw className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
