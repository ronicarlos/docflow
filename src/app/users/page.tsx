
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MoreHorizontal, PlusCircle, UserCog, RefreshCw, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import * as userService from '@/services/userService';
import type { User } from '@/types';
import UserActions from "@/components/users/user-actions";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";

const getRoleVariant = (role: User["role"]) => {
  switch (role) {
    case "SuperAdmin":
    case "Admin":
      return "default";
    case "Approver":
      return "secondary";
    case "Editor":
      return "outline";
    case "Viewer":
      return "destructive";
    default:
      return "outline";
  }
};

const getRoleLabel = (role: User["role"]): string => {
  switch (role) {
      case "Admin": return "Administrador";
      case "SuperAdmin": return "Super Admin";
      case "Approver": return "Aprovador";
      case "Editor": return "Editor";
      case "Viewer": return "Visualizador";
      default: return role;
  }
};

const PermissionIndicator: React.FC<{ allowed?: boolean }> = ({ allowed }) => {
  return allowed ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-red-500" />;
};

// Esta é agora uma página de servidor (Server Component)
export default async function UsersPage() {
  const user = await getCurrentUser();
  
  if (!user || !user.tenantId) {
    return (
      <div className="container mx-auto py-8">
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Acesso não autorizado. Faça login para continuar.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tenantId = user.tenantId;
  // Busca os dados diretamente no servidor
  const users = await userService.findAllUsers(tenantId);
  
  // A lógica de permissão do usuário atual
  const canCurrentUserManageUsers = user.canCreateRecords || user.role === 'Admin' || user.role === 'SuperAdmin';

  return (
    <>
      <div className="container mx-auto py-8">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <UserCog className="w-7 h-7 text-primary" />
                Gerenciamento de Usuários
              </CardTitle>
              <CardDescription>Visualize e gerencie os usuários do inquilino atual, suas permissões e áreas de atuação.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/users">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar
                </Link>
              </Button>
              {canCurrentUserManageUsers && (
                <Button asChild>
                  <Link href="/users/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {users.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Área Principal</TableHead>
                      <TableHead>Nível de Acesso</TableHead>
                      <TableHead>Tenant ID</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Adicionar Reg.</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Editar Reg.</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Excluir Reg.</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Download Docs.</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Aprovar Docs.</TableHead>
                      <TableHead className="text-center whitespace-nowrap">Imprimir Docs.</TableHead>
                      {canCurrentUserManageUsers && <TableHead className="text-right">Ações</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.email}</TableCell>
                        <TableCell className="whitespace-nowrap">{user.area}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleVariant(user.role)} className="whitespace-nowrap">{getRoleLabel(user.role)}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{user.tenantId}</TableCell>
                        <TableCell className="text-center"><PermissionIndicator allowed={user.canCreateRecords} /></TableCell>
                        <TableCell className="text-center"><PermissionIndicator allowed={user.canEditRecords} /></TableCell>
                        <TableCell className="text-center"><PermissionIndicator allowed={user.canDeleteRecords} /></TableCell>
                        <TableCell className="text-center"><PermissionIndicator allowed={user.canDownloadDocuments} /></TableCell>
                        <TableCell className="text-center"><PermissionIndicator allowed={user.canApproveDocuments} /></TableCell>
                        <TableCell className="text-center"><PermissionIndicator allowed={user.canPrintDocuments} /></TableCell>
                        {canCurrentUserManageUsers && (
                          <TableCell className="text-right">
                             {/* Componente Cliente para ações interativas */}
                            <UserActions user={user} />
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <UserCog className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-semibold">Nenhum usuário encontrado.</p>
                <p>Comece adicionando usuários ao sistema.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
