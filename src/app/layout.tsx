import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { ConditionalShell } from '@/components/layout/conditional-shell';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'DocFlow - Sistema de Gestão de Documentos',
  description: 'Gerencie seus documentos de forma eficiente com o DocFlow.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthGuard>
          <ConditionalShell>
            {children}
          </ConditionalShell>
        </AuthGuard>
        <Toaster />
      </body>
    </html>
  );
}
