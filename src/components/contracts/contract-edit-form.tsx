'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X, Plus } from 'lucide-react';
import type { Contract } from '@/types/Contract';
import { updateContractSchema, UpdateContractData } from '@/lib/validations/contract';
import { updateContract } from '@/actions/contractActions';

interface ContractEditFormProps {
  contract: Contract;
}

export function ContractEditForm({ contract }: ContractEditFormProps) {
  const [commonRisks, setCommonRisks] = useState<string[]>(contract.commonRisks || []);
  const [alertKeywords, setAlertKeywords] = useState<string[]>(contract.alertKeywords || []);
  const [newRisk, setNewRisk] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<UpdateContractData>({
    resolver: zodResolver(updateContractSchema),
    defaultValues: {
       name: contract.name || '',
       internalCode: contract.internalCode || '',
       client: contract.client || '',
       scope: contract.scope || '',
       startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
       endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
       status: contract.status || 'active',
       responsibleUserId: contract.responsibleUserId || '',
       // tenantId removido: será definido pela Server Action
       commonRisks: contract.commonRisks || [],
       alertKeywords: contract.alertKeywords || [],
       analysisDocumentTypeIds: contract.analysisDocumentTypeIds || [],
    },
    mode: 'onChange',
  });

  // Atualizar arrays no formulário quando mudarem
  useEffect(() => {
    setValue('commonRisks', commonRisks);
  }, [commonRisks, setValue]);

  useEffect(() => {
    setValue('alertKeywords', alertKeywords);
  }, [alertKeywords, setValue]);

  // Funções para gerenciar riscos comuns
  const addCommonRisk = () => {
    if (newRisk.trim() && !commonRisks.includes(newRisk.trim())) {
      setCommonRisks([...commonRisks, newRisk.trim()]);
      setNewRisk('');
    }
  };

  const removeCommonRisk = (risk: string) => {
    setCommonRisks(commonRisks.filter(r => r !== risk));
  };

  // Funções para gerenciar palavras-chave de alerta
  const addAlertKeyword = () => {
    if (newKeyword.trim() && !alertKeywords.includes(newKeyword.trim())) {
      setAlertKeywords([...alertKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeAlertKeyword = (keyword: string) => {
    setAlertKeywords(alertKeywords.filter(k => k !== keyword));
  };

  // Função de submit
  const onSubmit = async (data: UpdateContractData) => {
    try {
      console.log('🚀 [FORM] Iniciando submit do formulário');
      console.log('🚀 [FORM] Dados do formulário:', data);
      console.log('🚀 [FORM] Riscos comuns:', commonRisks);
      console.log('🚀 [FORM] Palavras-chave:', alertKeywords);
      
      setSaving(true);
      const payload: UpdateContractData = {
        ...data,
        status: (data.status as 'active' | 'inactive') || 'active',
        commonRisks,
        alertKeywords,
      };

      console.log('🚀 [FORM] Payload final:', payload);
      console.log('🚀 [FORM] Chamando updateContract com ID:', contract.id);
      
      const result = await updateContract(contract.id, payload);
      
      console.log('🚀 [FORM] Resultado da action:', result);
      
      if (result.success) {
        console.log('✅ [FORM] Sucesso! Exibindo toast e redirecionando');
        toast({ 
          title: 'Sucesso', 
          description: result.message || 'Contrato atualizado com sucesso!' 
        });
        router.push('/contracts');
      } else {
        console.log('❌ [FORM] Erro na action. Mensagem:', result.message);
        if (result.errors?.length) {
          console.log('❌ [FORM] Erros de validação:', result.errors);
        }
        toast({ 
          title: 'Erro ao salvar', 
          description: result.message || 'Falha na atualização', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('❌ [FORM] Erro capturado no try/catch:', error);
      toast({ 
        title: 'Erro inesperado', 
        description: 'Ocorreu um erro ao salvar o contrato.', 
        variant: 'destructive' 
      });
    } finally {
      console.log('🏁 [FORM] Finalizando submit, setSaving(false)');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Campos ocultos necessários para validação */}
      {/* tenantId removido do formulário */}

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Contrato *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Digite o nome do contrato"
                className={errors.name ? 'border-red-500' : ''}
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
                className={errors.internalCode ? 'border-red-500' : ''}
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
              className={errors.client ? 'border-red-500' : ''}
            />
            {errors.client && (
              <p className="text-sm text-red-500">{errors.client.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Escopo</Label>
            <Textarea
              id="scope"
              {...register('scope')}
              placeholder="Descreva o escopo do contrato"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Datas e Status */}
      <Card>
        <CardHeader>
          <CardTitle>Datas e Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início *</Label>
              <Input
                id="startDate"
                type="date"
                {...register('startDate')}
                className={errors.startDate ? 'border-red-500' : ''}
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
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500">{errors.endDate.message}</p>
              )}
            </div>

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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Riscos Comuns */}
      <Card>
        <CardHeader>
          <CardTitle>Riscos Comuns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newRisk}
              onChange={(e) => setNewRisk(e.target.value)}
              placeholder="Digite um risco comum"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCommonRisk())}
            />
            <Button type="button" onClick={addCommonRisk} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {commonRisks.map((risk, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {risk}
                <button
                  type="button"
                  onClick={() => removeCommonRisk(risk)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Palavras-chave de Alerta */}
      <Card>
        <CardHeader>
          <CardTitle>Palavras-chave de Alerta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Digite uma palavra-chave"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlertKeyword())}
            />
            <Button type="button" onClick={addAlertKeyword} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {alertKeywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {keyword}
                <button
                  type="button"
                  onClick={() => removeAlertKeyword(keyword)}
                  className="ml-1 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 pt-6">
        <Button
          type="submit"
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}