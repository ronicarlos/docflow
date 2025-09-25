'use client';

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { LocationArea } from '@/types';
import { Save, RotateCcw, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateLocationArea } from '@/actions/locationAreaActions';

const locationAreaEditSchema = z.object({
  name: z.string().min(3, "Nome da localização deve ter pelo menos 3 caracteres."),
  code: z.string().optional(),
});

type LocationAreaEditFormData = z.infer<typeof locationAreaEditSchema>;

interface EditLocationAreaFormProps {
  locationArea: LocationArea;
}

const EditLocationAreaForm: FC<EditLocationAreaFormProps> = ({ locationArea }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, formState: { errors } } = useForm<LocationAreaEditFormData>({
    resolver: zodResolver(locationAreaEditSchema),
    defaultValues: {
      name: locationArea.name || '',
      code: locationArea.code || '',
    },
  });

  const onSubmit = (data: LocationAreaEditFormData) => {
    startTransition(async () => {
      const result = await updateLocationArea(locationArea.id, data);
      if (result.success) {
        toast({ title: "Localização Atualizada!", description: result.message });
        router.push('/location-areas');
        router.refresh();
      } else {
        toast({ title: "Falha ao Atualizar", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Edit3 className="h-7 w-7 text-primary" /> Editar Localização: {locationArea.name}
        </CardTitle>
        <CardDescription>Modifique os detalhes da localização.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name-edit">Nome da Localização *</Label>
            <Controller name="name" control={control} render={({ field }) => <Input id="name-edit" {...field} />} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="code-edit">Código (Opcional)</Label>
            <Controller name="code" control={control} render={({ field }) => <Input id="code-edit" {...field} />} />
            {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
              <Save className="mr-2 h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/location-areas')} className="w-full sm:w-auto" disabled={isPending}>
              <RotateCcw className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditLocationAreaForm;
