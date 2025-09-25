
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, X, Eye, EyeOff, UserIcon, Mail, Shield, Building, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { updateUser, getUserById, checkEmailAvailability } from '@/actions/userActions';
import type { User, Contract, Discipline } from '@/types';
import { UserRole } from '@/types/UserRole';

// Schema de validação
const editUserSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Selecione um papel válido' })
  }),
  
  password: z.string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: 'Senha deve ter pelo menos 8 caracteres'
    }),
  
  confirmPassword: z.string().optional(),
  
  isActive: z.boolean().default(true),
  
  accessibleContractIds: z.array(z.string()).default([]),
  
  disciplineIds: z.array(z.string()).default([])
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface EditUserFormProps {
  userId: string;
  tenantId: string;
  contracts: Contract[];
  disciplines: Discipline[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditUserForm({ 
  userId, 
  tenantId, 
  contracts, 
  disciplines, 
  onSuccess,
  onCancel 
}: EditUserFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  const [user, setUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
    clearErrors,
    setError
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: UserRole.VIEWER,
      password: '',
      confirmPassword: '',
      isActive: true,
      accessibleContractIds: [],
      disciplineIds: []
    }
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');
  const watchedAccessibleContractIds = watch('accessibleContractIds');
  const watchedDisciplineIds = watch('disciplineIds');

  // Carregar dados do usuário
  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoadingUser(true);
        const userData = await getUserById(userId);
        
        if (!userData.success || !userData.data) {
          toast({
          title: "Erro",
          description: "Usuário não encontrado",
          variant: "destructive",
        });
          router.push('/users');
          return;
        }

        const userInfo = userData.data;
        setUser(userInfo);
        setOriginalEmail(userInfo.email);

        // Preencher o formulário
        reset({
          name: userInfo.name,
          email: userInfo.email,
          role: userInfo.role as UserRole,
          password: '',
          confirmPassword: '',
          isActive: userInfo.isActive,
          accessibleContractIds: userInfo.accessibleContractIds || [],
          disciplineIds: userInfo.disciplineIds || []
        });

      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados do usuário",
          variant: "destructive",
        });
        router.push('/users');
      } finally {
        setIsLoadingUser(false);
      }
    }

    if (userId) {
      loadUser();
    }
  }, [userId, reset, router]);

  // Validar email em tempo real
  useEffect(() => {
    const validateEmail = async () => {
      if (watchedEmail && watchedEmail !== originalEmail && watchedEmail.includes('@')) {
        try {
          const result = await checkEmailAvailability(watchedEmail);
          if (!result.success || !result.data?.available) {
            setError('email', { 
              type: 'manual', 
              message: 'Este email já está em uso' 
            });
          } else {
            clearErrors('email');
          }
        } catch (error) {
          console.error('Erro ao validar email:', error);
        }
      }
    };

    const timeoutId = setTimeout(validateEmail, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedEmail, originalEmail, setError, clearErrors]);

  const onSubmit = async (data: EditUserFormData) => {
    try {
      setIsLoading(true);

      // Preparar dados para envio
      const updateData: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        accessibleContractIds: data.accessibleContractIds,
        disciplineIds: data.disciplineIds
      };

      // Incluir senha apenas se foi fornecida
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }

      const result = await updateUser(userId, updateData);

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso!",
        });
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/users');
        }
      } else {
        toast({
          title: "Erro",
          description: result.message || "Erro ao atualizar usuário",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao atualizar usuário",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push('/users');
    }
  };

  const handleContractToggle = (contractId: string, checked: boolean) => {
    const currentIds = watchedAccessibleContractIds;
    if (checked) {
      setValue('accessibleContractIds', [...currentIds, contractId], { shouldDirty: true });
    } else {
      setValue('accessibleContractIds', currentIds.filter(id => id !== contractId), { shouldDirty: true });
    }
  };

  const handleDisciplineToggle = (disciplineId: string, checked: boolean) => {
    const currentIds = watchedDisciplineIds;
    if (checked) {
      setValue('disciplineIds', [...currentIds, disciplineId], { shouldDirty: true });
    } else {
      setValue('disciplineIds', currentIds.filter(id => id !== disciplineId), { shouldDirty: true });
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando dados do usuário...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Usuário não encontrado</p>
          <Button onClick={handleCancel} variant="outline" className="mt-4">
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Editar Usuário</h1>
          <p className="text-muted-foreground">
            Atualize as informações do usuário {user.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || !isDirty}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informações Básicas */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados pessoais e de acesso do usuário
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Digite o nome completo"
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="Digite o email"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                {/* Papel */}
                <div className="space-y-2">
                  <Label htmlFor="role">Papel no Sistema *</Label>
                  <Select
                    value={watch('role')}
                    onValueChange={(value) => setValue('role', value as UserRole, { shouldDirty: true })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <SelectValue placeholder="Selecione o papel" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN}>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Admin</Badge>
                          <span>Administrador</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UserRole.EDITOR}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Editor</Badge>
                          <span>Editor</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={UserRole.VIEWER}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Viewer</Badge>
                          <span>Visualizador</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-destructive">{errors.role.message}</p>
                  )}
                </div>

                <Separator />

                {/* Senha */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha (opcional)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password')}
                        placeholder="Digite uma nova senha (deixe vazio para manter a atual)"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password.message}</p>
                    )}
                  </div>

                  {watchedPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword')}
                          placeholder="Confirme a nova senha"
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', !!checked, { shouldDirty: true })}
                    disabled={isLoading}
                  />
                  <Label htmlFor="isActive">Usuário ativo</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Permissões */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status do Usuário</span>
                    <Badge variant={watch('isActive') ? 'default' : 'secondary'}>
                      {watch('isActive') ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Papel</span>
                    <Badge variant="outline">
                      {watch('role')}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Contratos</span>
                    <Badge variant="secondary">
                      {watchedAccessibleContractIds.length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Disciplinas</span>
                    <Badge variant="secondary">
                      {watchedDisciplineIds.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contratos Acessíveis */}
        {contracts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Contratos Acessíveis
              </CardTitle>
              <CardDescription>
                Selecione os contratos que este usuário pode acessar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {contracts.map((contract) => (
                    <div key={contract.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`contract-${contract.id}`}
                        checked={watchedAccessibleContractIds.includes(contract.id)}
                        onCheckedChange={(checked) => handleContractToggle(contract.id, !!checked)}
                        disabled={isLoading}
                      />
                      <Label 
                        htmlFor={`contract-${contract.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {contract.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Disciplinas */}
        {disciplines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Disciplinas
              </CardTitle>
              <CardDescription>
                Selecione as disciplinas relacionadas a este usuário
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {disciplines.map((discipline) => (
                    <div key={discipline.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`discipline-${discipline.id}`}
                        checked={watchedDisciplineIds.includes(discipline.id)}
                        onCheckedChange={(checked) => handleDisciplineToggle(discipline.id, !!checked)}
                        disabled={isLoading}
                      />
                      <Label 
                        htmlFor={`discipline-${discipline.id}`}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {discipline.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
