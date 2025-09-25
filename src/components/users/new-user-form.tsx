
'use client';

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/use-auth';
import { USER_ROLES, type UserRole } from '@/lib/constants';
import type { User, Discipline, Contract as ContractType } from '@/types';
import { Save, RotateCcw, UserPlus, PlusCircle, ShieldCheck, Edit3, Trash2, Download, CheckCircle2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useTransition } from 'react';
import { createUser } from '@/actions/userActions';
import QuickAddModal from '@/components/shared/quick-add-modal';
import NewDisciplineForm from '@/components/disciplines/new-discipline-form';
import NewEditContractForm from '@/components/contracts/new-edit-contract-form';

const userCreateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .toLowerCase(),
  
  area: z.string()
    .min(2, 'Área deve ter pelo menos 2 caracteres')
    .max(100, 'Área deve ter no máximo 100 caracteres'),
  
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: "Nível de acesso é obrigatório" }),
  }) as z.ZodType<UserRole>,
  
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  
  confirmPassword: z.string(),
  
  isActive: z.boolean().default(true),
  
  accessibleContractIds: z.array(z.string()).default([]),
  
  disciplineIds: z.array(z.string()).default([]),
  
  canCreateRecords: z.boolean().optional().default(false),
  canEditRecords: z.boolean().optional().default(false),
  canDeleteRecords: z.boolean().optional().default(false),
  canDownloadDocuments: z.boolean().optional().default(true),
  canApproveDocuments: z.boolean().optional().default(false),
  canPrintDocuments: z.boolean().optional().default(true),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

type UserCreateFormData = z.infer<typeof userCreateSchema>;
type ModalType = 'discipline' | 'contract' | null;

interface NewUserFormProps {
  disciplines: Discipline[];
  contracts: ContractType[];
}

