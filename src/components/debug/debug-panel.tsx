'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bug, 
  Network, 
  Database, 
  Terminal, 
  Trash2, 
  Play, 
  Pause,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Copy
} from 'lucide-react';

export interface DebugLog {
  id: string;
  timestamp: Date;
  type: 'http' | 'error' | 'storage' | 'console' | 'navigation';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
  url?: string;
  status?: number;
  method?: string;
}

interface DebugPanelProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export default function DebugPanel({ isVisible = true, onToggle }: DebugPanelProps) {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRecording, setIsRecording] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isClient, setIsClient] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Garantir que o componente só renderize após hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-scroll para o final dos logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Função para adicionar log
  const addLog = (log: Omit<DebugLog, 'id' | 'timestamp'>) => {
    if (!isRecording || !isClient) return;
    
    const newLog: DebugLog = {
      ...log,
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
    };
    
    setLogs(prev => [...prev.slice(-99), newLog]); // Manter apenas os últimos 100 logs
  };

  // Interceptar requisições fetch
  useEffect(() => {
    if (!isClient) return;
    
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : 
        resource instanceof Request ? resource.url : resource.toString();
      const method = config?.method || 'GET';
      
      addLog({
        type: 'http',
        level: 'info',
        message: `${method} ${url}`,
        details: { method, url, config },
        url,
        method,
      });

      try {
        const response = await originalFetch(...args);
        
        addLog({
          type: 'http',
          level: response.ok ? 'success' : 'error',
          message: `${method} ${url} - ${response.status} ${response.statusText}`,
          details: { 
            method, 
            url, 
            status: response.status, 
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          },
          url,
          method,
          status: response.status,
        });

        return response;
      } catch (error) {
        addLog({
          type: 'http',
          level: 'error',
          message: `${method} ${url} - Network Error`,
          details: { method, url, error: error instanceof Error ? error.message : error },
          url,
          method,
        });
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [isRecording, isClient]);

  // Interceptar erros do console
  useEffect(() => {
    if (!isRecording || !isClient) return;
    
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    const originalConsoleLog = console.log;

    console.error = (...args) => {
      // Usar setTimeout para evitar setState durante renderização
      setTimeout(() => {
        addLog({
          type: 'console',
          level: 'error',
          message: args.join(' '),
          details: args,
        });
      }, 0);
      originalConsoleError(...args);
    };

    console.warn = (...args) => {
      // Usar setTimeout para evitar setState durante renderização
      setTimeout(() => {
        addLog({
          type: 'console',
          level: 'warn',
          message: args.join(' '),
          details: args,
        });
      }, 0);
      originalConsoleWarn(...args);
    };

    console.log = (...args) => {
      // Usar setTimeout para evitar setState durante renderização
      setTimeout(() => {
        addLog({
          type: 'console',
          level: 'info',
          message: args.join(' '),
          details: args,
        });
      }, 0);
      originalConsoleLog(...args);
    };

    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      console.log = originalConsoleLog;
    };
  }, [isRecording, isClient]);

  // Monitorar mudanças no localStorage e sessionStorage
  useEffect(() => {
    if (!isClient) return;
    const monitorStorage = (storage: Storage, name: string) => {
      const originalSetItem = storage.setItem;
      const originalRemoveItem = storage.removeItem;
      const originalClear = storage.clear;

      storage.setItem = function(key: string, value: string) {
        addLog({
          type: 'storage',
          level: 'info',
          message: `${name}.setItem('${key}', '${value.substring(0, 100)}${value.length > 100 ? '...' : ''}')`,
          details: { storage: name, action: 'setItem', key, value },
        });
        return originalSetItem.call(this, key, value);
      };

      storage.removeItem = function(key: string) {
        addLog({
          type: 'storage',
          level: 'warn',
          message: `${name}.removeItem('${key}')`,
          details: { storage: name, action: 'removeItem', key },
        });
        return originalRemoveItem.call(this, key);
      };

      storage.clear = function() {
        addLog({
          type: 'storage',
          level: 'warn',
          message: `${name}.clear()`,
          details: { storage: name, action: 'clear' },
        });
        return originalClear.call(this);
      };
    };

    monitorStorage(localStorage, 'localStorage');
    monitorStorage(sessionStorage, 'sessionStorage');
  }, [isRecording, isClient]);

  // Monitorar navegação
  useEffect(() => {
    if (!isClient) return;
    const handlePopState = () => {
      addLog({
        type: 'navigation',
        level: 'info',
        message: `Navegação: ${window.location.pathname}${window.location.search}`,
        details: { 
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
          href: window.location.href
        },
        url: window.location.href,
      });
    };

    window.addEventListener('popstate', handlePopState);
    
    // Log inicial da página atual
    addLog({
      type: 'navigation',
      level: 'info',
      message: `Página carregada: ${window.location.pathname}${window.location.search}`,
      details: { 
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        href: window.location.href
      },
      url: window.location.href,
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    addLog({
      type: 'console',
      level: 'info',
      message: `Debug recording ${!isRecording ? 'iniciado' : 'pausado'}`,
      details: { recording: !isRecording },
    });
  };

  const copyAllLogs = async () => {
    try {
      const logsText = logs.map(log => {
        const timestamp = log.timestamp.toLocaleString('pt-BR');
        const details = log.details ? `\nDetalhes:\n${JSON.stringify(log.details, null, 2)}` : '';
        return `${timestamp}\n${log.level.toUpperCase()} ${log.type.toUpperCase()}\n${log.message}${details}\n${'='.repeat(50)}`;
      }).join('\n\n');
      
      await navigator.clipboard.writeText(logsText);
      
      addLog({
        type: 'console',
        level: 'success',
        message: `${logs.length} logs copiados para a área de transferência`,
        details: { action: 'copy', count: logs.length },
      });
    } catch (error) {
      addLog({
        type: 'console',
        level: 'error',
        message: 'Erro ao copiar logs para a área de transferência',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  };

  const getFilteredLogs = () => {
    if (activeTab === 'all') return logs;
    return logs.filter(log => log.type === activeTab);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'http': return <Network className="h-4 w-4" />;
      case 'storage': return <Database className="h-4 w-4" />;
      case 'console': return <Terminal className="h-4 w-4" />;
      case 'navigation': return <Bug className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  if (!isVisible || !isClient) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 z-50 bg-background border rounded-lg shadow-lg">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Panel
              <Badge variant={isRecording ? "default" : "secondary"}>
                {isRecording ? "Gravando" : "Pausado"}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAllLogs}
                className="h-6 w-6 p-0"
                title="Copiar todos os logs"
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                className="h-6 w-6 p-0"
              >
                {isRecording ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLogs}
                className="h-6 w-6 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="h-6 w-6 p-0"
              >
                {isCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {!isCollapsed && (
          <CardContent className="p-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-8">
                <TabsTrigger value="all" className="text-xs">Todos</TabsTrigger>
                <TabsTrigger value="http" className="text-xs">HTTP</TabsTrigger>
                <TabsTrigger value="error" className="text-xs">Erros</TabsTrigger>
                <TabsTrigger value="storage" className="text-xs">Storage</TabsTrigger>
                <TabsTrigger value="navigation" className="text-xs">Nav</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-2">
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {getFilteredLogs().map((log) => (
                      <div
                        key={log.id}
                        className="text-xs p-2 rounded border-l-2 border-l-gray-300 bg-gray-50 hover:bg-gray-100"
                        style={{
                          borderLeftColor: 
                            log.level === 'error' ? '#ef4444' :
                            log.level === 'warn' ? '#f59e0b' :
                            log.level === 'success' ? '#10b981' : '#3b82f6'
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex items-center gap-1 mt-0.5">
                            {getLevelIcon(log.level)}
                            {getTypeIcon(log.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-gray-500">
                                {log.timestamp.toLocaleTimeString()}
                              </span>
                              {log.status && (
                                <Badge variant={log.status >= 400 ? "destructive" : "secondary"} className="text-xs">
                                  {log.status}
                                </Badge>
                              )}
                            </div>
                            <div className="font-mono break-all">
                              {log.message}
                            </div>
                            {log.details && (
                              <details className="mt-1">
                                <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                                  Detalhes
                                </summary>
                                <pre className="mt-1 text-xs bg-gray-100 p-1 rounded overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        )}
      </Card>
    </div>
  );
}