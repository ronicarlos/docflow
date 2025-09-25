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
import { Save, RotateCcw, Waypoints, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createLocationSubArea } from '@/actions/locationSubAreaActions';
import type { LocationArea } from '@/types';

const locationSubAreaCreateSchema = z.object({
  name: z.string().min(3, "Nome da sub-localização deve ter pelo menos 3 caracteres."),
  code: z.string().optional(),
  locationAreaId: z.string().min(1, "É obrigatório selecionar uma localização pai."),
});

type LocationSubAreaCreateFormData = z.infer<typeof locationSubAreaCreateSchema>;

interface NewLocationSubAreaFormProps {
  locationAreas: LocationArea[];
}

const NewLocationSubAreaForm: FC<NewLocationSubAreaFormProps> = ({ locationAreas }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LocationSubAreaCreateFormData>({
    resolver: zodResolver(locationSubAreaCreateSchema),
    defaultValues: { name: '', code: '', locationAreaId: '' },
  });

  const onSubmit = (data: LocationSubAreaCreateFormData) => {
    startTransition(async () => {
      const result = await createLocationSubArea(data);
      if (result.success) {
        toast({ title: "Sub-Localização Adicionada!", description: result.message });
        router.push('/location-sub-areas');
      } else {
        toast({ title: "Erro ao criar sub-localização", description: result.message, variant: "destructive" });
      }
    });
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Waypoints className="h-7 w-7 text-primary" /> Adicionar Nova Sub-Localização
        </CardTitle>
        <CardDescription>Preencha os detalhes da nova sub-localização e vincule-a a uma localização pai.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name-new">Nome da Sub-Localização *</Label>
            <Controller name="name" control={control} render={({ field }) => <Input id="name-new" placeholder="Ex: Sala 101, Almoxarifado Central" {...field} />} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="code-new">Código (Opcional)</Label>
            <Controller name="code" control={control} render={({ field }) => <Input id="code-new" placeholder="Ex: S101, ALMX-C" {...field} />} />
            {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <Label htmlFor="locationAreaId-new">Localização Pai *</Label>
            <div className="flex items-center gap-2">
              <Controller
                name="locationAreaId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={locationAreas.length === 0}>
                    <SelectTrigger id="locationAreaId-new" className="flex-grow">
                      <SelectValue placeholder={locationAreas.length === 0 ? "Nenhuma localização pai disponível" : "Selecione a localização pai"} />
                    </SelectTrigger>
                    <SelectContent>
                      {locationAreas.map(area => (
                        <SelectItem key={area.id} value={area.id}>{area.name} {area.code && `(${area.code})`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            {errors.locationAreaId && <p className="text-sm text-destructive mt-1">{errors.locationAreaId.message}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={isPending || locationAreas.length === 0}>
              <Save className="mr-2 h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar Sub-Localização'}
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()} className="w-full sm:w-auto" disabled={isPending}>
              <RotateCcw className="mr-2 h-4 w-4" /> Limpar Formulário
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewLocationSubAreaForm;