const NewUserForm: FC<NewUserFormProps> = ({ disciplines, contracts }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);


  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: '', email: '', area: '', role: 'Viewer',
      canCreateRecords: false, canEditRecords: false, canDeleteRecords: false,
      canDownloadDocuments: true, canApproveDocuments: false, canPrintDocuments: true,
    },
  });

  const watchedRole = watch('role');

  useEffect(() => {
    if (watchedRole === 'Admin' || watchedRole === 'SuperAdmin') {
        setValue('canCreateRecords', true);
        setValue('canEditRecords', true);
        setValue('canDeleteRecords', true);
        setValue('canDownloadDocuments', true);
        setValue('canApproveDocuments', true);
        setValue('canPrintDocuments', true);
    }
  }, [watchedRole, setValue]);

  const onSubmit = (data: UserCreateFormData) => {
    startTransition(async () => {
      if (!user || !user.tenantId) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }
      
      // Log inicial no frontend
      console.log('🔍 [DEBUG] Frontend - Iniciando criação de usuário:', {
        timestamp: new Date().toISOString(),
        formData: {
          ...data,
          password: '[REDACTED]'
        }
      });

      try {
        // Create user with default contract access logic handled server-side or in post-creation edit
        const result = await createUser({
          name: data.name,
          email: data.email,
          area: data.area,
          role: data.role,
          password: data.password,
          isActive: data.isActive,
          tenantId: user.tenantId,
          accessibleContractIds: data.accessibleContractIds,
          disciplineIds: data.disciplineIds,
          canCreateRecords: data.canCreateRecords,
          canEditRecords: data.canEditRecords,
          canDeleteRecords: data.canDeleteRecords,
          canDownloadDocuments: data.canDownloadDocuments,
          canApproveDocuments: data.canApproveDocuments,
          canPrintDocuments: data.canPrintDocuments,
        });
        
        // Log detalhado do resultado
        console.log('🔍 [DEBUG] Frontend - Resultado da criação:', {
          timestamp: new Date().toISOString(),
          success: result.success,
          message: result.message,
          hasDebugInfo: !!result.debugInfo,
          debugInfo: result.debugInfo
        });

        if (result.success) {
          console.log('✅ [DEBUG] Frontend - Usuário criado com sucesso');
          toast({
            title: "Usuário Adicionado!",
            description: result.message,
          });
          router.push(`/users`);
        } else {
          // Log detalhado do erro no frontend
          console.error('❌ [DEBUG] Frontend - Erro ao criar usuário:', {
            timestamp: new Date().toISOString(),
            errorMessage: result.message,
            debugInfo: result.debugInfo,
            errors: result.errors,
            formData: {
              ...data,
              password: '[REDACTED]'
            }
          });

          // Exibir informações detalhadas do erro no toast para debugging
          let errorDescription = result.message;
          
          if (result.debugInfo) {
            errorDescription += `\n\n[DEBUG INFO]\nTipo: ${result.debugInfo.type}\nTimestamp: ${result.debugInfo.timestamp}`;
            
            if (result.debugInfo.errorName) {
              errorDescription += `\nErro: ${result.debugInfo.errorName}`;
            }
          }

          if (result.errors && Array.isArray(result.errors)) {
            errorDescription += `\n\n[VALIDATION ERRORS]\n${result.errors.map(e => `• ${e.path?.join('.')}: ${e.message}`).join('\n')}`;
          }

          toast({
            title: "Erro ao criar usuário",
            description: errorDescription,
            variant: "destructive",
            duration: 10000, // Toast mais longo para permitir leitura dos detalhes
          });

          // Também exibir no console para facilitar debugging
          console.group('❌ DETALHES COMPLETOS DO ERRO');
          console.error('Mensagem:', result.message);
          console.error('Debug Info:', result.debugInfo);
          console.error('Validation Errors:', result.errors);
          console.error('Form Data:', { ...data, password: '[REDACTED]' });
          console.groupEnd();
        }
      } catch (frontendError) {
        // Capturar erros que ocorrem no próprio frontend
        console.error('❌ [DEBUG] Frontend - Erro não capturado:', {
          timestamp: new Date().toISOString(),
          error: frontendError,
          errorType: frontendError?.constructor?.name,
          errorMessage: frontendError instanceof Error ? frontendError.message : String(frontendError),
          formData: {
            ...data,
            password: '[REDACTED]'
          }
        });

        toast({
          title: "Erro Inesperado",
          description: `Erro no frontend: ${frontendError instanceof Error ? frontendError.message : 'Erro desconhecido'}\n\nVerifique o console para mais detalhes.`,
          variant: "destructive",
          duration: 10000,
        });
      }
    });
  };

  const permissionsConfig = [
    { name: "canCreateRecords", label: "Pode Adicionar Registros", icon: PlusCircle },
    { name: "canEditRecords", label: "Pode Editar Registros", icon: Edit3 },
    { name: "canDeleteRecords", label: "Pode Excluir Registros", icon: Trash2 },
    { name: "canDownloadDocuments", label: "Fazer Download de Documentos", icon: Download },
    { name: "canApproveDocuments", label: "Aprovar Documentos", icon: CheckCircle2 },
    { name: "canPrintDocuments", label: "Imprimir Documentos", icon: Printer },
  ] as const;
  
  const handleOpenModal = (type: ModalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };
  
  const handleModalSaveSuccess = () => {
    setIsModalOpen(false);
    toast({ title: "Item Adicionado!", description: `A página será recarregada para refletir a mudança.`});
    router.refresh();
  };

  const renderModalContent = () => {
    switch(modalType) {
        case 'discipline': return <NewDisciplineForm isInModal onSaveSuccess={handleModalSaveSuccess} />;
        case 'contract': return <NewEditContractForm users={[]} mode="create" />; // Passa users vazio pois não é necessário no modal
        default: return null;
    }
  };

  return (
     <>
      <Card className="w-full max-w-xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <UserPlus className="h-7 w-7 text-primary" /> Adicionar Novo Usuário
          </CardTitle>
          <CardDescription>Preencha os detalhes do novo usuário. Campos marcados com * são obrigatórios. O acesso a contratos é gerenciado na tela de edição do usuário.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name-new">Nome Completo *</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name-new" {...field} />} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-new">Email *</Label>
              <Controller name="email" control={control} render={({ field }) => <Input id="email-new" type="email" {...field} />} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="area-new">Área Principal (Disciplina) *</Label>
               <div className="flex items-center gap-1">
                  <Controller name="area" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value} disabled={disciplines.length === 0}>
                        <SelectTrigger id="area-new" className="flex-grow"><SelectValue placeholder="Selecione a área principal" /></SelectTrigger>
                        <SelectContent>
                          {disciplines.map(d => (<SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                  )} />
                  <Button size="icon" variant="outline" type="button" onClick={() => handleOpenModal('discipline')}><PlusCircle className="h-4 w-4"/></Button>
                </div>
              {errors.area && <p className="text-sm text-destructive mt-1">{errors.area.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-new">Nível de Acesso (Role) *</Label>
              <Controller name="role" control={control} render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="role-new"><SelectValue placeholder="Selecione o nível de acesso" /></SelectTrigger>
                    <SelectContent>
                      {USER_ROLES.map(role => (<SelectItem key={role} value={role}>{role}</SelectItem>))}
                    </SelectContent>
                  </Select>
              )} />
              {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
            </div>

            {watchedRole === 'Admin' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
                  Administradores têm acesso a todos os contratos e permissões por padrão.
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Label className="flex items-center gap-2 text-base font-semibold"><ShieldCheck className="h-5 w-5 text-primary" /> Permissões Detalhadas</Label>
              <Card className="p-4 bg-muted/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  {permissionsConfig.map(perm => (
                    <div key={perm.name} className="flex items-center space-x-2">
                      <Controller
                        name={perm.name as keyof UserCreateFormData}
                        control={control}
                        render={({ field }) => (
                          <Checkbox
                            id={`perm-new-${perm.name}`}
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            disabled={watchedRole === 'Admin' || watchedRole === 'SuperAdmin'}
                          />
                        )}
                      />
                      <Label htmlFor={`perm-new-${perm.name}`} className="font-normal cursor-pointer flex items-center gap-1.5">
                        <perm.icon className="h-4 w-4 text-muted-foreground" /> {perm.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
                <Save className="mr-2 h-4 w-4" /> {isPending ? 'Salvando...' : 'Salvar Usuário'}
              </Button>
              <Button type="button" variant="outline" onClick={() => reset()} className="w-full sm:w-auto" disabled={isPending}>
                <RotateCcw className="mr-2 h-4 w-4" /> Limpar Formulário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
       {isModalOpen && (
          <QuickAddModal 
              isOpen={isModalOpen} 
              onOpenChange={setIsModalOpen} 
              title={`Adicionar Novo ${modalType === 'discipline' ? 'Disciplina' : 'Contrato'}`}
              description="Preencha os detalhes para criar um novo item."
          >
              {renderModalContent()}
          </QuickAddModal>
      )}
    </>
  );
};

export default NewUserForm;
