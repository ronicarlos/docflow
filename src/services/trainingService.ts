import { prisma } from '@/lib/prisma';
import type { TrainingGuideModule, TrainingGuideLesson } from '@/types';

export class TrainingService {
  // Buscar todos os módulos de treinamento com suas lições
  static async getTrainingModules(tenantId: string): Promise<TrainingGuideModule[]> {
    try {
      const modules = await prisma.trainingGuideModule.findMany({
        where: {
          tenantId,
          isActive: true,
        },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      });

      return modules.map(module => ({
        id: module.id,
        title: module.title,
        description: module.description || '',
        order: module.order,
        isActive: module.isActive,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          order: lesson.order,
          duration: lesson.duration || 0,
          isCompleted: lesson.isCompleted,
          moduleId: lesson.moduleId,
          // Campos adicionais para compatibilidade com o componente
          label: lesson.title,
          href: `/training/lesson/${lesson.id}`,
          aiTip: `Complete esta lição para avançar no módulo ${module.title}`,
        })),
      }));
    } catch (error) {
      console.error('Erro ao buscar módulos de treinamento:', error);
      throw new Error('Falha ao carregar módulos de treinamento');
    }
  }

  // Buscar um módulo específico
  static async getTrainingModule(moduleId: string, tenantId: string): Promise<TrainingGuideModule | null> {
    try {
      const module = await prisma.trainingGuideModule.findFirst({
        where: {
          id: moduleId,
          tenantId,
          isActive: true,
        },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      });

      if (!module) return null;

      return {
        id: module.id,
        title: module.title,
        description: module.description || '',
        order: module.order,
        isActive: module.isActive,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          order: lesson.order,
          duration: lesson.duration || 0,
          isCompleted: lesson.isCompleted,
          moduleId: lesson.moduleId,
          label: lesson.title,
          href: `/training/lesson/${lesson.id}`,
          aiTip: `Complete esta lição para avançar no módulo ${module.title}`,
        })),
      };
    } catch (error) {
      console.error('Erro ao buscar módulo de treinamento:', error);
      throw new Error('Falha ao carregar módulo de treinamento');
    }
  }

  // Buscar uma lição específica
  static async getTrainingLesson(lessonId: string): Promise<TrainingGuideLesson | null> {
    try {
      const lesson = await prisma.trainingGuideLesson.findUnique({
        where: { id: lessonId },
        include: {
          module: true,
        },
      });

      if (!lesson) return null;

      return {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
        duration: lesson.duration || 0,
        isCompleted: lesson.isCompleted,
        moduleId: lesson.moduleId,
        label: lesson.title,
        href: `/training/lesson/${lesson.id}`,
        aiTip: `Complete esta lição para avançar no módulo ${lesson.module.title}`,
      };
    } catch (error) {
      console.error('Erro ao buscar lição de treinamento:', error);
      throw new Error('Falha ao carregar lição de treinamento');
    }
  }

  // Criar um novo módulo de treinamento
  static async createTrainingModule(
    tenantId: string,
    data: {
      title: string;
      description?: string;
      order: number;
    }
  ): Promise<TrainingGuideModule> {
    try {
      const module = await prisma.trainingGuideModule.create({
        data: {
          ...data,
          tenantId,
        },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return {
        id: module.id,
        title: module.title,
        description: module.description || '',
        order: module.order,
        isActive: module.isActive,
        lessons: [],
      };
    } catch (error) {
      console.error('Erro ao criar módulo de treinamento:', error);
      throw new Error('Falha ao criar módulo de treinamento');
    }
  }

  // Criar uma nova lição
  static async createTrainingLesson(
    moduleId: string,
    data: {
      title: string;
      content: string;
      order: number;
      duration?: number;
    }
  ): Promise<TrainingGuideLesson> {
    try {
      const lesson = await prisma.trainingGuideLesson.create({
        data: {
          ...data,
          moduleId,
        },
        include: {
          module: true,
        },
      });

      return {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
        duration: lesson.duration || 0,
        isCompleted: lesson.isCompleted,
        moduleId: lesson.moduleId,
        label: lesson.title,
        href: `/training/lesson/${lesson.id}`,
        aiTip: `Complete esta lição para avançar no módulo ${lesson.module.title}`,
      };
    } catch (error) {
      console.error('Erro ao criar lição de treinamento:', error);
      throw new Error('Falha ao criar lição de treinamento');
    }
  }

  // Atualizar um módulo
  static async updateTrainingModule(
    moduleId: string,
    tenantId: string,
    data: {
      title?: string;
      description?: string;
      order?: number;
      isActive?: boolean;
    }
  ): Promise<TrainingGuideModule> {
    try {
      const module = await prisma.trainingGuideModule.update({
        where: {
          id: moduleId,
          tenantId,
        },
        data,
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
      });

      return {
        id: module.id,
        title: module.title,
        description: module.description || '',
        order: module.order,
        isActive: module.isActive,
        lessons: module.lessons.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          content: lesson.content,
          order: lesson.order,
          duration: lesson.duration || 0,
          isCompleted: lesson.isCompleted,
          moduleId: lesson.moduleId,
          label: lesson.title,
          href: `/training/lesson/${lesson.id}`,
          aiTip: `Complete esta lição para avançar no módulo ${module.title}`,
        })),
      };
    } catch (error) {
      console.error('Erro ao atualizar módulo de treinamento:', error);
      throw new Error('Falha ao atualizar módulo de treinamento');
    }
  }

  // Atualizar uma lição
  static async updateTrainingLesson(
    lessonId: string,
    data: {
      title?: string;
      content?: string;
      order?: number;
      duration?: number;
      isCompleted?: boolean;
    }
  ): Promise<TrainingGuideLesson> {
    try {
      const lesson = await prisma.trainingGuideLesson.update({
        where: { id: lessonId },
        data,
        include: {
          module: true,
        },
      });

      return {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        order: lesson.order,
        duration: lesson.duration || 0,
        isCompleted: lesson.isCompleted,
        moduleId: lesson.moduleId,
        label: lesson.title,
        href: `/training/lesson/${lesson.id}`,
        aiTip: `Complete esta lição para avançar no módulo ${lesson.module.title}`,
      };
    } catch (error) {
      console.error('Erro ao atualizar lição de treinamento:', error);
      throw new Error('Falha ao atualizar lição de treinamento');
    }
  }

  // Deletar um módulo
  static async deleteTrainingModule(moduleId: string, tenantId: string): Promise<void> {
    try {
      await prisma.trainingGuideModule.delete({
        where: {
          id: moduleId,
          tenantId,
        },
      });
    } catch (error) {
      console.error('Erro ao deletar módulo de treinamento:', error);
      throw new Error('Falha ao deletar módulo de treinamento');
    }
  }

  // Deletar uma lição
  static async deleteTrainingLesson(lessonId: string): Promise<void> {
    try {
      await prisma.trainingGuideLesson.delete({
        where: { id: lessonId },
      });
    } catch (error) {
      console.error('Erro ao deletar lição de treinamento:', error);
      throw new Error('Falha ao deletar lição de treinamento');
    }
  }

  // Obter a ordem máxima dos módulos para um tenant
  static async getMaxModuleOrder(tenantId: string): Promise<number> {
    try {
      const result = await prisma.trainingGuideModule.aggregate({
        where: { tenantId },
        _max: { order: true },
      });
      
      return result._max.order || 0;
    } catch (error) {
      console.error('Erro ao obter ordem máxima dos módulos:', error);
      return 0;
    }
  }

  // Obter a ordem máxima das lições para um módulo
  static async getMaxLessonOrder(moduleId: string): Promise<number> {
    try {
      const result = await prisma.trainingGuideLesson.aggregate({
        where: { moduleId },
        _max: { order: true },
      });
      
      return result._max.order || 0;
    } catch (error) {
      console.error('Erro ao obter ordem máxima das lições:', error);
      return 0;
    }
  }
}