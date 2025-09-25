
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Edit, FileText, Link as LinkIcon, Milestone, Target, Warehouse, XSquare, BrainCircuit, FileSignature, MonitorSmartphone, PackageCheck, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface TaskItemProps {
  id: string;
  label: string;
  done?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ id, label, done = false }) => (
  <div className="flex items-start space-x-3">
    <div className="mt-1">
      {done ? <CheckSquare className="h-5 w-5 text-green-600" /> : <XSquare className="h-5 w-5 text-red-600" />}
    </div>
    <label htmlFor={id} className={`font-medium ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
      {label}
    </label>
  </div>
);

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
  <div className="space-y-4 rounded-lg border bg-card p-4">
    <h3 className="flex items-center gap-2 text-lg font-semibold text-primary">
      <Icon className="h-5 w-5" />
      {title}
    </h3>
    <div className="space-y-3 pl-4">{children}</div>
  </div>
);

export default function ProceduresRoadmapPage() {
    const router = useRouter();
  return (
    <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Milestone className="h-7 w-7 text-primary" />
            Roadmap: Módulo Gerador Inteligente de Procedimentos
          </CardTitle>
          <CardDescription>
            Acompanhamento do desenvolvimento e implementação das funcionalidades do módulo de SGQ.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section title="Etapa 1: Geração de Conteúdo e CRUD Base" icon={BrainCircuit}>
            <TaskItem id="gen-crud" label="Implementar CRUD base do Gerador de Procedimentos SGQ." done />
            <TaskItem id="gen-ia" label="Integrar IA ao Gerador de Procedimentos SGQ." done />
            <TaskItem id="gen-anexos" label="Permitir inserção de anexos (evidências)." done />
          </Section>

          <Section title="Etapa 2: Controle de Documentação" icon={FileText}>
             <TaskItem id="crud-headers" label="Permitir edição de responsáveis e aprovadores." done />
             <TaskItem id="crud-clone" label="Implementar função para duplicar procedimentos." done/>
             <TaskItem id="crud-pdf" label="Gerar e baixar PDF com layout padronizado." done />
          </Section>
          
           <Section title="Etapa 3: Gestão e Versionamento" icon={History}>
             <TaskItem id="int-list" label="Criar tela para listar, buscar e gerenciar todos os procedimentos." done/>
             <TaskItem id="int-group" label="Permitir agrupar procedimentos por área e filtrar por contrato." done/>
             <TaskItem id="crud-history" label="Manter histórico de versões automático (arquivamento)." done />
             <TaskItem id="crud-review-control" label="Implementar controle de revisões (status, ciclo de vida)." done />
           </Section>

          <Section title="Etapa 4: Próximos Passos (Futuro)" icon={FileSignature}>
            <TaskItem id="int-riscos" label="Cruzar dados com avaliação de riscos do ISOFlow." />
            <TaskItem id="int-pdca" label="Conectar com plano de auditoria e ciclo PDCA." />
          </Section>
          
           <Section title="Objetivo Final" icon={Target}>
            <TaskItem id="obj-reduzir" label="Reduzir em 90% o trabalho manual na elaboração de procedimentos." />
            <TaskItem id="obj-padronizar" label="Padronizar a gestão da qualidade entre os clientes." />
           </Section>

        </CardContent>
      </Card>
    </div>
  );
}
