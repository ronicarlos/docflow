
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, APP_NAME, type NavLink, type NavLinkParent, type NavLinkChild, type NavLinkGrandChild, type UserRole } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
  SidebarInput // Importando SidebarInput
} from '@/components/ui/sidebar';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const getIcon = (iconName: string | undefined): LucideIcon => {
  if (!iconName) return LucideIcons.Dot;
  const Icon = (LucideIcons as any)[iconName];
  return Icon || LucideIcons.Dot;
};

interface MemoizedSidebarLinkItemProps {
  link: NavLinkParent | NavLinkChild | NavLinkGrandChild;
  pathname: string;
  isMobile: boolean;
  isCollapsed: boolean;
  onClickHandler: () => void;
  basePaddingClass?: string;
  isActiveOverride?: boolean;
}

const MemoizedSidebarLinkItem: React.FC<MemoizedSidebarLinkItemProps> = React.memo(({
  link,
  pathname,
  isMobile,
  isCollapsed,
  onClickHandler,
  basePaddingClass = "pl-2",
  isActiveOverride,
}) => {
  const { toast } = useToast(); // Para usar o toast em itens de ação

  if (!link.href && !link.disabledMessage) return null;

  const Icon = getIcon(link.icon);
  const actualIsActive = (isActiveOverride ?? (link.href && (pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href))))) || false;

  const handleClick = () => {
    if (link.disabledMessage) {
      toast({
        title: "Funcionalidade Indisponível",
        description: link.disabledMessage,
        variant: "default",
        duration: 5000,
      });
    } else {
      onClickHandler(); // Chama o handler original para fechar sidebar no mobile
    }
  };

  const commonButtonProps = {
    isActive: actualIsActive,
    className: cn(
      "justify-start w-full",
      basePaddingClass,
      isCollapsed && "!p-2 !size-8 justify-center",
      link.disabledMessage && "opacity-70 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent" // Estilo para item desabilitado
    ),
    tooltip: {
      children: link.label,
      hidden: isCollapsed && !isMobile ? false : true,
    },
    onClick: handleClick,
  };

  if (link.href && !link.disabledMessage) {
    return (
      <SidebarMenuButton
        asChild
        {...commonButtonProps}
      >
        <Link href={link.href}>
          <Icon className="h-5 w-5" />
          <span className={cn(isCollapsed && "hidden")}>{link.label}</span>
        </Link>
      </SidebarMenuButton>
    );
  }

  // Para itens que são apenas ações (como o de "Controle de Equipamentos" desabilitado)
  return (
    <SidebarMenuButton
      {...commonButtonProps}
    >
      <Icon className="h-5 w-5" />
      <span className={cn(isCollapsed && "hidden")}>{link.label}</span>
    </SidebarMenuButton>
  );
});
MemoizedSidebarLinkItem.displayName = 'MemoizedSidebarLinkItem';

const isLinkOrDescendantActive = (link: NavLink, currentPathname: string): boolean => {
  if (link.href && !link.disabledMessage && (currentPathname === link.href || (link.href !== "/dashboard" && currentPathname.startsWith(link.href)))) {
    return true;
  }
  if (link.children) {
    return link.children.some(child => isLinkOrDescendantActive(child as NavLink, currentPathname));
  }
  return false;
};

const getInitiallyOpenAccordionItems = (links: NavLink[], currentPathname: string): string[] => {
  const openKeys: string[] = [];

  function collectOpenKeys(items: NavLink[], level: number) {
    for (const item of items) {
      const itemKey = item.accordionKey || item.label.replace(/\s+/g, '-').toLowerCase() + `-${level}`;
      if (item.children && isLinkOrDescendantActive(item, currentPathname)) {
        if (!openKeys.includes(itemKey)) {
          openKeys.push(itemKey);
        }
        collectOpenKeys(item.children as NavLink[], level + 1);
      }
    }
  }
  collectOpenKeys(links, 0);
  return openKeys;
};


