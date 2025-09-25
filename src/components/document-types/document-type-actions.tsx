
'use client';

import type { FC } from 'react';
import type { DocumentType, PopulatedDocumentType } from '@/types';
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useTransition } from 'react';
import { deleteDocumentType } from '@/actions/documentTypeActions';

interface DocumentTypeActionsProps {
  docType: PopulatedDocumentType;
  onEdit: (docType: PopulatedDocumentType) => void;
}

const DocumentTypeActions: FC<DocumentTypeActionsProps> = ({ docType, onEdit }) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteDocumentType(docType.id);
        if (result && result.success) {
          toast({
            title: "Tipo de Documento Excluído!",
            description: result.message,
          });
        } else {
          toast({
            title: "Falha ao Excluir",
            description: result?.message || 'Falha ao comunicar com o servidor. Tente novamente.',
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erro ao chamar deleteDocumentType:', error);
        toast({
          title: "Erro de Rede",
          description: "Falha ao comunicar com o servidor. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ações para {docType.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Opções</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(docType)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar Tipo
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Tipo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o tipo de documento "{docType.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Excluindo...' : 'Sim, Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DocumentTypeActions;
