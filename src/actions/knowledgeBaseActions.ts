
'use server';

import { aiKnowledgeBaseService } from '@/services/aiKnowledgeBaseService';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function getKnowledgeBase(): Promise<string> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/login');
    }

    return await aiKnowledgeBaseService.getActiveKnowledgeBase(user.tenantId);
  } catch (error) {
    console.error('Erro ao buscar base de conhecimento:', error);
    throw new Error('Erro ao buscar base de conhecimento');
  }
}

export async function saveKnowledgeBase(content: string): Promise<void> {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/login');
    }

    // Verificar permissões - apenas Admin e SuperAdmin podem editar
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      throw new Error('Você não tem permissão para editar a base de conhecimento');
    }

    await aiKnowledgeBaseService.saveKnowledgeBase(content, user.tenantId, user.id);
  } catch (error) {
    console.error('Erro ao salvar base de conhecimento:', error);
    throw error;
  }
}
