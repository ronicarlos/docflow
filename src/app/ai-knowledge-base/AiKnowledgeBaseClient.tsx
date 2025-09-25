"use client";

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { DatabaseZap, Save, Loader2 } from 'lucide-react';
import { saveKnowledgeBase } from '@/actions/knowledgeBaseActions';

interface AiKnowledgeBaseClientProps {
  initialContent: string;
}

export default function AiKnowledgeBaseClient({ initialContent }: AiKnowledgeBaseClientProps) {
  const { toast } = useToast();
  const [knowledgeBase, setKnowledgeBase] = useState(initialContent);
  const [isSaving, startSavingTransition] = useTransition();

  const handleSave = () => {
    startSavingTransition(async () => {
      try {
        await saveKnowledgeBase(knowledgeBase);
        toast({
          title: "Base de Conhecimento Atualizada!",
          description: "A IA agora usará as novas informações fornecidas.",
        });
      } catch (error) {
        console.error('Erro ao salvar base de conhecimento:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar a base de conhecimento. Tente novamente.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-4xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <DatabaseZap className="h-8 w-8 text-primary" />
            Gerenciar Base de Conhecimento da IA
          </CardTitle>
          <CardDescription>
            Edite o manual técnico abaixo para ensinar a IA. Você pode usar a sintaxe Markdown para incluir imagens (`![desc](url)`) e links (`[texto](url)`), enriquecendo o material. As alterações são salvas e aplicadas imediatamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={knowledgeBase}
            onChange={(e) => setKnowledgeBase(e.target.value)}
            placeholder="Insira aqui todo o conhecimento técnico e manual do produto..."
            className="min-h-[60vh] font-mono text-sm leading-relaxed"
            disabled={isSaving}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}