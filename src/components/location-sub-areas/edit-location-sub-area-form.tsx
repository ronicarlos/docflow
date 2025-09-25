'use client';

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, Edit3, Waypoints } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { updateLocationSubArea } from '@/actions/locationSubAreaActions';
import type { LocationSubArea, LocationArea } from '@/types';

const locationSubAreaEditSchema = z.object({
  name: z.string().min(3, "Nome da sub-localização deve ter pelo menos 3 caracteres."),
  code: z.string().optional(),
  locationAreaId: z.string().min(1, "É obrigatório selecionar uma localização pai."),
});

type LocationSubAreaEditFormData = z.infer<typeof locationSubAreaEditSchema>;

interface EditLocationSubAreaFormProps {
  subArea: LocationSubArea;
  locationAreas: LocationArea[];
}

const EditLocationSubAreaForm: FC<EditLocationSubAreaFormProps> = ({ subArea, locationAreas }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, formState: { errors } } = useForm<LocationSubAreaEditFormData>({
    resolver: zodResolver(locationSubAreaEditSchema),
    defaultValues: {
      name: subArea.name || '',
      code: subArea.code || '',
      locationAreaId: typeof subArea.locationAreaId === 'object' && subArea.locationAreaId ? (subArea.locationAreaId as any).id : String(subArea.locationAreaId),
    },
  });

  const onSubmit = (data: LocationSubAreaEditFormData) => {
    startTransition(async () => {
      const result = await updateLocationSubArea(subArea.id, data);
      if (result.success) {
        toast({ title: "Sub-Localização Atualizada!", description: result.message });
        router.push('/location-sub-areas');
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
          <Edit3 className="h-7 w-7 text-primary" /> Editar Sub-Localização: {subArea.name}
        </CardTitle>
        <CardDescription>Modifique os detalhes da sub-localização.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name-edit">Nome da Sub-Localização *</Label>
            <Controller name="name" control={control} render={({ field }) => <Input id="name-edit" {...field} />} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="code-edit">Código (Opcional)</Label>
            <Controller name="code" control={control} render={({ field }) => <Input id="code-edit" {...field} />} />
            {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <Label htmlFor="locationAreaId-edit">Localização Pai *</Label>
            <Controller
              name="locationAreaId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={locationAreas.length === 0}>
                  <SelectTrigger id="locationAreaId-edit">
                    <SelectValue placeholder="Selecione a localização pai" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationAreas.map(area => (
                      <SelectItem key={area.id} value={area.id}>{area.name} {area.code && `(${area.code})`}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.locationAreaId && <p className="text-sm text-destructive mt-1">{errors.locationAreaId.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
              <Save className="mr-2 h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/location-sub-areas')} className="w-full sm:w-auto" disabled={isPending}>
              <RotateCcw className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditLocationSubAreaForm;
