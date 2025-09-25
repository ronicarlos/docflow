'use client';

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createLocationArea } from '@/actions/locationAreaActions';

const locationAreaCreateSchema = z.object({
  name: z.string().min(3, "Nome da localização deve ter pelo menos 3 caracteres."),
  code: z.string().optional(),
});

type LocationAreaCreateFormData = z.infer<typeof locationAreaCreateSchema>;

const NewLocationAreaForm: FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LocationAreaCreateFormData>({
    resolver: zodResolver(locationAreaCreateSchema),
    defaultValues: { name: '', code: '' },
  });

  const onSubmit = (data: LocationAreaCreateFormData) => {
    startTransition(async () => {
      const result = await createLocationArea(data);
      if (result.success) {
        toast({ title: "Localização Adicionada!", description: result.message });
        router.push(`/location-areas`);
      } else {
        toast({ title: "Erro ao criar localização", description: result.message, variant: "destructive" });
      }
    });
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <MapPin className="h-7 w-7 text-primary" /> Adicionar Nova Localização
        </CardTitle>
        <CardDescription>Preencha os detalhes da nova localização. Campos marcados com * são obrigatórios.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name-new">Nome da Localização *</Label>
            <Controller name="name" control={control} render={({ field }) => <Input id="name-new" placeholder="Ex: Prédio Principal, Setor Leste" {...field} />} />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="code-new">Código (Opcional)</Label>
            <Controller name="code" control={control} render={({ field }) => <Input id="code-new" placeholder="Ex: P01, SL-02" {...field} />} />
            {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
              <Save className="mr-2 h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar Localização'}
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
export default NewLocationAreaForm;
