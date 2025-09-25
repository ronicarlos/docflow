
"use client";
import type { FC } from 'react';
import { Bell, Settings, UserCircle, LogOut, MessageSquareMore, X, CircleAlert, Link as LinkIcon, CheckCheck, Eye, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { SidebarTrigger } from '@/components/ui/sidebar';
import { APP_NAME } from '@/lib/constants';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import React, { useEffect, useState, useCallback } from 'react';
import type { UserNotification } from '@/types';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { user: currentUser, isLoading: isUserLoading } = useUser();
  const [unreadCount, setUnreadCount] = useState(0);
  const [allUserNotifications, setAllUserNotifications] = useState<UserNotification[]>([]);
  const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setMounted(true);
  }, []);

  const fetchNotifications = useCallback(async () => {
    // We only fetch notifications on the client.
    if (mounted && currentUser?.id) {
      try {
        // Buscar contagem de notificações não lidas via API
        const unreadResponse = await fetch('/api/notifications/unread-count');
        if (unreadResponse.ok) {
          const { count } = await unreadResponse.json();
          setUnreadCount(count);
        }
        
        // Buscar todas as notificações via API
        const notificationsResponse = await fetch('/api/notifications/user');
        if (notificationsResponse.ok) {
          const { notifications } = await notificationsResponse.json();
          setAllUserNotifications(notifications.sort((a: any, b: any) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()));
        }
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    }
  }, [mounted, currentUser?.id]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast({
          title: "Logout realizado com sucesso",
          description: "Você foi desconectado do sistema.",
        });
        router.push('/login');
        router.refresh();
      } else {
        toast({
          title: "Erro no logout",
          description: "Não foi possível fazer logout.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleOpenNotificationPopover = async () => {
    setIsNotificationPopoverOpen(true);
    if (mounted && currentUser?.id) {
        const unreadIds = allUserNotifications.filter(n => !n.isRead).map(n => n.id);
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
              await fetchNotifications(); // Re-fetch to update the state immediately
            }
          } catch (error) {
            console.error('Erro ao marcar notificações como lidas:', error);
          }
        }
    }
  };

  const handleCloseNotificationPopover = async () => {
    setIsNotificationPopoverOpen(false);
    if (mounted && currentUser?.id) {
        // Re-fetch to ensure counts are up-to-date if popover is reopened.
        await fetchNotifications();
    }
  };
  
    const markAllVisibleAsReadInPopover = async () => {
    if (mounted && currentUser?.id) {
        const idsToMark = allUserNotifications
                            .slice(0, 10)
                            .filter(n => !n.isRead)
                            .map(n => n.id);
        if (idsToMark.length > 0) {
            try {
                const response = await fetch('/api/notifications/mark-read', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ notificationIds: idsToMark }),
                });
                
                if (response.ok) {
                  await fetchNotifications();
                  toast({ title: "Notificações no popover marcadas como lidas." });
                } else {
                  toast({ 
                      title: "Erro ao marcar notificações como lidas",
                      variant: "destructive"
                  });
                }
            } catch (error) {
                console.error('Erro ao marcar notificações como lidas:', error);
                toast({ 
                    title: "Erro ao marcar notificações como lidas",
                    variant: "destructive"
                });
            }
        } else {
            toast({ title: "Nenhuma notificação nova para marcar no popover." });
        }
    }
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Link href="/dashboard" className="text-xl font-semibold text-primary hidden md:block">
          {APP_NAME}
        </Link>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Popover open={isNotificationPopoverOpen} onOpenChange={(open) => open ? handleOpenNotificationPopover() : handleCloseNotificationPopover()}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              {mounted && unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full animate-pulse"
                >
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notificações</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[480px] p-0" align="end">
            <div className="flex justify-between items-center p-4 border-b">
              <h4 className="font-medium leading-none">Notificações Recentes</h4>
              {mounted && allUserNotifications.slice(0, 10).some(n => !n.isRead) && (
                <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={markAllVisibleAsReadInPopover}>
                  <CheckCheck className="mr-1 h-3.5 w-3.5"/> Marcar visíveis como lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[350px]">
              {mounted && allUserNotifications.length > 0 ? (
                <div className="p-2 space-y-1">
                  {allUserNotifications.slice(0, 10).map((notification) => {
                    const documentLink = notification.relatedDocumentId ? `/documentos/${notification.relatedDocumentId}` : null;
                    return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-3 rounded-md hover:bg-accent/80 border border-transparent hover:border-primary/30 transition-all",
                        !notification.isRead && "bg-primary/5 "
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!notification.isRead && (
                          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" aria-hidden="true" />
                        )}
                        <div className={cn("flex-1 font-medium break-words", !notification.isRead && "text-primary font-semibold")}>
                            {notification.messageSnapshot?.title || "Sem Título"}
                        </div>
                      </div>
                      <p className={cn("text-xs text-muted-foreground mt-1 break-words", !notification.isRead && "text-foreground/80")}>
                        {notification.messageSnapshot?.contentSnippet || "Sem conteúdo"}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {format(parseISO(notification.receivedAt), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                      </p>
                       {documentLink && (
                         <Button variant="link" size="sm" asChild className="p-0 h-auto mt-1 text-xs">
                           <Link href={documentLink}>
                             <Eye className="mr-1 h-3.5 w-3.5" /> Ver Documento
                           </Link>
                         </Button>
                       )}
                    </div>
                    );
                  })}
                </div>
              ) : (
                 <p className="p-6 text-sm text-center text-muted-foreground">
                    {mounted ? "Você ainda não tem notificações." : "Carregando notificações..."}
                 </p>
              )}
            </ScrollArea>
            {mounted && allUserNotifications.length > 0 && (
              <div className="p-2 border-t text-center">
                 <Button variant="link" size="sm" className="text-xs h-auto p-0" asChild>
                    <Link href="/notifications/history">Ver Histórico Completo</Link>
                 </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        {mounted && !isUserLoading && currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name}`} alt={currentUser.name} />
                  <AvatarFallback>
                    {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.role} • {currentUser.tenantId}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild variant="default">
            <Link href="/login">
              <User className="mr-2 h-4 w-4" />
              Entrar
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
