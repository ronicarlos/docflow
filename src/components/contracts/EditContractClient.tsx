'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useTransition, type FC } from 'react';
import type { Contract, User, DocumentType } from '@/types';
import ContractFormFields from './contract-form-fields';
import { updateContract } from '@/actions/contractActions';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

interface EditContractClientProps {
    contract: Contract;
    users: User[];
    documentTypes: DocumentType[];
}

const contractEditSchema = z.object({
  name: z.string().min(3, "Nome do contrato deve ter pelo menos 3 caracteres."),
  internalCode: z.string().min(1, "Código interno é obrigatório."),
  client: z.string().min(1, "Nome do cliente é obrigatório."),
  startDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de início inválida." }),
  endDate: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "Data de término inválida." }),
  scope: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  commonRisksText: z.string().optional(),
  alertKeywordsText: z.string().optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "A data de término não pode ser anterior à data de início.",
  path: ["endDate"],
});

type ContractEditFormData = z.infer<typeof contractEditSchema>;

const EditContractClient: FC<EditContractClientProps> = ({ contract, users, documentTypes }) => {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaving, startSavingTransition] = useTransition();

    const methods = useForm<ContractEditFormData>({
        resolver: zodResolver(contractEditSchema),
        defaultValues: {
            name: contract.name || '',
            internalCode: contract.internalCode || '',
            client: contract.client || '',
            startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
            endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
            scope: contract.scope || '',
            status: contract.status || 'active',
            commonRisksText: contract.commonRisks?.join('\n') || '',
            alertKeywordsText: contract.alertKeywords?.join('\n') || '',
        },
    });

    const onSubmit = (data: ContractEditFormData) => {
        startSavingTransition(async () => {
            try {
                if (!user || !user.tenantId) {
                    toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
                    return;
                }
                
                const commonRisks = data.commonRisksText
                    ? data.commonRisksText.split('\n').filter(r => r.trim())
                    : [];
                const alertKeywords = data.alertKeywordsText
                    ? data.alertKeywordsText.split('\n').filter(k => k.trim())
                    : [];

                const fd = new FormData();
                fd.set('name', data.name);
                fd.set('internalCode', data.internalCode);
                fd.set('client', data.client);
                fd.set('startDate', data.startDate);
                fd.set('endDate', data.endDate);
                fd.set('scope', data.scope ?? '');
                if (data.status) fd.set('status', data.status);
                const responsibleUserId = (data as any).responsibleUserId ?? '';
                fd.set('responsibleUserId', responsibleUserId);
                fd.append('tenantId', user.tenantId);
                commonRisks.forEach((r) => fd.append('commonRisks', r));
                alertKeywords.forEach((k) => fd.append('alertKeywords', k));

                const result = await updateContract(contract.id, fd);

                if (result.success) {
                    toast({
                        title: "Contrato Atualizado!",
                        description: "As alterações foram salvas com sucesso.",
                    });
                    router.push('/contracts');
                } else {
                    toast({
                        title: "Erro ao Atualizar",
                        description: result.error || "Ocorreu um erro ao salvar as alterações.",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error('Erro ao atualizar contrato:', error);
                toast({
                    title: "Erro Inesperado",
                    description: "Ocorreu um erro inesperado ao salvar as alterações.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" asChild>
                    <Link href="/contracts">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Editar Contrato</h1>
                    <p className="text-muted-foreground">Modifique os dados do contrato "{contract.name}"</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Contrato</CardTitle>
                    <CardDescription>
                        Atualize as informações básicas do contrato
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                            <ContractFormFields 
                                control={methods.control}
                                errors={methods.formState.errors}
                                users={users}
                                isLoading={isSaving}
                                watch={methods.watch}
                                setValue={methods.setValue}
                            />
                            
                            <div className="flex justify-end gap-4 pt-6 border-t">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => router.push('/contracts')}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Salvar Alterações
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
};

export { EditContractClient };