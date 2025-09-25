
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { UserNotification, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, BellRing, CheckCheck, Link as LinkIcon, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsHistoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!mounted || !user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications/user');
      if (response.ok) {
        const allNotifs = await response.json();
        setNotifications(allNotifs.sort((a: UserNotification, b: UserNotification) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()));
      } else {
        throw new Error('Falha ao buscar notificações');
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar notificações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [mounted, user?.id, toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    if (!user?.id || !mounted) return;
    
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length > 0) {
      try {
        const response = await fetch('/api/notifications/mark-read', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ notificationIds: unreadIds }),
        });
        
        if (response.ok) {
          await fetchNotifications(); // Re-fetch to update UI
          toast({ title: "Todas as notificações foram marcadas como lidas." });
        } else {
          throw new Error('Falha ao marcar notificações como lidas');
        }
      } catch (error) {
        console.error('Erro ao marcar notificações como lidas:', error);
        toast({
          title: "Erro",
          description: "Erro ao marcar notificações como lidas.",
          variant: "destructive"
        });
      }
    } else {
      toast({ title: "Nenhuma notificação nova para marcar." });
    }
  };
  
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/delete?id=${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchNotifications(); // Re-fetch to update UI
        toast({ title: "Notificação excluída com sucesso." });
      } else {
        throw new Error('Falha ao excluir notificação');
      }
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir notificação.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteAllReadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/delete?deleteAllRead=true', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchNotifications(); // Re-fetch to update UI
        toast({ title: "Todas as notificações lidas foram excluídas." });
      } else {
        throw new Error('Falha ao excluir notificações lidas');
      }
    } catch (error) {
      console.error('Erro ao excluir notificações lidas:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir notificações lidas.",
        variant: "destructive"
      });
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <Card className="shadow-xl">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BellRing className="h-7 w-7 text-primary" />
              Meu Histórico de Notificações
            </CardTitle>
            <CardDescription>
              Todas as suas notificações, das mais recentes às mais antigas.
            </CardDescription>
          </div>
           <div className="flex gap-2">
             {notifications.some(n => !n.isRead) && (
                <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
                    <CheckCheck className="mr-2 h-4 w-4" /> Marcar todas como lidas
                </Button>
             )}
             {notifications.some(n => n.isRead) && (
                <Button onClick={handleDeleteAllReadNotifications} variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Limpar Lidas
                </Button>
             )}
           </div>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Você não possui notificações no seu histórico.</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-300px)]"> {/* Ajustar altura conforme necessidade */}
              <div className="space-y-3 pr-4">
                {notifications.map(notification => {
                  const documentLink = notification.relatedDocumentId ? `/documentos/${notification.relatedDocumentId}` : null;
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 rounded-lg border transition-all hover:shadow-md",
                        notification.isRead ? "bg-card" : "bg-primary/5 border-primary/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("font-semibold text-base", !notification.isRead && "text-primary")}>
                          {notification.messageSnapshot?.title || "Notificação Sem Título"}
                        </h4>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs whitespace-nowrap bg-primary/80 hover:bg-primary">Nova</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.messageSnapshot?.contentSnippet || "Sem detalhes."}
                      </p>
                      <p className="text-xs text-muted-foreground/80 mt-2">
                        Recebida em: {format(parseISO(notification.receivedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      {notification.isRead && notification.readAt && (
                         <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                          Lida em: {format(parseISO(notification.readAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                      <div className="mt-3 flex justify-end items-center gap-2">
                          {documentLink && (
                              <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs">
                                  <Link href={documentLink}>
                                      <Eye className="mr-1 h-3.5 w-3.5" /> Ver Documento
                                  </Link>
                              </Button>
                          )}
                          <Button variant="ghost" size="sm" className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteNotification(notification.id)}>
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Excluir
                          </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        {notifications.length > 0 && (
            <CardFooter className="border-t pt-4">
                <p className="text-sm text-muted-foreground">Total de notificações: {notifications.length}</p>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
