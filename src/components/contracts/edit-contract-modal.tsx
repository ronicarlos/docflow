
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTransition, useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Contract, User } from '@/types';
import { contractValidationSchema, type ContractValidationData } from '@/lib/validations/contract';
import { createContract, updateContract } from '@/actions/contractActions';

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  users: User[];
}

const EditContractModal = ({ isOpen, onClose, contract, users }: EditContractModalProps) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!contract;
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  
  // Removido interceptador de console para evitar setState durante a renderização
  // Isso prevene loops de re-render quando há logs dentro do JSX.


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState,
    formState: { errors },
  } = useForm<ContractValidationData>({
    resolver: zodResolver(contractValidationSchema),
    defaultValues: {
      name: '',
      internalCode: '',
      client: '',
      startDate: '',
      endDate: '',
      scope: '',
      status: 'active',
      responsibleUserId: '',
      commonRisks: [],
      alertKeywords: [],
    },
  });

  // Reset form when contract changes or modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        name: contract?.name || '',
        internalCode: contract?.internalCode || '',
        client: contract?.client || '',
        startDate: contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract?.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
        scope: contract?.scope || '',
        status: contract?.status || 'active',
        responsibleUserId: contract?.responsibleUserId || '',
        commonRisks: contract?.commonRisks || [],
        alertKeywords: contract?.alertKeywords || [],
      });
    }
  }, [isOpen, contract?.id]); // Usando apenas isOpen e contract?.id como dependências

  const onSubmit = (data: ContractValidationData) => {
    console.group('🔍 [CONTRACT DEBUG] Iniciando processo de salvamento');
    console.log('📊 Dados do formulário recebidos:', JSON.stringify(data, null, 2));
    console.log('✏️ Modo de edição:', isEditing ? 'EDITAR' : 'CRIAR');
    console.log('📋 Contrato atual:', contract ? JSON.stringify(contract, null, 2) : 'Nenhum');
    console.log('👥 Usuários disponíveis:', users.length);
    console.log('❌ Erros do formulário:', Object.keys(errors).length > 0 ? errors : 'Nenhum erro');
    
    startTransition(async () => {
      try {
        console.log('🚀 Iniciando transição...');
        
        // Validação prévia dos dados
        console.log('🔍 Validando dados antes do processamento...');
        if (!data.name || data.name.trim() === '') {
          throw new Error('Nome do contrato é obrigatório');
        }
        if (!data.internalCode || data.internalCode.trim() === '') {
          throw new Error('Código interno é obrigatório');
        }
        if (!data.client || data.client.trim() === '') {
          throw new Error('Cliente é obrigatório');
        }
        if (!data.startDate) {
          throw new Error('Data de início é obrigatória');
        }
        if (!data.endDate) {
          throw new Error('Data de término é obrigatória');
        }
        
        console.log('✅ Validação prévia passou');
        
        // Converter arrays de texto para arrays de strings
        const processedData = {
          ...data,
          commonRisks: data.commonRisks || [],
          alertKeywords: data.alertKeywords || [],
        };
        
        console.log('🔄 Dados processados:', JSON.stringify(processedData, null, 2));
        
        let result;
        const startTime = Date.now();
        
        if (isEditing && contract) {
          console.log('📝 Executando updateContract...');
          console.log('🆔 ID do contrato:', contract.id);
          result = await updateContract(contract.id, processedData);
          console.log('📝 Resultado do updateContract:', result);
        } else {
          console.log('➕ Executando createContract...');
          result = await createContract(processedData);
          console.log('➕ Resultado do createContract:', result);
        }
        
        const endTime = Date.now();
        console.log(`⏱️ Tempo de execução: ${endTime - startTime}ms`);
        
        // Verificar se a operação foi bem-sucedida
        if (result && !result.success) {
          console.error('❌ Operação falhou:', result.message || 'Erro desconhecido');
          throw new Error(result.message || 'Operação falhou');
        }
        
        console.log('✅ Operação concluída com sucesso!');
        
        toast({
          title: '✅ Sucesso',
          description: isEditing 
            ? 'Contrato atualizado com sucesso!' 
            : 'Contrato criado com sucesso!',
        });
        
        console.log('🔄 Resetando formulário...');
        reset();
        
        console.log('🚪 Fechando modal...');
        onClose();
        
        console.log('🎉 Processo concluído com sucesso!');
        
      } catch (error: any) {
        const endTime = Date.now();
        console.error('💥 ERRO CAPTURADO:');
        console.error('📝 Mensagem:', error?.message || 'Erro desconhecido');
        console.error('📚 Stack:', error?.stack);
        console.error('🔍 Erro completo:', error);
        console.error('⏱️ Tempo até erro:', endTime - Date.now());
        
        // Tentar extrair mais informações do erro
        if (error?.response) {
          console.error('🌐 Response do erro:', error.response);
        }
        if (error?.cause) {
          console.error('🔗 Causa do erro:', error.cause);
        }
        
        toast({
          title: '❌ Erro',
          description: error?.message || (isEditing 
            ? 'Erro ao atualizar contrato. Tente novamente.' 
            : 'Erro ao criar contrato. Tente novamente.'),
          variant: 'destructive',
        });
      } finally {
        console.groupEnd();
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="contract-form-description">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Contrato' : 'Novo Contrato'}
          </DialogTitle>
          <DialogDescription id="contract-form-description">
            {isEditing 
              ? 'Edite as informações do contrato abaixo.' 
              : 'Preencha as informações para criar um novo contrato.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Contrato *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Digite o nome do contrato"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="internalCode">Código Interno *</Label>
              <Input
                id="internalCode"
                {...register('internalCode')}
                placeholder="Digite o código interno"
              />
              {errors.internalCode && (
                <p className="text-sm text-red-500">{errors.internalCode.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Cliente *</Label>
            <Input
              id="client"
              {...register('client')}
              placeholder="Digite o nome do cliente"
            />
            {errors.client && (
              <p className="text-sm text-red-500">{errors.client.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término *</Label>
              <Input
                id="endDate"
                type="date"
                {...register('endDate')}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as 'active' | 'inactive')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsibleUserId">Usuário Responsável</Label>
              <Select
                value={watch('responsibleUserId') || undefined}
                onValueChange={(value) => {
                  console.log('🔍 [DEBUG] Selecionando usuário:', value);
                  console.log('🔍 [DEBUG] Tipo do valor:', typeof value);
                  console.log('🔍 [DEBUG] Comprimento do valor:', value?.length);
                  console.log('🔍 [DEBUG] Regex test:', /^[a-zA-Z0-9]{25}$/.test(value || ''));
                  setValue('responsibleUserId', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => {
                    console.log('🔍 [DEBUG] Usuário disponível:', {
                      id: user.id,
                      name: user.name,
                      idLength: user.id?.length,
                      idType: typeof user.id,
                      regexTest: /^[a-zA-Z0-9]{25}$/.test(user.id || '')
                    });
                    return (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.responsibleUserId && (
                <p className="text-sm text-red-500">{errors.responsibleUserId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Escopo</Label>
            <Textarea
              id="scope"
              {...register('scope')}
              placeholder="Descreva o escopo do contrato"
              rows={3}
            />
            {errors.scope && (
              <p className="text-sm text-red-500">{errors.scope.message}</p>
            )}
          </div>

          {/* DEBUG PANEL - Remover em produção */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">🔍 DEBUG PANEL</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">📊 Estado do Formulário:</h4>
                <div className="bg-white p-2 rounded border max-h-32 overflow-y-auto">
                  <pre className="text-xs">{JSON.stringify(watch(), null, 2)}</pre>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">❌ Erros:</h4>
                <div className="bg-white p-2 rounded border max-h-32 overflow-y-auto">
                  <pre className="text-xs">{JSON.stringify(
                    Object.keys(errors).length > 0 
                      ? Object.fromEntries(
                          Object.entries(errors).map(([key, value]) => [
                            key, 
                            value?.message || 'Erro de validação'
                          ])
                        )
                      : 'Nenhum erro',
                    null, 
                    2
                  )}</pre>
                </div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="font-medium">✅ Válido:</span> {formState.isValid ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className="font-medium">🔄 Carregando:</span> {isPending ? 'Sim' : 'Não'}
              </div>
              <div>
                <span className="font-medium">📝 Modo:</span> {isEditing ? 'Editar' : 'Criar'}
              </div>
            </div>
            <div className="mt-2 text-xs">
              <span className="font-medium">🆔 Contract ID:</span> {contract?.id || 'N/A'}
            </div>
            
            {/* Console Logs */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-700 text-xs">📋 Console Logs:</h4>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setConsoleLogs([])}
                  className="h-6 px-2 text-xs"
                >
                  Limpar
                </Button>
              </div>
              <div className="bg-black text-green-400 p-2 rounded border max-h-40 overflow-y-auto font-mono">
                {consoleLogs.length === 0 ? (
                  <div className="text-gray-500 text-xs">Nenhum log ainda...</div>
                ) : (
                  consoleLogs.map((log, index) => (
                    <div key={index} className="text-xs mb-1 break-words">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractModal;
