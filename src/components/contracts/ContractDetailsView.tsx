'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Contract } from '@/types/Contract';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Calendar, 
  User as UserIcon, 
  Building, 
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ContractDetailsViewProps {
  contract: Contract;
}

export function ContractDetailsView({ contract }: ContractDetailsViewProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inativo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vencido':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return <CheckCircle className="w-4 h-4" />;
      case 'inativo':
        return <XCircle className="w-4 h-4" />;
      case 'pendente':
        return <Clock className="w-4 h-4" />;
      case 'vencido':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string | Date) => {
    if (!date) return 'Não informado';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{contract.name}</h1>
            <p className="text-gray-600 mt-1">ID: {contract.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={`flex items-center space-x-1 ${getStatusColor(contract.status)}`}>
            {getStatusIcon(contract.status)}
            <span>{contract.status}</span>
          </Badge>
          <Button
            onClick={() => {
              if (!contract.id || contract.id === 'undefined') {
                console.error('ID do contrato inválido para edição:', contract.id);
                return;
              }
              router.push(`/contracts/${contract.id}/edit`);
            }}
            className="flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Editar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Informações Gerais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Código Interno</label>
                  <p className="text-lg font-semibold">{contract.internalCode || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="text-lg">{contract.status || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cliente</label>
                  <p className="text-lg">{contract.client || 'Não informado'}</p>
                </div>
              </div>
              
              {contract.scope && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Escopo</label>
                    <p className="text-gray-900 mt-1 leading-relaxed">{contract.scope}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Partes Envolvidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Partes Envolvidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Cliente</label>
                  <p className="text-lg">{contract.client || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Responsável</label>
                  <p className="text-lg">{contract.responsibleUser?.name || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valores e Condições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Valores e Condições</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Início</label>
                  <p className="text-lg">{formatDate(contract.startDate)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Data de Fim</label>
                  <p className="text-lg">{formatDate(contract.endDate)}</p>
                </div>
              </div>
              
              {contract.commonRisks && contract.commonRisks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Riscos Comuns</label>
                    <div className="mt-1 space-y-1">
                      {contract.commonRisks.map((risk: string, index: number) => (
                        <p key={index} className="text-gray-900">• {risk}</p>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Datas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Datas Importantes</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Início</label>
                <p className="text-sm">{formatDate(contract.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Data de Término</label>
                <p className="text-sm">{formatDate(contract.endDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Criado em</label>
                <p className="text-sm">{formatDate(contract.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                <p className="text-sm">{formatDate(contract.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Responsáveis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>Responsáveis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Criado em</label>
                <p className="text-sm">{formatDate(contract.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Atualizado em</label>
                <p className="text-sm">{formatDate(contract.updatedAt)}</p>
              </div>
              {contract.responsibleUser && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Responsável</label>
                  <p className="text-sm">{contract.responsibleUser.name}</p>
                  <p className="text-xs text-gray-400">{contract.responsibleUser.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Palavras-chave de Alerta */}
          {contract.alertKeywords && contract.alertKeywords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Palavras-chave de Alerta ({contract.alertKeywords.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contract.alertKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">{keyword}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}