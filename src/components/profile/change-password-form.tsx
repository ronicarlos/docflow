'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';

export function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para mostrar/ocultar senhas
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Função para lidar com mudanças nos campos
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Função para alternar visibilidade da senha
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validação do formulário
  const isFormValid = () => {
    return (
      formData.currentPassword.length >= 6 &&
      formData.newPassword.length >= 6 &&
      formData.newPassword === formData.confirmPassword &&
      formData.currentPassword !== formData.newPassword
    );
  };

  // Função para alterar senha
  const handleChangePassword = () => {
    if (!isFormValid()) {
      toast({
        title: 'Erro de validação',
        description: 'Verifique se todos os campos estão preenchidos corretamente.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Erro ao alterar senha');
        }

        toast({
          title: 'Senha alterada',
          description: 'Sua senha foi alterada com sucesso.',
        });

        // Limpar formulário
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } catch (error) {
        console.error('Erro ao alterar senha:', error);
        toast({
          title: 'Erro',
          description: error instanceof Error ? error.message : 'Não foi possível alterar a senha. Tente novamente.',
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Lock className="mr-2 h-5 w-5" />
          Alterar Senha
        </CardTitle>
        <CardDescription>
          Para sua segurança, digite sua senha atual e escolha uma nova senha forte.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Senha Atual */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Senha Atual *</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showPasswords.current ? 'text' : 'password'}
              value={formData.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={isPending}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('current')}
              disabled={isPending}
            >
              {showPasswords.current ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Nova Senha */}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nova Senha *</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Digite sua nova senha"
              disabled={isPending}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('new')}
              disabled={isPending}
            >
              {showPasswords.new ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A senha deve ter pelo menos 6 caracteres
          </p>
        </div>

        {/* Confirmar Nova Senha */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Confirme sua nova senha"
              disabled={isPending}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => togglePasswordVisibility('confirm')}
              disabled={isPending}
            >
              {showPasswords.confirm ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="text-xs text-red-600">
              As senhas não coincidem
            </p>
          )}
        </div>

        {/* Botão de Ação */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleChangePassword}
            disabled={isPending || !isFormValid()}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            {isPending ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </div>

        {/* Dicas de Segurança */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <h4 className="font-medium text-amber-800 mb-2">Dicas para uma senha segura:</h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>• Use pelo menos 8 caracteres</li>
            <li>• Combine letras maiúsculas e minúsculas</li>
            <li>• Inclua números e símbolos</li>
            <li>• Evite informações pessoais óbvias</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}