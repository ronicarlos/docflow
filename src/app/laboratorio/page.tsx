'use client';

import React, { useState, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Bug, 
  FlaskConical, 
  Settings, 
  AlertTriangle, 
  Info,
  ArrowLeft,
  TestTube
} from 'lucide-react';
import Link from 'next/link';

// Lazy load do DebugPanel
const DebugPanel = lazy(() => import('@/components/debug/debug-panel'));

export default function LaboratorioPage() {
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);
  const { toast } = useToast();

  const handleDebugToggle = (enabled: boolean) => {
    setIsDebugEnabled(enabled);
    toast({
      title: enabled ? "Debug Panel Ativado" : "Debug Panel Desativado",
      description: enabled 
        ? "O painel de debug está agora visível e coletando logs."
        : "O painel de debug foi desativado e não está mais visível.",
      variant: enabled ? "default" : "destructive",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FlaskConical className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Laboratório de Desenvolvimento</h1>
            <p className="text-muted-foreground">
              Ferramentas para debug e testes durante o desenvolvimento
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
          </Link>
        </Button>
      </div>

      {/* Aviso de Ambiente */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-800">Ambiente de Desenvolvimento</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-amber-700">
            Esta página contém ferramentas de desenvolvimento e debug. 
            Use apenas durante o desenvolvimento para identificar e resolver problemas.
          </p>
        </CardContent>
      </Card>

      {/* Controles de Debug */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <CardTitle>Painel de Debug</CardTitle>
          </div>
          <CardDescription>
            Ative o painel de debug para monitorar requisições HTTP, erros de console, 
            mudanças no localStorage e navegação em tempo real.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="debug-toggle" className="text-base font-medium">
                Ativar Debug Panel
              </Label>
              <p className="text-sm text-muted-foreground">
                Mostra logs em tempo real no canto inferior direito da tela
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isDebugEnabled ? "default" : "secondary"}>
                {isDebugEnabled ? "Ativo" : "Inativo"}
              </Badge>
              <Switch
                id="debug-toggle"
                checked={isDebugEnabled}
                onCheckedChange={handleDebugToggle}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Funcionalidades do Debug Panel:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6">
              <li>• Interceptação de requisições HTTP (fetch)</li>
              <li>• Captura de erros e warnings do console</li>
              <li>• Monitoramento de mudanças no localStorage/sessionStorage</li>
              <li>• Rastreamento de navegação entre páginas</li>
              <li>• Filtros por tipo de log (HTTP, Erros, Storage, Navegação)</li>
              <li>• Exportação de logs para análise</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Atalhos de Teclado:</h4>
            <p className="text-sm text-blue-700">
              <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Ctrl</kbd> + 
              <kbd className="px-2 py-1 bg-blue-100 rounded text-xs mx-1">Shift</kbd> + 
              <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">D</kbd> 
              - Alternar visibilidade do debug panel
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Outras Ferramentas de Laboratório */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            <CardTitle>Outras Ferramentas</CardTitle>
          </div>
          <CardDescription>
            Ferramentas adicionais para desenvolvimento e testes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Testes de Formulário</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Arquivos de teste para validação de formulários
              </p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  • test-contract-form.html - Testes de contrato
                </p>
                <p className="text-xs text-muted-foreground">
                  • debug-form-data.js - Debug de FormData
                </p>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Scripts de Teste</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Scripts para validação de funcionalidades
              </p>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  • test-contract-edit-form.js - Teste de edição
                </p>
                <p className="text-xs text-muted-foreground">
                  • test-form-data-debug.js - Debug de dados
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel */}
      {isDebugEnabled && (
        <Suspense fallback={null}>
          <DebugPanel isVisible={true} />
        </Suspense>
      )}
    </div>
  );
}