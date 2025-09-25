
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, RefreshCw, Tags } from "lucide-react";
import Link from "next/link";
import * as disciplineService from '@/services/disciplineService';
import DisciplinesList from '@/components/disciplines/disciplines-list';
import { getCurrentUser } from '@/lib/auth';

// Esta é agora uma página de servidor (Server Component)
export default async function DisciplinesPage() {
  const user = await getCurrentUser();
  
  if (!user || !user.tenantId) {
    return (
      <div className="container mx-auto py-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              <Tags className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-semibold">Acesso não autorizado</p>
              <p>Você precisa estar autenticado para visualizar as disciplinas.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const disciplines = await disciplineService.findAll(user.tenantId);

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Tags className="w-7 h-7 text-primary" />
              Gerenciamento de Disciplinas (Áreas)
            </CardTitle>
            <CardDescription>Visualize e gerencie as disciplinas/áreas da sua organização.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/disciplines">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                </Link>
            </Button>
            <Button asChild>
                <Link href="/disciplines/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Disciplina
                </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* O componente cliente agora lida com a renderização da lista e ações */}
          <DisciplinesList disciplines={disciplines} />
        </CardContent>
      </Card>
    </div>
  );
}
