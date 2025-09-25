
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileWarning } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RncControlPage() {
  const { toast } = useToast();

  const handleNewRnc = () => {
    toast({
      title: "Funcionalidade em Desenvolvimento",
      description: "A criação de novos Relatórios de Não Conformidade será implementada em breve.",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-2xl">
                    <FileWarning className="w-7 h-7 text-primary" />
                    Controle de RNC (Relatórios de Não Conformidade)
                </CardTitle>
                <CardDescription>Gerencie o ciclo de vida das não conformidades, desde o registro até a verificação da eficácia das ações.</CardDescription>
            </div>
             <Button onClick={handleNewRnc}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nova RNC
            </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20 text-muted-foreground">
            <FileWarning className="mx-auto h-12 w-12 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum Relatório de Não Conformidade Encontrado</h3>
            <p className="mt-2 text-sm">
              O módulo de RNC está em desenvolvimento. Em breve, você poderá registrar e gerenciar suas não conformidades aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
