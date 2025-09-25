
'use client';

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, RotateCcw, Tags } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { createDiscipline } from '@/actions/disciplineActions';
import { useAuth } from '@/hooks/use-auth';

const disciplineCreateSchema = z.object({
  name: z.string().min(2, "Nome da disciplina deve ter pelo menos 2 caracteres."),
  code: z.string().optional(),
});

type DisciplineCreateFormData = z.infer<typeof disciplineCreateSchema>;

interface NewDisciplineFormProps {
  isInModal?: boolean;
  onSaveSuccess?: () => void;
}

const NewDisciplineForm: FC<NewDisciplineFormProps> = ({ isInModal = false, onSaveSuccess }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<DisciplineCreateFormData>({
    resolver: zodResolver(disciplineCreateSchema),
    defaultValues: {
      name: '',
      code: '',
    },
  });

  const onSubmit = (data: DisciplineCreateFormData) => {
    startTransition(async () => {
      if (!user || !user.tenantId) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }
      
      const dataWithTenantId = {
        ...data,
        tenantId: user.tenantId
      };
      const result = await createDiscipline(dataWithTenantId);
      if (result.success) {
        toast({
          title: "Disciplina Adicionada!",
          description: result.message,
        });
        if (isInModal && onSaveSuccess) {
            onSaveSuccess();
            reset();
        } else {
            router.push(`/disciplines`);
        }
      } else {
        toast({
          title: "Erro ao criar disciplina",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
        <Label htmlFor="name-new">Nome da Disciplina (Área) *</Label>
        <Controller name="name" control={control} render={({ field }) => <Input id="name-new" placeholder="Ex: Engenharia Elétrica, Jurídico Contratual" {...field} />} />
        {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
        </div>

        <div>
        <Label htmlFor="code-new">Código (Opcional)</Label>
        <Controller name="code" control={control} render={({ field }) => <Input id="code-new" placeholder="Ex: ENG-ELE, JUR-CT" {...field} />} />
        {errors.code && <p className="text-sm text-destructive mt-1">{errors.code.message}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
            <Save className="mr-2 h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar Disciplina'}
        </Button>
        <Button type="button" variant="outline" onClick={() => reset()} className="w-full sm:w-auto" disabled={isPending}>
            <RotateCcw className="mr-2 h-4 w-4" /> Limpar Formulário
        </Button>
        </div>
    </form>
  );
  
  if (isInModal) {
    return formContent;
  }

  return (
    <Card className="w-full max-w-xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Tags className="h-7 w-7 text-primary" /> Adicionar Nova Disciplina (Área)
        </CardTitle>
        <CardDescription>Preencha os detalhes da nova disciplina/área. Campos marcados com * são obrigatórios.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {formContent}
      </CardContent>
    </Card>
  );
};
export default NewDisciplineForm;
