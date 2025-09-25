"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, Eye, EyeOff, FileText, Shield, Users, Mail, Lock } from 'lucide-react';
import { getSafeRedirectUrl, extractSafeRedirectParam } from '@/lib/redirect-utils';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Função para obter URL de redirecionamento seguro
  const getRedirectUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const safeRedirect = extractSafeRedirectParam(urlParams);
    return getSafeRedirectUrl(safeRedirect);
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Usuários de exemplo para desenvolvimento
  const exampleUsers = [
    { email: 'admin@docflow.com', name: 'Administrador DocFlow', role: 'Admin' },
    { email: 'ronicarlos@gmail.com', name: 'Roni Carlos', role: 'Admin' },
    { email: 'ronicarlos@makem.com.br', name: 'Ronicarlos Pereira', role: 'SuperAdmin' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica apenas
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const rawLogin = await response.text();
        let data: any;
        try {
          data = rawLogin ? JSON.parse(rawLogin) : {};
        } catch (parseError) {
          console.error('Erro ao fazer parse da resposta:', parseError);
          data = { message: 'Erro interno do servidor' };
        }

        if (response.ok) {
          toast({
            title: "Login realizado com sucesso",
            description: `Bem-vindo, ${data.user?.name || 'Usuário'}!`,
          });
          
          // Aguarda um pouco para mostrar o toast antes de redirecionar
          setTimeout(() => {
            router.push(getRedirectUrl());
            router.refresh();
          }, 1000);
        } else {
          // Tratamento específico de erros
          let errorMessage = "Credenciais inválidas.";
          
          if (response.status === 401) {
            errorMessage = "Email ou senha incorretos.";
          } else if (response.status === 404) {
            errorMessage = "Usuário não encontrado.";
          } else if (response.status === 500) {
            errorMessage = "Erro interno do servidor. Tente novamente.";
          } else if (data.message) {
            errorMessage = data.message;
          }

          toast({
            title: "Erro no login",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro de conexão:', error);
        toast({
          title: "Erro de conexão",
          description: "Não foi possível conectar ao servidor. Verifique sua conexão com a internet.",
          variant: "destructive",
        });
      }
    });
  };

  const fillExampleUser = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DocFlow</h1>
          <p className="text-gray-600">Sistema de Gestão Documental</p>
        </div>

        {/* Card de Login */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center text-gray-800">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Email */}
               <div className="space-y-2">
                 <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                   Email
                 </Label>
                 <div className="relative">
                   <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                   <Input
                     id="email"
                     type="email"
                     placeholder="seu@email.com"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                     required
                   />
                 </div>
               </div>

               {/* Campo Senha */}
               <div className="space-y-2">
                 <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                   Senha
                 </Label>
                 <div className="relative">
                   <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                   <Input
                     id="password"
                     type={showPassword ? "text" : "password"}
                     placeholder="Sua senha"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                     required
                   />
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent"
                     onClick={() => setShowPassword(!showPassword)}
                   >
                     {showPassword ? (
                       <EyeOff className="h-4 w-4 text-gray-400" />
                     ) : (
                       <Eye className="h-4 w-4 text-gray-400" />
                     )}
                   </Button>
                 </div>
               </div>

              {/* Botão de Login */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Usuários de Exemplo */}
        <Card className="mt-6 shadow-lg border-0 bg-white/60 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium text-gray-800 flex items-center">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              Usuários de Teste
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Clique em um usuário para preencher automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {exampleUsers.map((user, index) => (
              <div
                key={index}
                onClick={() => fillExampleUser(user.email)}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {user.role === 'SuperAdmin' ? (
                      <Shield className="h-5 w-5 text-red-500" />
                    ) : (
                      <Shield className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                  Clique para usar
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2024 DocFlow. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
