'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  User as UserIcon, 
  Building, 
  DollarSign, 
  Hash, 
  Clock,
  Download,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Contract, ContractStatus } from '@/types/Contract';

interface ContractDetailModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (contract: Contract) => void;
  onDelete?: (contract: Contract) => void;
}

export function ContractDetailModal({ 
  contract, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete 
}: ContractDetailModalProps) {
  if (!contract) return null;

  const getStatusBadge = (status: ContractStatus) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Ativo
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            Inativo
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Não informado';
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleDownloadAttachment = (attachment: any) => {
    // Implementar download do anexo
    console.log('Download attachment:', attachment);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-bold">
            Detalhes do Contrato
          </DialogTitle>
          <div className="flex items-center space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(contract)}
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Editar</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(contract)}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>Excluir</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Informações Básicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Nome do Contrato
                  </h4>
                  <p className="text-sm font-medium">{contract.name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </h4>
                  {getStatusBadge(contract.status)}
                </div>

                {contract.internalCode && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center space-x-1">
                      <Hash className="h-3 w-3" />
                      <span>Código Interno</span>
                    </h4>
                    <p className="text-sm font-medium">{contract.internalCode}</p>
                  </div>
                )}

                {contract.client && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center space-x-1">
                      <Building className="h-3 w-3" />
                      <span>Cliente</span>
                    </h4>
                    <p className="text-sm font-medium">{contract.client}</p>
                  </div>
                )}
              </div>

              {contract.scope && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Escopo
                  </h4>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {contract.scope}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Datas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Data de Início
                  </h4>
                  <p className="text-sm font-medium">{formatDate(contract.startDate)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Data de Fim
                  </h4>
                  <p className="text-sm font-medium">{formatDate(contract.endDate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Responsável</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Usuário Responsável
                </h4>
                <p className="text-sm font-medium">
                  {contract.responsibleUser?.name || 'Não informado'}
                </p>
                {contract.responsibleUser?.email && (
                  <p className="text-sm text-muted-foreground">
                    {contract.responsibleUser.email}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {contract.scope && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {contract.scope}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Anexos */}
          {contract.attachments && contract.attachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Anexos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contract.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">{attachment.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {attachment.fileSize ? `${Math.round(attachment.fileSize / 1024)} KB` : ''}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Análise de IA */}
          {contract.aiAnalyses && contract.aiAnalyses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Análise de IA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contract.aiAnalyses[0].analysisResult?.riskLevel && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Nível de Risco
                      </h4>
                      <Badge 
                        variant={
                          contract.aiAnalyses[0].analysisResult.riskLevel === 'high' ? 'destructive' :
                          contract.aiAnalyses[0].analysisResult.riskLevel === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {contract.aiAnalyses[0].analysisResult.riskLevel === 'high' ? 'Alto' :
                         contract.aiAnalyses[0].analysisResult.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                      </Badge>
                    </div>
                  )}

                  {contract.aiAnalyses[0].analysisResult?.summary && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">
                        Resumo da Análise
                      </h4>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {contract.aiAnalyses[0].analysisResult.summary}
                      </p>
                    </div>
                  )}

                  {contract.aiAnalyses[0].analysisResult?.recommendations && contract.aiAnalyses[0].analysisResult.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        Recomendações
                      </h4>
                      <ul className="space-y-1">
                        {contract.aiAnalyses[0].analysisResult.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="text-sm text-gray-700 flex items-start space-x-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Informações do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-muted-foreground mb-1">
                    Criado em
                  </h4>
                  <p>{formatDate(contract.createdAt)}</p>
                </div>
                <div>
                  <h4 className="font-medium text-muted-foreground mb-1">
                    Última atualização
                  </h4>
                  <p>{formatDate(contract.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}