
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { User } from '@/types';
import { UserCheck, LogIn } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SwitchUserPage() {
  const router = useRouter();
  const [currentSimulatedUser, setCurrentSimulatedUser] = useState<User | undefined>(undefined);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
        // Para desenvolvimento, vamos usar o primeiro usuário como padrão
        if (userData.length > 0) {
          setCurrentSimulatedUser(userData[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchUser = (user: User) => {
    // This function is only called on client-side interactions (button clicks).
    if (typeof window !== 'undefined') {
      localStorage.setItem('simulated_user_id', user.id);
      localStorage.setItem('simulated_tenant_id', user.tenantId);
      // Force a full reload to ensure all mock data is re-evaluated globally
      window.location.href = '/dashboard';
    }
  };

  const renderContent = () => {
    if (!mounted || loading) {
      // Render a skeleton UI on the server and during initial client render
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-5 w-1/2 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          ))}
        </div>
      );
    }
    
    // Once mounted, render the actual content
    return (
      <div className="space-y-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="font-semibold">{user.name} <span className="text-xs text-muted-foreground">({user.email})</span></p>
              <p className="text-sm text-muted-foreground">
                Inquilino: {user.tenantId} | Role: {user.role} | Área: {user.area}
              </p>
            </div>
            <Button
              onClick={() => handleSwitchUser(user)}
              variant={currentSimulatedUser?.id === user.id ? "default" : "outline"}
              disabled={currentSimulatedUser?.id === user.id}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              {currentSimulatedUser?.id === user.id ? "Simulando este" : "Simular Login"}
            </Button>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LogIn className="h-7 w-7 text-primary" />
            Simulador de Troca de Usuário (Desenvolvimento)
          </CardTitle>
          <CardDescription>
            Selecione um usuário abaixo para simular o login com suas permissões e acesso a dados.
            Esta ferramenta é apenas para desenvolvimento e não representa um login real.
            {mounted && currentSimulatedUser && (
              <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded-md text-sm text-blue-700">
                Atualmente simulando como: <strong>{currentSimulatedUser.name}</strong> (Inquilino: {currentSimulatedUser.tenantId}, Role: {currentSimulatedUser.role})
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
