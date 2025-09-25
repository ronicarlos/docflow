'use client';

import { useState, useEffect } from 'react';
import type { AiAssistantMessage } from '@prisma/client';

export interface AiAssistantState {
  history: AiAssistantMessage[];
  isLoading: boolean;
  error: string | null;
}

export function useAiAssistant(tenantId: string | null) {
  const [state, setState] = useState<AiAssistantState>({
    history: [],
    isLoading: false,
    error: null,
  });

  const loadHistory = async () => {
    if (!tenantId) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/ai-assistant/history?tenantId=${tenantId}`);
      
      if (!response.ok) {
        throw new Error('Falha ao carregar histórico do AI Assistant');
      }

      const history = await response.json();
      setState(prev => ({ ...prev, history, isLoading: false }));
    } catch (error) {
      console.error('Erro ao carregar histórico do AI Assistant:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }));
    }
  };

  const saveMessage = async (question: string, answer: string, context?: string, confidence?: number) => {
    if (!tenantId) return null;

    try {
      const response = await fetch('/api/ai-assistant/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          answer,
          context,
          confidence,
          tenantId,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar mensagem do AI Assistant');
      }

      const savedMessage = await response.json();
      
      // Atualiza o histórico local
      setState(prev => ({
        ...prev,
        history: [savedMessage, ...prev.history],
      }));

      return savedMessage;
    } catch (error) {
      console.error('Erro ao salvar mensagem do AI Assistant:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao salvar mensagem' 
      }));
      return null;
    }
  };

  const updateMessageFeedback = async (messageId: string, isHelpful: boolean) => {
    try {
      const response = await fetch(`/api/ai-assistant/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isHelpful }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar feedback da mensagem');
      }

      const updatedMessage = await response.json();
      
      // Atualiza o histórico local
      setState(prev => ({
        ...prev,
        history: prev.history.map(msg => 
          msg.id === messageId ? updatedMessage : msg
        ),
      }));

      return updatedMessage;
    } catch (error) {
      console.error('Erro ao atualizar feedback da mensagem:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar feedback' 
      }));
      return null;
    }
  };

  useEffect(() => {
    loadHistory();
  }, [tenantId]);

  return {
    ...state,
    loadHistory,
    saveMessage,
    updateMessageFeedback,
  };
}