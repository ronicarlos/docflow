
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft, UploadCloud, FileArchive } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ImportarProjetoPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      // Aqui você adicionaria a lógica para importar o projeto
      console.log("Importar Projeto:", selectedFile.name);
      toast({
        title: "Arquivo Enviado!",
        description: `O arquivo "${selectedFile.name}" foi submetido para importação.`,
      });
      setSelectedFile(null);
      // Reset file input if possible, or provide feedback
      const fileInput = document.getElementById('projectFile') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } else {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo para importar.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <Card className="w-full max-w-lg sm:max-w-xl rounded-xl shadow-2xl">
        <CardHeader className="p-6 sm:p-8 border-b border-border">
          <div className="flex items-center justify-center space-x-3">
            <UploadCloud className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primary text-center">
              Importar Projeto Existente
            </CardTitle>
          </div>
           <CardDescription className="text-center text-muted-foreground pt-2">
            Selecione um arquivo de projeto (.zip, .tar.gz) para importar.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectFile" className="text-foreground">Arquivo do Projeto</Label>
              <Input 
                id="projectFile" 
                type="file" 
                onChange={handleFileChange} 
                className="bg-input/50 focus:bg-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                accept=".zip,.tar.gz" 
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground pt-2">
                  Arquivo selecionado: {selectedFile.name}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="w-full sm:w-auto flex-grow shadow-md hover:shadow-lg transition-shadow">
                <FileArchive className="mr-2 h-4 w-4" />
                Importar Projeto
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
