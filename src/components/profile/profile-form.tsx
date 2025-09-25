'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X, Upload, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '@/types/User';

interface ProfileFormProps {
  currentUser: User;
}

export function ProfileForm({ currentUser }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    area: currentUser.area || '',
    avatarUrl: currentUser.avatarUrl || ''
  });

  // Função para obter iniciais do nome
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para lidar com mudanças nos campos
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para salvar alterações
  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar perfil');
        }

        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram atualizadas com sucesso.',
        });

        setIsEditing(false);
        router.refresh();
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível atualizar o perfil. Tente novamente.',
          variant: 'destructive',
        });
      }
    });
  };

  // Função para cancelar edição
  const handleCancel = () => {
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      area: currentUser.area || '',
      avatarUrl: currentUser.avatarUrl || ''
    });
    setIsEditing(false);
  };

  // Função para lidar com upload de avatar (placeholder)
  const handleAvatarUpload = () => {
    toast({
      title: 'Funcionalidade em desenvolvimento',
      description: 'O upload de avatar será implementado em breve.',
    });
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Clique em "Editar" para modificar suas informações pessoais.
          </p>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <UserIcon className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg">Editar Informações Pessoais</CardTitle>
        <CardDescription>
          Atualize suas informações básicas. Algumas informações podem requerer aprovação do administrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage 
              src={formData.avatarUrl || undefined} 
              alt={formData.name} 
            />
            <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
              {getInitials(formData.name)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Foto do Perfil</Label>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleAvatarUpload}
              disabled={isPending}
            >
              <Upload className="mr-2 h-4 w-4" />
              Alterar Foto
            </Button>
          </div>
        </div>

        {/* Formulário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Digite seu nome completo"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Digite seu email"
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Alterações no email podem requerer verificação
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="area">Área Principal</Label>
            <Input
              id="area"
              value={formData.area}
              onChange={(e) => handleInputChange('area', e.target.value)}
              placeholder="Digite sua área de atuação"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end space-x-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isPending}
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isPending || !formData.name.trim() || !formData.email.trim()}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        {/* Aviso */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            <strong>Nota:</strong> Algumas alterações podem requerer aprovação do administrador 
            e podem não ser refletidas imediatamente no sistema.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}