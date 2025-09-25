
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import type { ITrainingGuideModule, User } from '@/types';
import { Rocket, Lightbulb, HelpCircle, BookCopy } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface TrainingGuideClientProps {
  initialModules: ITrainingGuideModule[];
  initialCurrentUser?: User;
}

type CompletionStatus = {
  [lessonId: string]: boolean;
};

export default function TrainingGuideClient({ initialModules }: TrainingGuideClientProps) {
  const { toast } = useToast();
  const [completionStatus, setCompletionStatus] = React.useState<CompletionStatus>({});
  const [modules] = React.useState<ITrainingGuideModule[]>(initialModules);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // This effect runs only on the client, so it's safe to use localStorage
    setMounted(true);
    const savedProgress = localStorage.getItem('docflow_training_guide_progress');
    if (savedProgress) {
      try {
        setCompletionStatus(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Failed to parse training progress from localStorage", e);
      }
    }
  }, []);

  const totalLessons = React.useMemo(() => modules.flatMap(m => m.lessons).length, [modules]);
  const completedLessons = React.useMemo(() => Object.values(completionStatus).filter(Boolean).length, [completionStatus]);
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const handleToggleCompletion = (lessonId: string) => {
    const newStatus = { ...completionStatus, [lessonId]: !completionStatus[lessonId] };
    setCompletionStatus(newStatus);
    if (typeof window !== 'undefined') {
      localStorage.setItem('docflow_training_guide_progress', JSON.stringify(newStatus));
      if(newStatus[lessonId]) {
        toast({ title: "Tarefa Concluída!", description: "Ótimo trabalho! Continue progredindo." });
      }
    }
  };

  const renderSkeleton = () => (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-8 w-full" /></CardContent>
          </Card>
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i}><CardHeader><Skeleton className="h-10 w-full" /></CardHeader></Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );

  if (!mounted) {
    return renderSkeleton();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Rocket className="h-8 w-8 text-primary" />
                Instrutor Virtual DocFlow
              </CardTitle>
              <CardDescription>
                Siga estas fases para construir seu conhecimento no Sistema de Gestão de Documentos passo a passo.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progresso Geral da Implantação</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progressPercentage} className="w-full h-3 mb-2" />
              <p className="text-sm text-muted-foreground text-center">{completedLessons} de {totalLessons} tarefas concluídas ({progressPercentage.toFixed(0)}%)</p>
            </CardContent>
          </Card>

          <Accordion type="multiple" defaultValue={modules.length > 0 ? [modules[0].id] : []} className="w-full space-y-4">
            {modules.map((module) => {
              const moduleTotalLessons = module.lessons.length;
              const moduleCompletedLessons = module.lessons.filter(l => completionStatus[l.id]).length;
              const moduleProgress = moduleTotalLessons > 0 ? (moduleCompletedLessons / moduleTotalLessons) * 100 : 0;

              return (
                <Card key={module.id} className="overflow-hidden">
                  <AccordionItem value={module.id} className="border-none">
                    <AccordionTrigger className="p-4 bg-muted/50 hover:bg-muted/70 hover:no-underline flex-wrap">
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-lg text-primary flex items-center gap-2"><BookCopy className="h-5 w-5" />{module.title}</p>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-sm font-bold text-primary">{moduleProgress.toFixed(0)}%</span>
                        <Progress value={moduleProgress} className="w-24 h-2" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-2">
                      <div className="space-y-3 pl-2">
                        {module.lessons.map(lesson => (
                          <div key={lesson.id} className="p-3 border-l-2 border-dashed border-primary/30 space-y-2">
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                id={lesson.id}
                                checked={!!completionStatus[lesson.id]}
                                onCheckedChange={() => handleToggleCompletion(lesson.id)}
                              />
                              <label htmlFor={lesson.id} className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                <Link href={lesson.href} className="hover:underline" onClick={(e) => {e.stopPropagation()}}>
                                  {lesson.label}
                                </Link>
                              </label>
                            </div>
                            <div className="pl-8 flex items-start gap-2 text-sm text-muted-foreground">
                              <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0"/>
                              <span><strong className="text-foreground">Dica da IA:</strong> {lesson.aiTip}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              );
            })}
          </Accordion>
        </div>

        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
          <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
            <CardHeader>
                <CardTitle className="text-blue-800 dark:text-blue-300">Por que aprender em fases?</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700 dark:text-blue-400 text-sm">
                <p>O DocFlow é uma ferramenta poderosa. Aprender em fases ajuda a construir um conhecimento sólido, do básico ao avançado, garantindo que você aproveite ao máximo cada funcionalidade e mantenha seu sistema organizado e em conformidade desde o início.</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="items-center text-center">
                <CardTitle>Precisa de Ajuda?</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-sm text-muted-foreground mb-4">Se tiver qualquer dúvida durante o treinamento, nosso assistente de IA está pronto para ajudar!</p>
                 <Button onClick={() => window.dispatchEvent(new CustomEvent('open-ai-assistant'))}>
                    <HelpCircle className="mr-2 h-4 w-4"/> Fale com o Assistente
                 </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
