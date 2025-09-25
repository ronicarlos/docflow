'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { createContract, updateContract } from '@/actions/contractActions';
import { 
  createContractSchema, 
  updateContractSchema, 
  validateContractData, 
  sanitizeContractData,
  type CreateContractData,
  type UpdateContractData
} from '@/lib/validations/contract';
import ContractFormFields from './contract-form-fields';
import type { User, Contract } from '@/types';
import Link from 'next/link';

interface NewEditContractFormProps {
  contract?: Contract;
  users: User[];
  mode: 'create' | 'edit';
}

export default function NewEditContractForm({ contract, users, mode }: NewEditContractFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isEditing = mode === 'edit' && contract;
  // Para edição, usamos um schema que não requer validação de zodResolver
  // pois os dados já estão validados no backend
  const schema = isEditing ? undefined : createContractSchema;

  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors, isDirty }, 
    watch, 
    setValue 
  } = useForm<any>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: isEditing ? {
      name: contract.name || '',
      internalCode: contract.internalCode || '',
      client: contract.client || '',
      scope: contract.scope || '',
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      status: (contract.status as 'active' | 'inactive') || 'active',
      responsibleUserId: contract.responsibleUserId || null,
      commonRisks: contract.commonRisks || [],
      alertKeywords: contract.alertKeywords || [],
      analysisDocumentTypeIds: contract.analysisDocumentTypeIds || []
    } : {
      name: '',
      internalCode: '',
      client: '',
      scope: '',
      startDate: '',
      endDate: '',
      status: 'active',
      responsibleUserId: null,
      commonRisks: [],
      alertKeywords: [],
      analysisDocumentTypeIds: []
    }
  });

  const onSubmit = async (data: any) => {
    console.log('🚀 [DEBUG] Iniciando submissão do formulário...', { mode: isEditing ? 'edit' : 'create' });
    console.log('📋 [DEBUG] Dados do formulário:', JSON.stringify(data, null, 2));
    
    startTransition(async () => {
      try {
        // Mostrar toast de loading
        toast({
          title: 'Processando...',
          description: isEditing ? 'Atualizando contrato...' : 'Criando contrato...',
        });

        // Para edição, incluir o ID do contrato nos dados
        // Removido: ID não deve ser incluído nos dados; é passado como parâmetro separado
        const dataWithId = data;
        
        // Sanitizar dados antes da validação
        console.log('🧹 [DEBUG] Sanitizando dados...');
        const sanitizedData = sanitizeContractData(dataWithId);
        console.log('✨ [DEBUG] Dados sanitizados:', JSON.stringify(sanitizedData, null, 2));
        
        // Validar dados com o schema apropriado (apenas para criação)
        if (!isEditing && schema) {
          console.log('✅ [DEBUG] Validando dados...');
          const validation = validateContractData(sanitizedData, schema);
          console.log('🔍 [DEBUG] Resultado da validação:', { success: validation.success, errors: validation.errors });
          
          if (!validation.success) {
            console.error('❌ [DEBUG] Validação falhou:', validation.errors);
            toast({
              title: 'Erro de Validação',
              description: 'Por favor, corrija os erros no formulário.',
              variant: 'destructive',
            });
            
            // Mostrar erros específicos se disponíveis
            if (validation.errors && Object.keys(validation.errors).length > 0) {
              const errorMessages = Object.entries(validation.errors)
                .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                .join('\n');
              
              toast({
                title: 'Detalhes dos Erros',
                description: errorMessages,
                variant: 'destructive',
              });
            }
            return;
          }
        }

        console.log('🚀 [DEBUG] Chamando Server Action...');
        let result;
        if (isEditing) {
          console.log('✏️ [DEBUG] Modo edição - chamando updateContract');
          result = await updateContract(contract.id, sanitizedData as UpdateContractData);
        } else {
          console.log('➕ [DEBUG] Modo criação - chamando createContract');
          result = await createContract(sanitizedData as CreateContractData);
        }

        console.log('📊 [DEBUG] Resultado da Server Action:', JSON.stringify(result, null, 2));

        if (result.success) {
          console.log('✅ [DEBUG] Operação bem-sucedida!');
          toast({
            title: 'Sucesso!',
            description: isEditing 
              ? 'Contrato atualizado com sucesso!' 
              : 'Contrato criado com sucesso!',
          });
          
          // Aguardar um pouco antes de redirecionar para mostrar o toast
          setTimeout(() => {
            console.log('🔄 [DEBUG] Redirecionando para /contracts');
            router.push('/contracts');
          }, 1000);
        } else {
          console.error('❌ [DEBUG] Erro na operação:', result.message);
          console.error('❌ [DEBUG] Erros detalhados:', result.errors);
          
          toast({
            title: 'Erro ao Salvar',
            description: result.message || 'Ocorreu um erro ao salvar o contrato.',
            variant: 'destructive',
          });
          
          // Mostrar erros específicos se disponíveis
          if (result.errors && Object.keys(result.errors).length > 0) {
            const errorMessages = Object.entries(result.errors)
              .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
              .join('\n');
            
            toast({
              title: 'Detalhes dos Erros',
              description: errorMessages,
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('💥 [DEBUG] Erro inesperado:', error);
        console.error('💥 [DEBUG] Stack trace:', error instanceof Error ? error.stack : 'N/A');
        
        toast({
          title: 'Erro Inesperado',
          description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao salvar o contrato.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" asChild>
            <Link href="/contracts">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing 
                ? `Modifique as informações do contrato "${contract.name}".`
                : 'Preencha as informações para criar um novo contrato.'
              } Todos os campos marcados com * são obrigatórios.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? 'Dados do Contrato' : 'Informações do Contrato'}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? 'Atualize as informações básicas do contrato'
              : 'Preencha os dados básicos do novo contrato'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ContractFormFields
              control={control}
              errors={errors}
              users={users}
              isLoading={isPending}
              watch={watch}
              setValue={setValue}
            />

            <div className="flex justify-end gap-4 pt-6 border-t">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Atualizar' : 'Criar'} Contrato
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}