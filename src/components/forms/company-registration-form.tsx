'use client';

import React, { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw, Loader2, Building2 } from 'lucide-react';
import { CompanyType, CreateCompanyData } from '@/types/Company';
import { CompanyType as CompanyTypeEnum } from '@prisma/client';
import { create } from '@/services/companyService';
import { useAuth } from '@/hooks/use-auth';

const companyRegistrationSchema = z.object({
  nome: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres."),
  tipo: z.nativeEnum(CompanyTypeEnum, { required_error: "Tipo da empresa é obrigatório." })
});

type CompanyRegistrationFormData = z.infer<typeof companyRegistrationSchema>;

export function CompanyRegistrationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, startTransition] = useTransition();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CompanyRegistrationFormData>({
    resolver: zodResolver(companyRegistrationSchema),
    defaultValues: {
      nome: '',
      tipo: CompanyTypeEnum.CLIENTE
    }
  });

  const onSubmit = (data: CompanyRegistrationFormData) => {
    startTransition(async () => {
      try {
        if (!user || !user.tenantId) {
          toast({
            title: "Erro",
            description: "Usuário não autenticado",
            variant: "destructive"
          });
          return;
        }
        
        const createData: CreateCompanyData = {
          nome: data.nome,
          tipo: data.tipo,
          tenantId: user.tenantId
        };

        await create(createData);

        toast({
          title: "Sucesso!",
          description: "Empresa cadastrada com sucesso.",
        });

        reset();
        router.push('/dashboard');
      } catch (error) {
        console.error('Erro ao cadastrar empresa:', error);
        toast({
          title: "Erro",
          description: "Erro ao cadastrar empresa. Tente novamente.",
          variant: "destructive",
        });
      }
    });
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Empresa *</Label>
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="nome"
                  placeholder="Digite o nome da empresa"
                  className={errors.nome ? "border-red-500" : ""}
                />
              )}
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo da Empresa *</Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className={errors.tipo ? "border-red-500" : ""}>
                    <SelectValue placeholder="Selecione o tipo da empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CompanyTypeEnum.CLIENTE}>Cliente</SelectItem>
                    <SelectItem value={CompanyTypeEnum.FORNECEDOR}>Fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo && (
              <p className="text-sm text-red-500">{errors.tipo.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cadastrando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Cadastrar Empresa
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}