import { useState, useEffect, useCallback } from 'react';
import { httpInterceptor } from '@/lib/http-interceptor';

export interface DebugLog {
  id: string;
  timestamp: number;
  type: 'http' | 'error' | 'navigation' | 'storage' | 'console';
  message: string;
  data?: any;
  level?: 'info' | 'warn' | 'error';
}

interface DebugState {
  isVisible: boolean;
  isRecording: boolean;
  logs: DebugLog[];
}

const STORAGE_KEY = 'debug-panel-state';

export function useDebug() {
  const [state, setState] = useState<DebugState>({
    isVisible: false,
    isRecording: false,
    logs: []
  });

  // Carregar estado do localStorage após hidratação
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setState({
          isVisible: parsed.isVisible || false,
          isRecording: parsed.isRecording || false,
          logs: []
        });
      }
    } catch (error) {
      console.error('Error loading debug state:', error);
    }
  }, []);

  // Salvar estado no localStorage
  const saveState = useCallback((newState: Partial<DebugState>) => {
    const updatedState = { ...state, ...newState };
    setState(updatedState);
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        isVisible: updatedState.isVisible,
        isRecording: updatedState.isRecording
      }));
    } catch (error) {
      console.error('Error saving debug state:', error);
    }
  }, [state]);

  // Adicionar log
  const addDebugLog = useCallback((log: Omit<DebugLog, 'id' | 'timestamp'>) => {
    if (!state.isRecording) return;
    
    const newLog: DebugLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level: log.level || 'info'
    };

    setState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-99), newLog] // Manter apenas os últimos 100 logs
    }));
  }, [state.isRecording]);

  // Toggle visibilidade
  const toggleDebug = useCallback(() => {
    saveState({ isVisible: !state.isVisible });
  }, [state.isVisible, saveState]);

  // Toggle gravação
  const toggleRecording = useCallback(() => {
    const newRecording = !state.isRecording;
    saveState({ isRecording: newRecording });
    
    if (newRecording) {
      addDebugLog({
        type: 'console',
        message: 'Depuração iniciada',
        level: 'info'
      });
    } else {
      addDebugLog({
        type: 'console',
        message: 'Depuração pausada',
        level: 'info'
      });
    }
  }, [state.isRecording, saveState, addDebugLog]);

  // Limpar logs
  const clearDebugLogs = useCallback(() => {
    setState(prev => ({ ...prev, logs: [] }));
  }, []);

  // Inicializar interceptadores
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Inicializar interceptador HTTP
    httpInterceptor.init();

    // Listener para requisições HTTP
    const httpListener = {
      onRequest: (request: any) => {
        addDebugLog({
          type: 'http',
          message: `${request.method} ${request.url}`,
          data: request,
          level: 'info'
        });
      },
      onResponse: (response: any) => {
        addDebugLog({
          type: 'http',
          message: `${response.status} ${response.statusText} (${response.duration}ms)`,
          data: response,
          level: response.status >= 400 ? 'error' : 'info'
        });
      },
      onError: (error: any) => {
        addDebugLog({
          type: 'error',
          message: `HTTP Error: ${error.message}`,
          data: error,
          level: 'error'
        });
      }
    };

    httpInterceptor.addListener(httpListener);

    // Interceptar console.error
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Usar setTimeout para evitar setState durante renderização
      setTimeout(() => {
        addDebugLog({
          type: 'console',
          message: `Console Error: ${args.join(' ')}`,
          data: args,
          level: 'error'
        });
      }, 0);
      originalConsoleError.apply(console, args);
    };

    // Interceptar console.warn
    const originalConsoleWarn = console.warn;
    console.warn = (...args) => {
      // Usar setTimeout para evitar setState durante renderização
      setTimeout(() => {
        addDebugLog({
          type: 'console',
          message: `Console Warning: ${args.join(' ')}`,
          data: args,
          level: 'warn'
        });
      }, 0);
      originalConsoleWarn.apply(console, args);
    };

    // Monitorar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.newValue !== e.oldValue) {
        addDebugLog({
          type: 'storage',
          message: `LocalStorage changed: ${e.key}`,
          data: { key: e.key, oldValue: e.oldValue, newValue: e.newValue },
          level: 'info'
        });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Atalho de teclado Ctrl+Shift+D
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDebug();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      httpInterceptor.removeListener(httpListener);
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [addDebugLog, toggleDebug]);

  return {
    isDebugVisible: state.isVisible,
    isRecording: state.isRecording,
    logs: state.logs,
    addDebugLog,
    toggleDebug,
    toggleRecording,
    clearDebugLogs
  };
}

// Hook específico para contratos
export function useContractDebug() {
  const { addDebugLog } = useDebug();

  const logContractAction = useCallback((action: string, contractId: string, data?: any) => {
    addDebugLog({
      type: 'navigation',
      message: `Contract Action: ${action} (ID: ${contractId})`,
      data: { action, contractId, ...data },
      level: 'info'
    });
  }, [addDebugLog]);

  const logContractError = useCallback((error: string, contractId?: string, data?: any) => {
    addDebugLog({
      type: 'error',
      message: `Contract Error: ${error}${contractId ? ` (ID: ${contractId})` : ''}`,
      data: { error, contractId, ...data },
      level: 'error'
    });
  }, [addDebugLog]);

  return {
    logContractAction,
    logContractError
  };
}