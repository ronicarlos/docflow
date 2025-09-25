'use client';

import React from 'react';
import { Control, Controller, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { CreateContractData, UpdateContractData } from '@/lib/validations/contract';
import type { User } from '@/types';

interface ContractFormFieldsProps {
  control: Control<any>;
  errors: FieldErrors<any>;
  users?: User[];
  isLoading?: boolean;
  watch: (name: string) => any;
  setValue: UseFormSetValue<any>;
}

export default function ContractFormFields({
  control,
  errors,
  users = [],
  isLoading = false,
  watch,
  setValue
}: ContractFormFieldsProps) {
  // Funções para gerenciar arrays
  const addRisk = () => {
    const currentRisks = watch('commonRisks') || [];
    setValue('commonRisks', [...currentRisks, '']);
  };

  const removeRisk = (index: number) => {
    const currentRisks = watch('commonRisks') || [];
    setValue('commonRisks', currentRisks.filter((_: string, i: number) => i !== index));
  };

  const updateRisk = (index: number, value: string) => {
    const currentRisks = watch('commonRisks') || [];
    const updatedRisks = [...currentRisks];
    updatedRisks[index] = value;
    setValue('commonRisks', updatedRisks);
  };

  const addKeyword = () => {
    const currentKeywords = watch('alertKeywords') || [];
    setValue('alertKeywords', [...currentKeywords, '']);
  };

  const removeKeyword = (index: number) => {
    const currentKeywords = watch('alertKeywords') || [];
    setValue('alertKeywords', currentKeywords.filter((_: string, i: number) => i !== index));
  };

  const updateKeyword = (index: number, value: string) => {
    const currentKeywords = watch('alertKeywords') || [];
    const updatedKeywords = [...currentKeywords];
    updatedKeywords[index] = value;
    setValue('alertKeywords', updatedKeywords);
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Nome do Contrato *</Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                id="name"
                placeholder="Ex: Projeto Construção Edifício X"
                disabled={isLoading}
                {...field}
              />
            )}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{String(errors.name.message) || 'Erro de validação'}</p>
          )}
        </div>

        <div>
          <Label htmlFor="internalCode">Código Interno *</Label>
          <Controller
            name="internalCode"
            control={control}
            render={({ field }) => (
              <Input
                id="internalCode"
                placeholder="Ex: CT-2024-001"
                disabled={isLoading}
                {...field}
              />
            )}
          />
          {errors.internalCode && (
            <p className="text-sm text-destructive mt-1">{String(errors.internalCode.message) || 'Erro de validação'}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="client">Cliente *</Label>
        <Controller
          name="client"
          control={control}
          render={({ field }) => (
            <Input
              id="client"
              placeholder="Nome do cliente"
              disabled={isLoading}
              {...field}
            />
          )}
        />
        {errors.client && (
          <p className="text-sm text-destructive mt-1">{String(errors.client.message) || 'Erro de validação'}</p>
        )}
      </div>

      <div>
        <Label htmlFor="scope">Escopo</Label>
        <Controller
          name="scope"
          control={control}
          render={({ field }) => (
            <Textarea
              id="scope"
              placeholder="Descrição do escopo do contrato"
              disabled={isLoading}
              {...field}
              value={field.value || ''}
            />
          )}
        />
        {errors.scope && (
          <p className="text-sm text-destructive mt-1">{String(errors.scope.message) || 'Erro de validação'}</p>
        )}
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Data de Início *</Label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <Input
                id="startDate"
                type="date"
                disabled={isLoading}
                {...field}
              />
            )}
          />
          {errors.startDate && (
            <p className="text-sm text-destructive mt-1">{String(errors.startDate.message) || 'Erro de validação'}</p>
          )}
        </div>

        <div>
          <Label htmlFor="endDate">Data de Fim *</Label>
          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <Input
                id="endDate"
                type="date"
                disabled={isLoading}
                {...field}
              />
            )}
          />
          {errors.endDate && (
            <p className="text-sm text-destructive mt-1">{String(errors.endDate.message) || 'Erro de validação'}</p>
          )}
        </div>
      </div>

      {/* Status e Responsável */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="status">Status *</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="ACTIVE">Ativo</SelectItem>
                  <SelectItem value="EXPIRED">Expirado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && (
            <p className="text-sm text-destructive mt-1">{String(errors.status.message) || 'Erro de validação'}</p>
          )}
        </div>

        <div>
          <Label htmlFor="responsibleUserId">Usuário Responsável</Label>
          <Controller
            name="responsibleUserId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value || ''} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.responsibleUserId && (
            <p className="text-sm text-destructive mt-1">{String(errors.responsibleUserId.message) || 'Erro de validação'}</p>
          )}
        </div>
      </div>

      {/* Riscos Comuns */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Riscos Comuns</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRisk}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Risco
          </Button>
        </div>
        <div className="space-y-2">
          {(watch('commonRisks') || []).map((risk: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Descreva o risco..."
                value={risk}
                onChange={(e) => updateRisk(index, e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeRisk(index)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Palavras-chave de Alerta */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Palavras-chave de Alerta</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addKeyword}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Palavra-chave
          </Button>
        </div>
        <div className="space-y-2">
          {(watch('alertKeywords') || []).map((keyword: string, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="Palavra-chave..."
                value={keyword}
                onChange={(e) => updateKeyword(index, e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeKeyword(index)}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}