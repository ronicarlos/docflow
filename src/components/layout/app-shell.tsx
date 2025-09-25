
"use client";
import React, { type FC, type ReactNode, lazy, Suspense } from 'react';
import Header from './header';
import { SidebarNav } from './sidebar-nav';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from "@/components/ui/toaster";
// import { useDebug } from '@/hooks/use-debug';

// Lazy load componentes pesados
const AiAssistant = lazy(() => import('@/components/shared/ai-assistant'));
// const DebugPanel = lazy(() => import('@/components/debug/debug-panel'));

interface AppShellProps {
  children: ReactNode;
}

const AppShell: FC<AppShellProps> = ({ children }) => {
  // const { isDebugVisible } = useDebug();

  return (
    <SidebarProvider defaultOpen={true} className="bg-muted/40">
      <SidebarNav />
      <SidebarInset className="flex flex-col sm:gap-4 sm:py-4">
        <Header />
        <main className="flex-1 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-y-auto">
          {children}
        </main>
        <Suspense fallback={null}>
          <AiAssistant />
        </Suspense>
      </SidebarInset>
      <Toaster />
      {/* Debug Panel desativado - disponível apenas no formulário laboratório */}
      {/* <Suspense fallback={null}>
        <DebugPanel isVisible={isDebugVisible} />
      </Suspense> */}
    </SidebarProvider>
  );
};

export default AppShell;
