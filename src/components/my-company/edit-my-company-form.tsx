
"use client";

import type { FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ITenant } from '@/types';
import { Save, RotateCcw, Edit3, Loader2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { updateTenant } from '@/actions/tenantActions';

const addressSchema = z.object({
    street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres."),
    number: z.string().min(1, "Número é obrigatório."),
    complement: z.string().optional(),
    neighborhood: z.string().min(2, "Bairro deve ter pelo menos 2 caracteres."),
    city: z.string().min(2, "Cidade deve ter pelo menos 2 caracteres."),
    state: z.string().min(2, "Estado (UF) deve ter 2 caracteres.").max(2, "Estado (UF) deve ter 2 caracteres."),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido. Use XXXXX-XXX ou XXXXXXXX."),
    country: z.string().min(3, "País deve ter pelo menos 3 caracteres."),
});

const tenantEditSchema = z.object({
  name: z.string().min(3, "Nome da empresa deve ter pelo menos 3 caracteres."),
  cnpj: z.string().optional(),
  commercialPhone: z.string().optional(),
  commercialEmail: z.string().email({ message: "Email comercial inválido." }).optional().or(z.literal('')),
  address: addressSchema.optional(),
  accountOwner: z.object({
    name: z.string().min(3, "Nome do responsável deve ter pelo menos 3 caracteres."),
    email: z.string().email("Email do responsável inválido."),
  }).optional(),
  logo: z.any().optional(), // For the upload file
});

type TenantEditFormData = z.infer<typeof tenantEditSchema>;

const MAX_LOGO_SIZE_MB = 2;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

interface MyCompanyEditFormProps {
    tenant: ITenant;
}

const MyCompanyEditForm: FC<MyCompanyEditFormProps> = ({ tenant }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(tenant.logoUrl || null);

  const { control, handleSubmit, setValue, formState: { errors } } = useForm<TenantEditFormData>({
    resolver: zodResolver(tenantEditSchema),
    defaultValues: {
        name: tenant.name || '',
        cnpj: tenant.cnpj || '',
        commercialPhone: tenant.commercialPhone || '',
        commercialEmail: tenant.commercialEmail || '',
        address: tenant.address || { street: '', number: 'S/N', complement: '', neighborhood: '', city: '', state: '', zipCode: '', country: '' },
        accountOwner: tenant.accountOwner || { name: '', email: '' }
    }
  });

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_LOGO_SIZE_BYTES) {
        toast({ title: "Arquivo muito grande", description: `O logo não pode exceder ${MAX_LOGO_SIZE_MB}MB.`, variant: "destructive" });
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'].includes(file.type)) {
        toast({ title: "Tipo de arquivo inválido", description: `Apenas imagens são permitidas.`, variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
      setValue('logo', event.target.files, { shouldValidate: true });
    }
  };
  
  const removeLogo = () => {
    setLogoPreview(null);
    setValue('logo', null, { shouldValidate: true });
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const onSubmit = (data: TenantEditFormData) => {
    startTransition(async () => {
        let newLogoUrl = logoPreview;
        const file = data.logo?.[0];
        if (data.logo === null) { // User clicked remove
            newLogoUrl = null;
        } else if (file) { // New file was uploaded
             newLogoUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }
        
        const { logo, ...formData } = data;
        const result = await updateTenant(tenant.tenantId, { ...formData, logoUrl: newLogoUrl });
        
        if (result.success) {
            toast({ title: "Dados da Empresa Atualizados!", description: result.message });
            router.push(`/minha-empresa`);
        } else {
            toast({ title: "Erro ao Salvar", description: result.message, variant: "destructive" });
        }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Edit3 className="h-7 w-7 text-primary" /> Editar Dados da Empresa: {tenant?.name}
        </CardTitle>
        <CardDescription>Modifique as informações cadastrais da sua empresa. Campos marcados com * são obrigatórios.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <h3 className="text-lg font-medium border-b pb-2 text-primary">Dados Gerais</h3>
            <div>
              <Label htmlFor="name">Nome Fantasia da Empresa *</Label>
              <Controller name="name" control={control} render={({ field }) => <Input id="name" placeholder="Nome da sua empresa" {...field} />} />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Controller name="cnpj" control={control} render={({ field }) => <Input id="cnpj" placeholder="XX.XXX.XXX/0001-XX" {...field} value={field.value || ''}/>} />
              {errors.cnpj && <p className="text-sm text-destructive mt-1">{errors.cnpj.message}</p>}
            </div>
             <div>
              <Label htmlFor="logo-upload">Logotipo da Empresa</Label>
               <Controller
                name="logo"
                control={control}
                render={() => (
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                )}
              />
              {errors.logo && <p className="text-sm text-destructive mt-1">{errors.logo.message as string}</p>}
              {logoPreview && (
                <div className="mt-4 relative w-48 h-24 border rounded-md p-2 bg-muted/50">
                  <Image src={logoPreview} alt="Pré-visualização do logotipo" layout="fill" objectFit="contain" className="rounded-md" />
                  <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={removeLogo}>
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="commercialPhone">Telefone Comercial</Label>
              <Controller name="commercialPhone" control={control} render={({ field }) => <Input id="commercialPhone" placeholder="(XX) XXXXX-XXXX" {...field} value={field.value || ''}/>} />
              {errors.commercialPhone && <p className="text-sm text-destructive mt-1">{errors.commercialPhone.message}</p>}
            </div>
            <div>
              <Label htmlFor="commercialEmail">E-mail Comercial</Label>
              <Controller name="commercialEmail" control={control} render={({ field }) => <Input id="commercialEmail" type="email" placeholder="contato@suaempresa.com" {...field} value={field.value || ''}/>} />
              {errors.commercialEmail && <p className="text-sm text-destructive mt-1">{errors.commercialEmail.message}</p>}
            </div>

            <h3 className="text-lg font-medium border-b pb-2 pt-4 text-primary">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="address.street">Rua/Avenida *</Label>
                    <Controller name="address.street" control={control} render={({ field }) => <Input id="address.street" placeholder="Ex: Av. Principal" {...field} value={field.value || ''} />} />
                    {errors.address?.street && <p className="text-sm text-destructive mt-1">{errors.address.street.message}</p>}
                </div>
                <div>
                    <Label htmlFor="address.number">Número</Label>
                    <Controller name="address.number" control={control} render={({ field }) => <Input id="address.number" placeholder="Ex: 123" {...field} value={field.value || ''} />} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="address.complement">Complemento</Label>
                    <Controller name="address.complement" control={control} render={({ field }) => <Input id="address.complement" placeholder="Ex: Sala 10, Bloco B" {...field} value={field.value || ''} />} />
                </div>
                <div>
                    <Label htmlFor="address.neighborhood">Bairro *</Label>
                    <Controller name="address.neighborhood" control={control} render={({ field }) => <Input id="address.neighborhood" placeholder="Ex: Centro" {...field} value={field.value || ''} />} />
                    {errors.address?.neighborhood && <p className="text-sm text-destructive mt-1">{errors.address.neighborhood.message}</p>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <Label htmlFor="address.city">Cidade *</Label>
                    <Controller name="address.city" control={control} render={({ field }) => <Input id="address.city" placeholder="Ex: São Paulo" {...field} value={field.value || ''} />} />
                    {errors.address?.city && <p className="text-sm text-destructive mt-1">{errors.address.city.message}</p>}
                </div>
                <div>
                    <Label htmlFor="address.state">Estado (UF) *</Label>
                    <Controller name="address.state" control={control} render={({ field }) => <Input id="address.state" placeholder="Ex: SP" maxLength={2} {...field} value={field.value || ''} />} />
                    {errors.address?.state && <p className="text-sm text-destructive mt-1">{errors.address.state.message}</p>}
                </div>
                <div>
                    <Label htmlFor="address.zipCode">CEP *</Label>
                    <Controller name="address.zipCode" control={control} render={({ field }) => <Input id="address.zipCode" placeholder="Ex: 00000-000" {...field} value={field.value || ''} />} />
                    {errors.address?.zipCode && <p className="text-sm text-destructive mt-1">{errors.address.zipCode.message}</p>}
                </div>
            </div>
             <div>
                <Label htmlFor="address.country">País *</Label>
                <Controller name="address.country" control={control} render={({ field }) => <Input id="address.country" placeholder="Ex: Brasil" {...field} value={field.value || ''} />} />
                {errors.address?.country && <p className="text-sm text-destructive mt-1">{errors.address.country.message}</p>}
            </div>
            
            <h3 className="text-lg font-medium border-b pb-2 pt-4 text-primary">Responsável pela Conta</h3>
             <div>
                <Label htmlFor="accountOwner.name">Nome do Responsável *</Label>
                <Controller name="accountOwner.name" control={control} render={({ field }) => <Input id="accountOwner.name" placeholder="Nome completo" {...field} value={field.value || ''} />} />
                {errors.accountOwner?.name && <p className="text-sm text-destructive mt-1">{errors.accountOwner.name.message}</p>}
            </div>
            <div>
                <Label htmlFor="accountOwner.email">Email do Responsável *</Label>
                <Controller name="accountOwner.email" control={control} render={({ field }) => <Input id="accountOwner.email" type="email" placeholder="email@responsavel.com" {...field} value={field.value || ''} />} />
                {errors.accountOwner?.email && <p className="text-sm text-destructive mt-1">{errors.accountOwner.email.message}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-6">
              <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" /> {isSaving ? <Loader2 className="animate-spin" /> : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push('/minha-empresa')} className="w-full sm:w-auto" disabled={isSaving}>
                <RotateCcw className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MyCompanyEditForm;
