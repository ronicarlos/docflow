
import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { aiKnowledgeBaseService } from '@/services/aiKnowledgeBaseService';
import { redirect } from 'next/navigation';
import AiKnowledgeBaseClient from './AiKnowledgeBaseClient';

export default async function AiKnowledgeBasePage() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/login');
    }

    // Verificar permissões - apenas Admin e SuperAdmin podem acessar
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      redirect('/dashboard');
    }

    const content = await aiKnowledgeBaseService.getActiveKnowledgeBase(user.tenantId);

    return (
      <Suspense fallback={<div>Carregando...</div>}>
        <AiKnowledgeBaseClient initialContent={content} />
      </Suspense>
    );
  } catch (error) {
    console.error('Erro ao carregar página da base de conhecimento:', error);
    redirect('/dashboard');
  }
}
