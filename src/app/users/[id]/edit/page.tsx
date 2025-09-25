
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import * as disciplineService from '@/services/disciplineService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import * as userService from '@/services/userService';
import { EditUserForm } from '@/components/users/edit-user-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Página de edição de usuários - Server Component
 * Carrega todos os dados necessários no servidor para otimizar o carregamento
 */
export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  
  // Verificar autenticação
  const currentUser = await getCurrentUser();
  if (!currentUser || !currentUser.tenantId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Acesso não autorizado. Faça login para continuar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tenantId = currentUser.tenantId;

  // Verificar permissões para editar usuários
  const canEditUsers = ['Admin', 'SuperAdmin'].includes(currentUser.role) || 
                      currentUser.canEditRecords ||
                      currentUser.id === id; // Usuário pode editar a si mesmo

  if (!canEditUsers) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Você não tem permissão para editar usuários.
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" asChild>
                <Link href="/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Lista
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  try {
    // Buscar dados em paralelo para otimizar o carregamento
    const [user, disciplines, contracts] = await Promise.all([
      userService.findUserById(id),
      disciplineService.findAll(tenantId),
      ContractDrizzleService.findAll(tenantId)
    ]);

    // Verificar se o usuário existe
    if (!user) {
      notFound();
    }

    // Verificar se o usuário pertence ao mesmo tenant (segurança adicional)
    if (user.tenantId !== tenantId) {
      return (
        <div className="container mx-auto py-8 px-4">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                Usuário não encontrado ou você não tem acesso a ele.
              </p>
              <div className="flex justify-center mt-4">
                <Button variant="outline" asChild>
                  <Link href="/users">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Lista
                  </Link>
                </Button>
              </div>
            </CardContent>
        </Card>
      </div>
      );
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Lista
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Editar Usuário</CardTitle>
            <CardDescription>
              Atualize as informações do usuário {user.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EditUserForm 
              userId={id}
              tenantId={tenantId}
              contracts={contracts}
              disciplines={disciplines}
            />
          </CardContent>
        </Card>
      </div>
    );

  } catch (error) {
    console.error('Erro ao carregar dados para edição do usuário:', error);
    
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Erro ao carregar os dados do usuário. Tente novamente.
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline" asChild>
                <Link href="/users">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Lista
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}
