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
            // id removido: passado separadamente para a Server Action
            name: contract.name || '',
            internalCode: contract.internalCode || '',
            client: contract.client || '',
            startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
            endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
            scope: contract.scope || '',
            status: contract.status || 'active',
            // tenantId removido: será atribuído no backend pela Server Action
            commonRisks: contract.commonRisks || [],
            alertKeywords: contract.alertKeywords || [],
            analysisDocumentTypeIds: contract.analysisDocumentTypeIds || [],
        },
    });

    const onSubmit = (data: UpdateContractData) => {
        startSavingTransition(async () => {
            try {
                const result = await updateContract(contract.id, data);

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
                        description: result.message || "Ocorreu um erro ao salvar as alterações.",
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