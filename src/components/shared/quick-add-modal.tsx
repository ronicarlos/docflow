
"use client";
import type { FC, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  // DialogFooter, // Adicionado para botões de ação se necessário no futuro
} from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button'; // Para botão de fechar opcional

interface QuickAddModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

const QuickAddModal: FC<QuickAddModalProps> = ({ isOpen, onOpenChange, title, description, children }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4 overflow-y-auto flex-grow">
          {children}
        </div>
        {/* 
        // Exemplo de como adicionar um footer com um botão de fechar, se o formulário filho não tiver o seu próprio.
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter> 
        */}
      </DialogContent>
    </Dialog>
  );
};
export default QuickAddModal;
