
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { NotificationMessage, UserNotification, User, NotificationTargetType } from "@/types";
import { Send, Users as UsersIcon, FileText as ContractIcon, Tag as AreaIcon, ShieldCheck as RoleIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { USER_ROLES } from "@/lib/constants";

const notificationSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres.").max(100, "O título não pode exceder 100 caracteres."),
  content: z.string().min(10, "O conteúdo deve ter pelo menos 10 caracteres.").max(1000, "O conteúdo não pode exceder 1000 caracteres."),
  targetType: z.enum(['all_tenant_users', 'specific_users'], {
    errorMap: () => ({ message: "Selecione o tipo de destinatário." })
  }),
  specificUserIds: z.array(z.string()).optional(),
});

type NotificationFormData = z.infer<typeof notificationSchema>;

export default function NotificationsAdminPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tenantUsers, setTenantUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: "",
      content: "",
      targetType: "all_tenant_users",
      specificUserIds: [],
    },
  });

  const targetType = watch("targetType");

  useEffect(() => {
    const loadTenantUsers = async () => {
      if (!user?.tenantId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/notifications/users');
        if (response.ok) {
          const users = await response.json();
          setTenantUsers(users);
        } else {
          throw new Error('Falha ao buscar usuários');
        }
      } catch (error) {
        console.error('Erro ao carregar usuários do tenant:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar usuários do tenant.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTenantUsers();
  }, [user?.tenantId, toast]);

  const onSubmit = async (data: NotificationFormData) => {
    if (!user || !user.tenantId) {
      toast({ title: "Erro", description: "Usuário não autenticado.", variant: "destructive" });
      return;
    }
    
    if (data.targetType === 'specific_users' && (!data.specificUserIds || data.specificUserIds.length === 0)) {
        toast({ title: "Destinatários Faltando", description: "Selecione ao menos um usuário específico.", variant: "destructive" });
        return;
    }

    try {
      const response = await fetch('/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          targetType: data.targetType,
          specificUserIds: data.specificUserIds,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Notificação Enviada!",
          description: result.message,
        });
        reset();
      } else {
        throw new Error('Falha ao enviar notificação');
      }
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (!user || user.role !== 'Admin') {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg text-destructive">Acesso negado. Esta página é apenas para administradores.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Send className="h-7 w-7 text-primary" />
            Enviar Nova Notificação
          </CardTitle>
          <CardDescription>
            Crie e envie mensagens para os usuários do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="title">Título da Notificação *</Label>
              <Controller name="title" control={control} render={({ field }) => <Input id="title" placeholder="Ex: Manutenção Programada" {...field} />} />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="content">Conteúdo da Mensagem *</Label>
              <Controller name="content" control={control} render={({ field }) => <Textarea id="content" placeholder="Digite o conteúdo completo da notificação aqui..." rows={5} {...field} />} />
              {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            </div>

            <div>
              <Label htmlFor="targetType">Enviar Para *</Label>
              <Controller
                name="targetType"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="targetType">
                      <SelectValue placeholder="Selecione o público-alvo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all_tenant_users">
                        <div className="flex items-center gap-2"><UsersIcon className="h-4 w-4" /> Todos os Usuários do Inquilino</div>
                      </SelectItem>
                      <SelectItem value="specific_users">
                         <div className="flex items-center gap-2"><UsersIcon className="h-4 w-4 text-blue-500" /> Usuários Específicos</div>
                      </SelectItem>
                      {/* Futuras opções de segmentação:
                      <SelectItem value="specific_contract">
                        <div className="flex items-center gap-2"><ContractIcon className="h-4 w-4 text-green-500" /> Contrato Específico</div>
                      </SelectItem>
                      <SelectItem value="specific_roles">
                        <div className="flex items-center gap-2"><RoleIcon className="h-4 w-4 text-purple-500" /> Função Específica (Role)</div>
                      </SelectItem>
                      <SelectItem value="specific_areas">
                         <div className="flex items-center gap-2"><AreaIcon className="h-4 w-4 text-orange-500" /> Área Principal Específica</div>
                      </SelectItem>
                      */}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.targetType && <p className="text-sm text-destructive mt-1">{errors.targetType.message}</p>}
            </div>

            {targetType === 'specific_users' && (
              <div>
                <Label>Selecionar Usuários Específicos *</Label>
                <Card className="max-h-60 overflow-y-auto p-3 bg-muted/50">
                  {tenantUsers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum usuário disponível neste inquilino.</p>
                  ) : (
                    <div className="space-y-2">
                      <Controller
                        name="specificUserIds"
                        control={control}
                        render={({ field }) => (
                          <>
                            {tenantUsers.map((user) => (
                              <div key={user.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`user-${user.id}`}
                                  value={user.id}
                                  checked={field.value?.includes(user.id)}
                                  onChange={(e) => {
                                    const currentValues = field.value || [];
                                    if (e.target.checked) {
                                      field.onChange([...currentValues, user.id]);
                                    } else {
                                      field.onChange(currentValues.filter((id) => id !== user.id));
                                    }
                                  }}
                                  className="form-checkbox h-4 w-4 text-primary border-border rounded focus:ring-primary"
                                />
                                <Label htmlFor={`user-${user.id}`} className="font-normal cursor-pointer">{user.name} ({user.email})</Label>
                              </div>
                            ))}
                          </>
                        )}
                      />
                    </div>
                  )}
                </Card>
                {errors.specificUserIds && <p className="text-sm text-destructive mt-1">{errors.specificUserIds.message as string}</p>}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Send className="mr-2 h-4 w-4 animate-pulse" /> : <Send className="mr-2 h-4 w-4" />}
                {isSubmitting ? "Enviando..." : "Enviar Notificação"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
