
'use server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Edit, CreditCard, ArrowLeft } from "lucide-react";
import { getCurrentUser } from '@/lib/auth';
import { findTenantById } from '@/services/tenantService';
import type { User } from '@/types';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { redirect, notFound } from 'next/navigation';

// Componente auxiliar para exibir informações
const InfoRow: React.FC<{ label: string; value?: string | null | undefined; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 py-3 border-b border-border/40 last:border-b-0">
    <dt className="text-sm font-medium text-muted-foreground">{label}:</dt>
    <dd className="text-sm text-foreground sm:col-span-2">{children || value || <span className="italic text-muted-foreground/70">Não informado</span>}</dd>
  </div>
);

const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Não informado";
    try {
        const date = parseISO(dateString);
        if (isValid(date)) {
            return format(date, "dd/MM/yyyy", { locale: ptBR });
        }
    } catch (e) { console.error("Erro ao formatar data:", e); }
    return "Data inválida";
};

export default async function MinhaEmpresaPage() {
  const currentUser = await getCurrentUser(); 
  if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'SuperAdmin')) {
    redirect('/dashboard');
  }
  
  // Buscar dados da empresa usando PostgreSQL
  const tenantDetails = await findTenantById(currentUser.tenantId);
  
  if (!tenantDetails) {
    notFound();
  }

  const { name, cnpj, address, commercialPhone, commercialEmail, plan, subscriptionStatus, subscriptionStartDate, nextBillingDate, accountOwner, paymentGatewayStatus, logoUrl } = tenantDetails;
  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'SuperAdmin';

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Painel</Link>
      </Button>
      <Card className="w-full max-w-3xl mx-auto shadow-xl rounded-lg">
        <CardHeader className="pb-4 flex flex-row justify-between items-start">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 text-2xl font-semibold text-primary">
              <Building2 className="h-7 w-7" />
              Dados da Minha Empresa
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-1">
              Informações cadastrais e de assinatura da sua empresa: <span className="font-medium text-foreground">{name}</span>.
            </CardDescription>
          </div>
          {logoUrl && (
            <div className="relative w-32 h-16 ml-4">
              <Image src={logoUrl} alt="Logotipo da empresa" layout="fill" objectFit="contain" />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-1 pt-2">
          <dl>
            <InfoRow label="Nome Fantasia" value={name} />
            <InfoRow label="CNPJ" value={cnpj} />
            <InfoRow label="Endereço">
              {address ? (
                <div className="space-y-0.5">
                  <p>{address.street}, {address.number || 'S/N'} {address.complement && `- ${address.complement}`}</p>
                  <p>{address.neighborhood} - {address.city}/{address.state}</p>
                  <p>CEP: {address.zipCode} - {address.country}</p>
                </div>
              ) : null}
            </InfoRow>
            <InfoRow label="Telefone Comercial" value={commercialPhone} />
            <InfoRow label="E-mail Comercial" value={commercialEmail} />
            
            <InfoRow label="Plano Contratado" value={plan} />
            <InfoRow label="Status da Assinatura" value={subscriptionStatus} />
            <InfoRow label="Início da Assinatura" value={formatDate(subscriptionStartDate)} />
            <InfoRow label="Próxima Cobrança" value={formatDate(nextBillingDate)} />
            
            <InfoRow label="Responsável pela Conta">
              {accountOwner ? `${accountOwner.name} (${accountOwner.email})` : null}
            </InfoRow>
            <InfoRow label="Status do Gateway de Pagamento" value={paymentGatewayStatus} />
          </dl>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          {canEdit && (
            <Button variant="outline" asChild>
                <Link href="/minha-empresa/edit">
                <Edit className="mr-2 h-4 w-4" /> Editar Informações
                </Link>
            </Button>
          )}
           {/* Lógica do toast removida para manter como Server Component */}
          <Button variant="outline" disabled>
            <CreditCard className="mr-2 h-4 w-4" /> Gerenciar Assinatura / Pagamentos
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
