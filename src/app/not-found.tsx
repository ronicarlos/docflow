import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center shadow-2xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            Página Não Encontrada
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              A página que você está tentando acessar não foi encontrada em nosso sistema.
            </p>
            <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
              <p className="font-medium mb-2">Possíveis motivos:</p>
              <ul className="text-left space-y-1">
                <li>• A página foi removida ou movida para outro local</li>
                <li>• O link pode estar incorreto ou desatualizado</li>
                <li>• Você pode não ter permissão para acessar este conteúdo</li>
                <li>• Pode ter ocorrido um erro temporário no sistema</li>
              </ul>
            </div>
          </div>
          
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Voltar para o Painel Principal
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
