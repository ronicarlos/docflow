import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ProfileForm } from '@/components/profile/profile-form';
import { 
  User, 
  Mail, 
  Building2, 
  Shield, 
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  Clock,
  Lock
} from 'lucide-react';
import { ChangePasswordForm } from '@/components/settings/change-password-form';
  
  // Novo: buscar nome do tenant para exibir nome da empresa
  import { findTenantById } from '@/services/tenantService';

export default async function ProfilePage() {
  // Verificar autenticação
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  // Novo: obter detalhes do tenant (empresa) para exibir nome atualizado
  const tenantDetails = await findTenantById(currentUser.tenantId);
  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para obter cor da role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Função para traduzir role
  const translateRole = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'manager':
        return 'Gerente';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações da conta.
          </p>
        </div>

        {/* Card Principal do Perfil */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage 
                  src={currentUser.avatarUrl || undefined} 
                  alt={currentUser.name} 
                />
                <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                  {getInitials(currentUser.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-2xl">{currentUser.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={getRoleColor(currentUser.role)}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {translateRole(currentUser.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{currentUser.email}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="mr-2 h-4 w-4" />
                    Organização
                  </div>
                  <p className="font-medium">
                    {tenantDetails?.name ?? currentUser.tenantId}
                    {tenantDetails?.name ? (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">({currentUser.tenantId})</span>
                    ) : null}
                  </p>
                </div>

                {currentUser.area && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      Área Principal
                    </div>
                    <p className="font-medium">{currentUser.area}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Membro desde
                  </div>
                  <p className="font-medium">
                    {currentUser.createdAt ? formatDate(currentUser.createdAt.toString()) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Permissões */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Permissões do Sistema
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { key: 'canCreateRecords', label: 'Criar Registros', value: currentUser.canCreateRecords },
                  { key: 'canEditRecords', label: 'Editar Registros', value: currentUser.canEditRecords },
                  { key: 'canDeleteRecords', label: 'Excluir Registros', value: currentUser.canDeleteRecords },
                  { key: 'canDownloadDocuments', label: 'Baixar Documentos', value: currentUser.canDownloadDocuments },
                  { key: 'canApproveDocuments', label: 'Aprovar Documentos', value: currentUser.canApproveDocuments },
                  { key: 'canPrintDocuments', label: 'Imprimir Documentos', value: currentUser.canPrintDocuments }
                ].map((permission) => (
                  <div 
                    key={permission.key}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-sm font-medium">{permission.label}</span>
                    {permission.value ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Detalhes da Conta */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Detalhes da Conta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">ID do Usuário:</span>
                  <p className="font-mono text-xs mt-1 p-2 bg-muted rounded">
                    {currentUser.id}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Última Atualização:</span>
                  <p className="mt-1">
                    {currentUser.updatedAt ? formatDate(currentUser.updatedAt.toString()) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Formulário de Edição */}
        <Card>
          <CardHeader>
            <CardTitle>Editar Informações</CardTitle>
            <CardDescription>
              Atualize suas informações pessoais quando necessário.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm currentUser={currentUser} />
          </CardContent>
        </Card>

        {/* Nova Seção: Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Segurança da Conta
            </CardTitle>
            <CardDescription>
              Gerencie a segurança da sua conta alterando sua senha.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}