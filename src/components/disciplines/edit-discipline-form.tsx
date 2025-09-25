
'use client';

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { useTransition } from 'react';
import type { Discipline } from '@/types/Discipline';
import { updateDiscipline } from '@/actions/disciplineActions';

const disciplineEditSchema = z.object({
  name: z.string().min(2, "Nome da disciplina deve ter pelo menos 2 caracteres."),
  code: z.string().optional(),
});

type DisciplineEditFormData = z.infer<typeof disciplineEditSchema>;

interface EditDisciplineFormProps {
  discipline: Discipline;
}

const EditDisciplineForm: FC<EditDisciplineFormProps> = ({ discipline }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, formState: { errors } } = useForm<DisciplineEditFormData>({
    resolver: zodResolver(disciplineEditSchema),
    defaultValues: {
      name: discipline.name || '',
      code: discipline.code || '',
    },
  });

  const onSubmit = (data: DisciplineEditFormData) => {
    startTransition(async () => {
      const result = await updateDiscipline(discipline.id, data);
      if (result.success) {
        toast({
          title: "Disciplina Atualizada!",
          description: result.message,
        });
        router.push('/disciplines');
        router.refresh();
      } else {
        toast({
          title: "Falha ao Atualizar",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Edit3 className="h-7 w-7 text-primary" /> Editar Disciplina: {discipline.name}
        </CardTitle>
        <CardDescription>Modifique os detalhes da disciplina/área.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name-edit">Nome da Disciplina (Área) *</Label>
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
            <Button type="button" variant="outline" onClick={() => router.push('/disciplines')} className="w-full sm:w-auto" disabled={isPending}>
              <RotateCcw className="mr-2 h-4 w-4" /> Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditDisciplineForm;
