
'use client';

import type { FC } from 'react';
import { Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ContractAttachment } from '@/types';
import * as React from 'react';

// Sub-componente para um item na lista de anexos
const AttachmentItem: FC<{name: string, isNew: boolean, onRemove: () => void}> = ({ name, isNew, onRemove }) => (
    <div className="text-sm flex items-center justify-between p-2 rounded-md bg-muted hover:bg-muted/80">
        <span className="flex items-center gap-2 truncate">
            <Paperclip className="h-4 w-4" />
            <span className="truncate" title={name}>{name}</span>
            {isNew && <span className="text-blue-500 text-xs font-semibold">(novo)</span>}
        </span>
        <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
    </div>
);

// Componente para gerenciar a lista de anexos
const AttachmentManager: FC<{
    existingAttachments: ContractAttachment[];
    filesToUpload: File[];
    onExistingRemove: (setter: React.SetStateAction<ContractAttachment[]>) => void;
    onNewRemove: (setter: React.SetStateAction<File[]>) => void;
    onFileChange: (setter: React.SetStateAction<File[]>) => void;
}> = ({ existingAttachments, filesToUpload, onExistingRemove, onNewRemove, onFileChange }) => {
    
    const handleLocalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFileChange(prev => [...prev, ...Array.from(e.target.files as FileList)]);
        }
    };
    
    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-lg">Documentos Base (A Verdade)</h4>
            <p className="text-sm text-muted-foreground">
                Anexe aqui os documentos que servem como referência principal, como o contrato assinado, normas técnicas ou o manual do projeto. A IA usará estes arquivos como a "fonte da verdade" para as comparações.
            </p>
            <div className="space-y-4 pt-4 border-t">
                <Label htmlFor="attachments-upload">Anexar novos documentos de referência</Label>
                <Input id="attachments-upload" type="file" multiple onChange={handleLocalFileChange} />
                <div className="space-y-2">
                    {existingAttachments.map(att => (
                        <AttachmentItem key={att.id} name={att.fileName} isNew={false} onRemove={() => onExistingRemove(prev => prev.filter(a => a.id !== att.id))} />
                    ))}
                    {filesToUpload.map((file, index) => (
                        <AttachmentItem key={index} name={file.name} isNew={true} onRemove={() => onNewRemove(prev => prev.filter(f => f.name !== file.name))} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AttachmentManager;
