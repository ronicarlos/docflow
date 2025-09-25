
'use server';

import { TrainingService } from '@/services/trainingService';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Schema de validação para módulo de treinamento
const trainingModuleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  order: z.number().min(0, 'Ordem deve ser um número positivo'),
});

// Schema de validação para lição de treinamento
const trainingLessonSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  order: z.number().min(0, 'Ordem deve ser um número positivo'),
  duration: z.number().optional(),
});

export async function createTrainingModule(formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem criar módulos de treinamento.');
    }

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      order: parseInt(formData.get('order') as string),
    };

    const validatedData = trainingModuleSchema.parse(data);

    const module = await TrainingService.createTrainingModule(
      currentUser.tenantId,
      validatedData
    );

    revalidatePath('/training');
    revalidatePath('/training/manage');

    return { success: true, module };
  } catch (error) {
    console.error('Erro ao criar módulo de treinamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function updateTrainingModule(moduleId: string, formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem atualizar módulos de treinamento.');
    }

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      order: parseInt(formData.get('order') as string),
      isActive: formData.get('isActive') === 'true',
    };

    const validatedData = trainingModuleSchema.partial().parse(data);

    const module = await TrainingService.updateTrainingModule(
      moduleId,
      currentUser.tenantId,
      validatedData
    );

    revalidatePath('/training');
    revalidatePath('/training/manage');

    return { success: true, module };
  } catch (error) {
    console.error('Erro ao atualizar módulo de treinamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function deleteTrainingModule(moduleId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem deletar módulos de treinamento.');
    }

    await TrainingService.deleteTrainingModule(moduleId, currentUser.tenantId);

    revalidatePath('/training');
    revalidatePath('/training/manage');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar módulo de treinamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function createTrainingLesson(moduleId: string, formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem criar lições de treinamento.');
    }

    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      order: parseInt(formData.get('order') as string),
      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined,
    };

    const validatedData = trainingLessonSchema.parse(data);

    const lesson = await TrainingService.createTrainingLesson(moduleId, validatedData);

    revalidatePath('/training');
    revalidatePath('/training/manage');

    return { success: true, lesson };
  } catch (error) {
    console.error('Erro ao criar lição de treinamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function updateTrainingLesson(lessonId: string, formData: FormData) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem atualizar lições de treinamento.');
    }

    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      order: parseInt(formData.get('order') as string),
      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined,
      isCompleted: formData.get('isCompleted') === 'true',
    };

    const validatedData = trainingLessonSchema.partial().parse(data);

    const lesson = await TrainingService.updateTrainingLesson(lessonId, validatedData);

    revalidatePath('/training');
    revalidatePath('/training/manage');

    return { success: true, lesson };
  } catch (error) {
    console.error('Erro ao atualizar lição de treinamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function deleteTrainingLesson(lessonId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem deletar lições de treinamento.');
    }

    await TrainingService.deleteTrainingLesson(lessonId);

    revalidatePath('/training');
    revalidatePath('/training/manage');

    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar lição de treinamento:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function markLessonAsCompleted(lessonId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    const lesson = await TrainingService.updateTrainingLesson(lessonId, {
      isCompleted: true,
    });

    revalidatePath('/training');

    return { success: true, lesson };
  } catch (error) {
    console.error('Erro ao marcar lição como concluída:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

export async function markLessonAsIncomplete(lessonId: string) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    const lesson = await TrainingService.updateTrainingLesson(lessonId, {
      isCompleted: false,
    });

    revalidatePath('/training');

    return { success: true, lesson };
  } catch (error) {
    console.error('Erro ao marcar lição como incompleta:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

// Função upsert para módulos (criar ou atualizar)
export async function upsertTrainingModule(data: { id?: string; title: string; description?: string }) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem gerenciar módulos de treinamento.');
    }

    if (data.id) {
      // Atualizar módulo existente
      const module = await TrainingService.updateTrainingModule(
        data.id,
        currentUser.tenantId,
        {
          title: data.title,
          description: data.description,
        }
      );
      
      revalidatePath('/training');
      revalidatePath('/training/manage');
      
      return { success: true, message: 'Módulo atualizado com sucesso', module };
    } else {
      // Criar novo módulo
      const maxOrder = await TrainingService.getMaxModuleOrder(currentUser.tenantId);
      const module = await TrainingService.createTrainingModule(
        currentUser.tenantId,
        {
          title: data.title,
          description: data.description || '',
          order: maxOrder + 1,
        }
      );
      
      revalidatePath('/training');
      revalidatePath('/training/manage');
      
      return { success: true, message: 'Módulo criado com sucesso', module };
    }
  } catch (error) {
    console.error('Erro ao salvar módulo de treinamento:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}

// Função upsert para lições (criar ou atualizar)
export async function upsertTrainingLesson(data: { 
  id?: string; 
  moduleId: string; 
  title: string; 
  content: string; 
  duration: string;
  videoUrl: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin') {
      throw new Error('Acesso negado. Apenas administradores podem gerenciar lições de treinamento.');
    }

    if (data.id) {
      // Atualizar lição existente
      const lesson = await TrainingService.updateTrainingLesson(data.id, {
        title: data.title,
        content: data.content,
        duration: parseInt(data.duration) || 0,
      });
      
      revalidatePath('/training');
      revalidatePath('/training/manage');
      
      return { success: true, message: 'Lição atualizada com sucesso', lesson };
    } else {
      // Criar nova lição
      const maxOrder = await TrainingService.getMaxLessonOrder(data.moduleId);
      const lesson = await TrainingService.createTrainingLesson(data.moduleId, {
        title: data.title,
        content: data.content,
        order: maxOrder + 1,
        duration: parseInt(data.duration) || 0,
      });
      
      revalidatePath('/training');
      revalidatePath('/training/manage');
      
      return { success: true, message: 'Lição criada com sucesso', lesson };
    }
  } catch (error) {
    console.error('Erro ao salvar lição de treinamento:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}
