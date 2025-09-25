
// src/app/training/page.tsx (Server Component)
import { TrainingService } from '@/services/trainingService';
import TrainingGuideClient from '@/components/training/training-guide-client';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { User } from '@/types';

export default async function TrainingGuidePage() {
  // Get current user and tenant
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  try {
    // Fetch training modules from PostgreSQL
    const modules = await TrainingService.getTrainingModules(currentUser.tenantId);
    
    return (
      <TrainingGuideClient 
        initialModules={modules}
        initialCurrentUser={currentUser as User}
      />
    );
  } catch (error) {
    console.error('Erro ao carregar página de treinamento:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao Carregar Treinamento</h1>
          <p className="text-muted-foreground">
            Não foi possível carregar os módulos de treinamento. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }
}
