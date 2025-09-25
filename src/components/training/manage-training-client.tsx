
"use client";

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import type { TrainingModule, TrainingLesson } from '@/types';
import { Settings, PlusCircle, BookCopy, Film, Trash2, Edit, Loader2 } from 'lucide-react';
import { upsertTrainingModule, deleteTrainingModule, upsertTrainingLesson, deleteTrainingLesson } from '@/actions/trainingActions';
import { useRouter } from 'next/navigation';

// Schemas for validation of forms
const lessonSchema = z.object({
  moduleId: z.string(), // Kept for associating, not shown in form
  title: z.string().min(3, "O título da aula é obrigatório."),
  duration: z.string().min(2, "A duração é obrigatória (ex: 5 min)."),
  videoUrl: z.string().url("Por favor, insira uma URL de vídeo válida."),
  content: z.string().min(10, "A descrição da aula é obrigatória."),
});
const moduleSchema = z.object({
  title: z.string().min(3, "O título do módulo é obrigatório."),
});

type LessonFormData = z.infer<typeof lessonSchema>;
type ModuleFormData = z.infer<typeof moduleSchema>;

interface ManageTrainingClientProps {
  initialModules: TrainingModule[];
}

export default function ManageTrainingClient({ initialModules }: ManageTrainingClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSaving, startSaving] = React.useTransition();
  const [modules, setModules] = React.useState<TrainingModule[]>(initialModules);
  
  React.useEffect(() => {
    setModules(initialModules);
  }, [initialModules]);

  // State for modals and dialogs
  const [isModuleModalOpen, setIsModuleModalOpen] = React.useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = React.useState(false);
  const [editingModule, setEditingModule] = React.useState<TrainingModule | null>(null);
  const [editingLesson, setEditingLesson] = React.useState<{ lesson: TrainingLesson; moduleId: string } | null>(null);
  const [currentModuleIdForNewLesson, setCurrentModuleIdForNewLesson] = React.useState<string | null>(null);
  const [moduleToDelete, setModuleToDelete] = React.useState<TrainingModule | null>(null);
  const [lessonToDelete, setLessonToDelete] = React.useState<{ lessonId: string; moduleId: string; lessonTitle: string } | null>(null);

  const { control: moduleControl, handleSubmit: handleModuleSubmit, reset: resetModuleForm, setValue: setModuleValue } = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: { title: '' },
  });

  const { control: lessonControl, handleSubmit: handleLessonSubmit, reset: resetLessonForm, setValue: setLessonValue } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { moduleId: '', title: '', duration: '', videoUrl: '', content: '' },
  });

  const refreshData = () => {
    // This function will be called to refresh the Server Component's data
    router.refresh();
  };
  
  // --- Form Submission Handlers ---
  const onModuleSubmit = (data: ModuleFormData) => {
    startSaving(async () => {
      const result = await upsertTrainingModule({ id: editingModule?.id, ...data });
      if (result.success) {
        toast({ title: editingModule ? "Módulo Atualizado" : "Módulo Adicionado", description: result.message });
        setIsModuleModalOpen(false);
        setEditingModule(null);
        refreshData();
      } else {
        toast({ variant: 'destructive', title: "Erro", description: result.message });
      }
    });
  };
  
  const onLessonSubmit = (data: LessonFormData) => {
    startSaving(async () => {
      const { moduleId: _, ...lessonData } = data; // Remove moduleId from data to avoid duplication
      const result = await upsertTrainingLesson({
        id: editingLesson?.lesson.id,
        moduleId: currentModuleIdForNewLesson || editingLesson!.moduleId,
        ...lessonData,
      });
      if (result.success) {
        toast({ title: editingLesson ? "Aula Atualizada" : "Aula Adicionada", description: result.message });
        setIsLessonModalOpen(false);
        setEditingLesson(null);
        setCurrentModuleIdForNewLesson(null);
        refreshData();
      } else {
        toast({ variant: 'destructive', title: "Erro", description: result.message });
      }
    });
  };

  // --- Modal Opening Handlers ---
  const openNewModuleModal = () => {
    resetModuleForm({ title: '' });
    setEditingModule(null);
    setIsModuleModalOpen(true);
  };

  const openEditModuleModal = (module: TrainingModule) => {
    setEditingModule(module);
    setModuleValue('title', module.title);
    setIsModuleModalOpen(true);
  };
  
  const openNewLessonModal = (moduleId: string) => {
    resetLessonForm({ moduleId: moduleId, title: '', duration: '', videoUrl: '', content: '' });
    setEditingLesson(null);
    setCurrentModuleIdForNewLesson(moduleId);
    setIsLessonModalOpen(true);
  };
  
  const openEditLessonModal = (lesson: TrainingLesson, moduleId: string) => {
    setEditingLesson({ lesson, moduleId });
    setLessonValue('moduleId', moduleId);
    setLessonValue('title', lesson.title);
    setLessonValue('duration', lesson.duration);
    setLessonValue('videoUrl', lesson.videoUrl);
    setLessonValue('content', lesson.content);
    setIsLessonModalOpen(true);
  };
  
  // --- Deletion Handlers ---
  const confirmDeleteModule = () => {
    if (!moduleToDelete) return;
    startSaving(async () => {
      const result = await deleteTrainingModule(moduleToDelete.id);
      if (result.success) {
        toast({ title: "Módulo Excluído", description: `O módulo "${moduleToDelete.title}" foi removido.`, variant: "destructive" });
        refreshData();
      } else {
        toast({ title: "Erro ao excluir", description: result.error || "Erro desconhecido", variant: "destructive" });
      }
      setModuleToDelete(null);
    });
  };
  
  const confirmDeleteLesson = () => {
    if (!lessonToDelete) return;
    startSaving(async () => {
      const result = await deleteTrainingLesson(lessonToDelete.lessonId);
      if (result.success) {
        toast({ title: "Aula Excluída", description: `A aula "${lessonToDelete.lessonTitle}" foi removida.`, variant: "destructive" });
        refreshData();
      } else {
        toast({ title: "Erro ao excluir", description: result.error || "Erro desconhecido", variant: "destructive" });
      }
      setLessonToDelete(null);
    });
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Settings className="h-7 w-7 text-primary" /> Gerenciar Conteúdo de Treinamento
              </CardTitle>
              <CardDescription> Adicione, edite ou remova módulos e aulas de treinamento para os usuários. </CardDescription>
            </div>
            <Button onClick={openNewModuleModal}><PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Módulo</Button>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full space-y-4">
              {modules.map((module) => (
                <Card key={module.id} className="bg-muted/30">
                  <AccordionItem value={module.id} className="border-none">
                    <div className="flex w-full items-center justify-between hover:bg-accent/50 rounded-lg group">
                      <AccordionTrigger className="flex-1 px-4 py-3 text-lg font-semibold hover:no-underline group-hover:no-underline text-left">
                        <span className="flex items-center gap-2"><BookCopy className="h-5 w-5 text-primary" />{module.title}</span>
                      </AccordionTrigger>
                      <div className="flex items-center gap-2 pr-4">
                        <Button variant="outline" size="sm" onClick={() => openNewLessonModal(module.id)}><PlusCircle className="mr-2 h-4 w-4"/>Adicionar Aula</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModuleModal(module)}><Edit className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setModuleToDelete(module)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                    <AccordionContent className="px-4 pb-4">
                      <div className="space-y-3 pl-6 border-l-2 border-primary/20">
                        {module.lessons.length > 0 ? module.lessons.map(lesson => (
                          <div key={lesson.id} className="p-3 border rounded-md bg-card flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium flex items-center gap-2"><Film className="h-4 w-4"/>{lesson.title}</p>
                              <p className="text-xs text-muted-foreground">{lesson.content}</p>
                              <p className="text-xs text-muted-foreground">Duração: {lesson.duration}</p>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditLessonModal(lesson, module.id)}><Edit className="h-4 w-4"/></Button>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setLessonToDelete({ lessonId: lesson.id, moduleId: module.id, lessonTitle: lesson.title })}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">Nenhuma aula neste módulo. Clique em "Adicionar Aula" para começar.</p>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog para Criar/Editar Módulo */}
      <Dialog open={isModuleModalOpen} onOpenChange={(isOpen) => { setIsModuleModalOpen(isOpen); if (!isOpen) setEditingModule(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingModule ? 'Editar Módulo' : 'Criar Novo Módulo'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleModuleSubmit(onModuleSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="moduleTitle">Título do Módulo</Label>
              <Controller name="title" control={moduleControl} render={({ field }) => <Input id="moduleTitle" {...field} />} />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : 'Salvar'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Criar/Editar Aula */}
      <Dialog open={isLessonModalOpen} onOpenChange={(isOpen) => { setIsLessonModalOpen(isOpen); if (!isOpen) { setEditingLesson(null); setCurrentModuleIdForNewLesson(null); }}}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Editar Aula' : 'Adicionar Nova Aula'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLessonSubmit(onLessonSubmit)} className="space-y-4 py-4">
            <div><Label htmlFor="lessonTitle">Título da Aula *</Label><Controller name="title" control={lessonControl} render={({ field }) => <Input id="lessonTitle" {...field} />} /></div>
            <div><Label htmlFor="lessonDuration">Duração (ex: 5 min) *</Label><Controller name="duration" control={lessonControl} render={({ field }) => <Input id="lessonDuration" {...field} />} /></div>
            <div><Label htmlFor="lessonVideoUrl">URL do Vídeo *</Label><Controller name="videoUrl" control={lessonControl} render={({ field }) => <Input id="lessonVideoUrl" placeholder="https://youtube.com/watch?v=..." {...field} />} /></div>
            <div><Label htmlFor="lessonContent">Descrição da Aula *</Label><Controller name="content" control={lessonControl} render={({ field }) => <Textarea id="lessonContent" {...field} />} /></div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : 'Salvar Aula'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* AlertDialog para confirmar exclusão de Módulo */}
      <AlertDialog open={!!moduleToDelete} onOpenChange={() => setModuleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Módulo</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir o módulo "{moduleToDelete?.title}"? Todas as aulas contidas nele também serão removidas. Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteModule} disabled={isSaving} className="bg-destructive hover:bg-destructive/90">{isSaving ? <Loader2 className="animate-spin"/> : 'Confirmar Exclusão'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog para confirmar exclusão de Aula */}
      <AlertDialog open={!!lessonToDelete} onOpenChange={() => setLessonToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão de Aula</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir a aula "{lessonToDelete?.lessonTitle}"? Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLesson} disabled={isSaving} className="bg-destructive hover:bg-destructive/90">{isSaving ? <Loader2 className="animate-spin"/> : 'Confirmar Exclusão'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