export function SidebarNav() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { state: sidebarState, isMobile, setOpen: setOpenMobile } = useSidebar();
  const [isCollapsedClient, setIsCollapsedClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordionKeys, setOpenAccordionKeys] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const { user: currentUser, isLoading } = useAuth();


  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    // Client-side only effect to set collapsed state
    setIsCollapsedClient(sidebarState === "collapsed" && !isMobile);
  }, [sidebarState, isMobile]);

  const handleLinkClick = useCallback(() => {
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, setOpenMobile]);

  const filterLinksByRole = useCallback((links: NavLink[], userRole: UserRole): NavLink[] => {
    return links.reduce((acc, link) => {
        const hasAccess = !link.roles || link.roles.includes(userRole);
        if (!hasAccess) {
            return acc;
        }

        if (link.children) {
            const accessibleChildren = filterLinksByRole(link.children as NavLink[], userRole);
            if (accessibleChildren.length > 0) {
                acc.push({ ...link, children: accessibleChildren });
            }
        } else {
            acc.push(link);
        }
        return acc;
    }, [] as NavLink[]);
  }, []);

  const availableNavLinks = useMemo(() => {
      if (!currentUser) return [];
      return filterLinksByRole(NAV_LINKS, currentUser.role as UserRole);
  }, [currentUser, filterLinksByRole]);


  const filteredLinks = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableNavLinks;
    }
    const lowerCaseTerm = searchTerm.toLowerCase();

    const filter = (items: NavLink[]): NavLink[] => {
      return items.reduce((acc, item) => {
        const hasChildren = item.children && item.children.length > 0;
        const isMatch = item.label.toLowerCase().includes(lowerCaseTerm);
        const filteredChildren = hasChildren ? filter(item.children as NavLink[]) : [];
        
        if (isMatch || filteredChildren.length > 0) {
          acc.push({
            ...item,
            // Se o pai combina, mas nenhum filho, mostra o pai como um link simples (se tiver href)
            children: filteredChildren.length > 0 ? filteredChildren : (isMatch ? [] : undefined),
          });
        }
        return acc;
      }, [] as NavLink[]);
    };

    return filter(availableNavLinks);
  }, [searchTerm, availableNavLinks]);

  const getOpenKeysForSearch = (links: NavLink[]): string[] => {
    const keys: string[] = [];
    const findKeys = (items: NavLink[], level: number) => {
        items.forEach(item => {
            if (item.children && item.children.length > 0) {
                const itemKey = item.accordionKey || item.label.replace(/\s+/g, '-').toLowerCase() + `-${level}`;
                keys.push(itemKey);
                findKeys(item.children as NavLink[], level + 1);
            }
        });
    };
    findKeys(links, 0);
    return keys;
  };
  
  useEffect(() => {
    if (!currentUser) return; // Don't run until user is loaded
    
    if (searchTerm) {
      setOpenAccordionKeys(getOpenKeysForSearch(filteredLinks));
    } else {
      setOpenAccordionKeys(getInitiallyOpenAccordionItems(availableNavLinks, pathname));
    }
  }, [currentUser, searchTerm, filteredLinks, pathname, availableNavLinks]);


  const renderNavLinks = (links: NavLink[], level: number): React.ReactNode[] => {
    return links.map((link) => {
      const Icon = getIcon(link.icon);
      const itemKey = link.accordionKey || link.label.replace(/\s+/g, '-').toLowerCase() + `-${level}`;
      
      const paddingClasses = ["pl-2", "pl-7", "pl-12"];
      const basePaddingClass = paddingClasses[level] || paddingClasses[paddingClasses.length - 1];
      const isParentActive = link.children ? isLinkOrDescendantActive(link, pathname) : false;

      if (link.children && link.children.length > 0) {
        if (isCollapsedClient) {
          return (
            <SidebarMenuItem key={itemKey} className="w-full">
               <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn(
                        "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
                        "justify-center",
                        basePaddingClass,
                         isParentActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}>
                        <Icon className="h-5 w-5" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {link.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </SidebarMenuItem>
          );
        }
        return (
          <AccordionItem key={itemKey} value={itemKey} className="border-none w-full">
            <AccordionTrigger
              className={cn(
                "justify-between w-full hover:no-underline px-2 py-1.5 text-sm font-medium rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                basePaddingClass,
                isParentActive && !isCollapsedClient && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-1 pb-0 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
              <SidebarMenu className="w-full flex flex-col gap-0.5">
                {renderNavLinks(link.children as NavLink[], level + 1)}
              </SidebarMenu>
            </AccordionContent>
          </AccordionItem>
        );

      } else if (link.href || link.disabledMessage) {
        return (
          <SidebarMenuItem key={link.label} className="w-full"> {/* Usar link.label como chave se href pode ser undefined */}
            <MemoizedSidebarLinkItem
              link={link}
              pathname={pathname}
              isMobile={isMobile}
              isCollapsed={isCollapsedClient}
              onClickHandler={handleLinkClick}
              basePaddingClass={basePaddingClass}
            />
          </SidebarMenuItem>
        );
      }
      return null;
    });
  };

  const renderSkeleton = () => (
    <>
      <SidebarHeader className="flex items-center justify-between p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-7 w-7" />
      </SidebarHeader>
      <div className={cn("p-2 pb-1", isCollapsedClient && "px-1.5")}>
        <Skeleton className="h-8 w-full" />
      </div>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {[...Array(10)].map((_, index) => (
            <SidebarMenuItem key={`skeleton-${index}-content`} className="w-full">
              <Skeleton className="h-8 w-full my-1" />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
        <Skeleton className="h-9 w-full" />
      </SidebarFooter>
    </>
  );

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left" className="border-r border-sidebar-border">
      {(!isMounted || !currentUser || isLoading) ? renderSkeleton() : (
        <>
          <SidebarHeader className="flex items-center justify-between p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:justify-center">
            <Link href="/dashboard" className={cn("text-xl font-semibold text-primary", isCollapsedClient && "hidden")}>
              {APP_NAME}
            </Link>
            <SidebarTrigger className={cn("hidden md:flex", isCollapsedClient && "group-data-[collapsible=icon]:flex")} />
          </SidebarHeader>

          <div className={cn("p-2 pb-1", isCollapsedClient && "px-1.5")}>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <LucideIcons.Search className={cn("absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-sidebar-foreground/70", isCollapsedClient && "left-1.5")} />
                    <SidebarInput 
                      placeholder={isCollapsedClient ? "" : "Localizar no menu..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Localizar no menu"
                      className={cn("pl-8", isCollapsedClient && "!pl-7")}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" hidden={!isCollapsedClient || isMobile}>
                  Localizar no menu
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <SidebarContent className="p-2">
            <Accordion type="multiple" value={openAccordionKeys} onValueChange={setOpenAccordionKeys} className="w-full">
              <SidebarMenu>
                {filteredLinks.length > 0 ? (
                  renderNavLinks(filteredLinks, 0)
                ) : (
                  <div className="p-4 text-center text-sm text-sidebar-foreground/70">
                    Nenhum item encontrado.
                  </div>
                )}
              </SidebarMenu>
            </Accordion>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto border-t border-sidebar-border group-data-[collapsible=icon]:p-2">
            <Button
              variant="outline"
              className={cn("w-full", isCollapsedClient && "hidden")}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('simulated_user_id');
                  localStorage.removeItem('simulated_tenant_id');
                  toast({ title: "Sair", description: "Você foi desconectado." });
                  window.location.href = '/dashboard';
                }
              }}
            >
              <LucideIcons.LogOut className="mr-2 h-4 w-4" /> Sair
            </Button>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild disabled={!isCollapsedClient || isMobile}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("w-full justify-center", !isCollapsedClient && "hidden")}
                    aria-label="Sair"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        localStorage.removeItem('simulated_user_id');
                        localStorage.removeItem('simulated_tenant_id');
                        toast({ title: "Sair", description: "Você foi desconectado." });
                        window.location.href = '/dashboard';
                      }
                    }}
                  >
                    <LucideIcons.LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center" hidden={!isCollapsedClient || isMobile}>
                  Sair
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}
