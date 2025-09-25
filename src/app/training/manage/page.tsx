
// src/app/training/manage/page.tsx (Server Component)
import { TrainingService } from '@/services/trainingService';
import ManageTrainingClient from '@/components/training/manage-training-client';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ManageTrainingPage() {
  // Get current user and check permissions
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }
  
  if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
    redirect('/dashboard');
  }

  try {
    // Fetch training modules from PostgreSQL
    const initialModules = await TrainingService.getTrainingModules(currentUser.tenantId);

    return <ManageTrainingClient initialModules={initialModules} />;
  } catch (error) {
    console.error('Erro ao carregar página de gerenciamento de treinamento:', error);
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao Carregar Gerenciamento</h1>
          <p className="text-muted-foreground">
            Não foi possível carregar os módulos de treinamento. Tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }
}
