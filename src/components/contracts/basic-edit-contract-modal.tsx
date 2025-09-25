'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Save } from 'lucide-react';
import { useTransition } from 'react';
import type { Contract, User, DocumentType } from '@/types';
import ContractFormFields from './contract-form-fields';
import { updateContract } from '@/actions/contractActions';
import { useToast } from '@/hooks/use-toast';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateContractSchema, UpdateContractData } from '@/lib/validations/contract';
import { useRouter } from 'next/navigation';



interface BasicEditContractModalProps {
    isOpen: boolean;
    onClose: () => void;
    contract: Contract;
    users: User[];
    documentTypes: DocumentType[];
}



const BasicEditContractModal = ({ isOpen, onClose, contract, users, documentTypes }: BasicEditContractModalProps) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isSaving, startSavingTransition] = useTransition();

    const methods = useForm<UpdateContractData>({
        resolver: zodResolver(updateContractSchema),
        defaultValues: {
            id: contract.id,
            name: contract.name || '',
            internalCode: contract.internalCode || '',
            client: contract.client || '',
            startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
            endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
            scope: contract.scope || '',
            status: contract.status || 'active',
            tenantId: contract.tenantId || '',
            commonRisks: contract.commonRisks || [],
            alertKeywords: contract.alertKeywords || [],
            analysisDocumentTypeIds: contract.analysisDocumentTypeIds || [],
        },
    });

    const onSubmit = (data: UpdateContractData) => {
        startSavingTransition(async () => {
            try {
                const fd = new FormData();
                fd.set('id', data.id!);
                if (data.name) fd.set('name', data.name);
                if (data.internalCode) fd.set('internalCode', data.internalCode);
                if (data.client) fd.set('client', data.client);
                if (data.startDate) fd.set('startDate', data.startDate);
                if (data.endDate) fd.set('endDate', data.endDate);
                if (data.scope) fd.set('scope', data.scope);
                if (data.status) fd.set('status', data.status);
                if (data.tenantId) fd.set('tenantId', data.tenantId);
                if (data.commonRisks) {
                    data.commonRisks.forEach((r) => fd.append('commonRisks', r));
                }
                if (data.alertKeywords) {
                    data.alertKeywords.forEach((k) => fd.append('alertKeywords', k));
                }
                if (data.analysisDocumentTypeIds) {
                    data.analysisDocumentTypeIds.forEach((id) => fd.append('analysisDocumentTypeIds', id));
                }

                const result = await updateContract(contract.id, fd);

                if (result.success) {
                    toast({
                        title: "Contrato Atualizado!",
                        description: "As alterações foram salvas com sucesso.",
                    });
                    onClose();
                    router.refresh();
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Editar Contrato: {contract.name}</DialogTitle>
                    <DialogDescription>Modifique os dados do contrato abaixo.</DialogDescription>
                </DialogHeader>
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
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSaving}>
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
                        </DialogFooter>
                    </form>
                </FormProvider>
            </DialogContent>
        </Dialog>
    );
};

export default BasicEditContractModal;