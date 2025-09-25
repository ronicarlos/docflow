
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deleteCalibrationInstrument } from '@/actions/calibrationActions';
import type { CalibrationInstrument } from '@/types';

interface InstrumentActionsProps {
  instrument: CalibrationInstrument;
  onActionComplete: () => void;
}

export default function InstrumentActions({ instrument, onActionComplete }: InstrumentActionsProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isDeleting, startDeleteTransition] = React.useTransition();
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);

    const handleDelete = () => {
        startDeleteTransition(async () => {
            const result = await deleteCalibrationInstrument(instrument.id);
            if (result.success) {
                toast({ title: 'Sucesso', description: result.message });
                onActionComplete();
            } else {
                toast({ title: 'Erro', description: result.message, variant: 'destructive' });
            }
            setIsAlertOpen(false);
        });
    };

    return (
        <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                    if (!instrument.id || instrument.id === 'undefined') {
                        console.error('ID do instrumento inválido para edição:', instrument.id);
                        return;
                    }
                    router.push(`/quality-modules/equipment-control/${instrument.id}/edit`);
                }}>
                    <Edit className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsAlertOpen(true)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tem certeza que deseja excluir o instrumento com TAG "{instrument.tag}"? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                        {isDeleting ? 'Excluindo...' : 'Confirmar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
