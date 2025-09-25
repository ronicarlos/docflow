
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Rocket, UploadCloud } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";


export default function NovoProjetoPage() {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você adicionaria a lógica para criar o projeto
    console.log("Novo Projeto:", { projectName, projectDescription });
    toast({
      title: "Projeto Enviado!",
      description: `O projeto "${projectName}" foi submetido para criação.`,
    });
    setProjectName('');
    setProjectDescription('');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <Card className="w-full max-w-lg sm:max-w-xl rounded-xl shadow-2xl">
        <CardHeader className="p-6 sm:p-8 border-b border-border">
          <div className="flex items-center justify-center space-x-3">
            <Rocket className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary text-center">
              Iniciar Novo Projeto
            </CardTitle>
          </div>
          <CardDescription className="text-center text-muted-foreground pt-2">
            Preencha os detalhes abaixo para começar seu novo projeto.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-foreground">Nome do Projeto</Label>
              <Input 
                id="projectName" 
                placeholder="Ex: Meu Aplicativo Incrível" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required 
                className="bg-input/50 focus:bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription" className="text-foreground">Descrição do Projeto</Label>
              <Textarea 
                id="projectDescription" 
                placeholder="Descreva brevemente o seu projeto..." 
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="bg-input/50 focus:bg-input min-h-[100px]"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="w-full sm:w-auto flex-grow shadow-md hover:shadow-lg transition-shadow">
                <Rocket className="mr-2 h-4 w-4" />
                Criar Projeto
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Home
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
