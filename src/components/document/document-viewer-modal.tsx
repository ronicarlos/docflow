
"use client";
import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Revision } from '@/types';
import Image from 'next/image'; // Para otimização de imagens
import { DownloadCloud, AlertTriangle, FileText, FileImage, FileAudio, FileSpreadsheet, FileVideo } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  documentCode: string;
  revision?: Revision;
}

const getFileIcon = (fileType: string | undefined): React.ElementType => {
    if (!fileType) return FileText;
    if (fileType.startsWith("image/")) return FileImage;
    if (fileType.startsWith("audio/")) return FileAudio;
    if (fileType.startsWith("video/")) return FileVideo;
    if (fileType.includes("spreadsheet") || fileType.includes("excel")) return FileSpreadsheet;
    if (fileType.includes("word")) return FileText;
    if (fileType.includes("pdf")) return FileText;
    return FileText;
};


const DocumentViewerModal: FC<DocumentViewerModalProps> = ({ isOpen, onOpenChange, documentCode, revision }) => {
  if (!revision) {
    return null; 
  }

  const isImage = revision.fileType?.startsWith('image/');
  const isPdf = revision.fileType === 'application/pdf';
  // Garantir que a URL é absoluta ou um data URI para evitar erros de segurança do navegador
  const isUrlEmbeddable = (url: string | undefined) => typeof url === 'string' && (url.startsWith('data:') || /^(https?:)?\/\//i.test(url));
  const canEmbed = isUrlEmbeddable(revision.fileLink || '');
  const FallbackIcon = getFileIcon(revision.fileType);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[80vw] md:max-w-[70vw] lg:max-w-[60vw] xl:max-w-[50vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">
            Visualizando: {documentCode} - {revision.fileName || 'Documento'}
          </DialogTitle>
          <DialogDescription>
            Revisão: {revision.revisionNumber} | Tipo: {revision.fileType || 'Desconhecido'} | Tamanho: {revision.fileSize ? (revision.fileSize / 1024).toFixed(2) + ' KB' : 'N/A'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto p-6 pt-0">
          {isImage && canEmbed ? (
            <div className="relative w-full min-h-[400px] h-[60vh] bg-muted rounded-md overflow-hidden">
             <Image 
                src={revision.fileLink} 
                alt={`Pré-visualização de ${revision.fileName}`} 
                layout="fill"
                objectFit="contain"
                className="rounded-md"
                data-ai-hint="document image" 
              />
            </div>
          ) : isPdf && canEmbed ? (
            <object 
              data={revision.fileLink} 
              type="application/pdf" 
              width="100%" 
              height="100%"
              className="min-h-[600px] h-[70vh] rounded-md"
            >
                {/* Fallback content se o navegador não puder exibir o PDF */}
                <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-md h-full min-h-[300px]">
                  <AlertTriangle className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-lg font-semibold text-foreground mb-2">Seu navegador não suporta a visualização de PDF.</p>
                  <p className="text-sm text-muted-foreground mb-4">Por favor, faça o download do arquivo para visualizá-lo.</p>
                  <Button asChild variant="secondary">
                    <a href={revision.fileLink} target="_blank" rel="noopener noreferrer" download={revision.fileName}>
                      <DownloadCloud className="mr-2 h-4 w-4" /> Baixar PDF
                    </a>
                  </Button>
                </div>
            </object>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-md h-full min-h-[300px]">
              <FallbackIcon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">Pré-visualização não disponível</p>
              <p className="text-sm text-muted-foreground mb-1">
                Tipo de arquivo: {revision.fileType || 'Desconhecido'}
              </p>
               <p className="text-sm text-muted-foreground mb-4">
                Arquivo: {revision.fileName || 'Nome não disponível'}
              </p>
              {revision.fileLink && (
                <Button asChild variant="secondary">
                  <a href={revision.fileLink} target="_blank" rel="noopener noreferrer" download={revision.fileName}>
                    <DownloadCloud className="mr-2 h-4 w-4" /> Baixar Arquivo
                  </a>
                </Button>
              )}
               {!canEmbed && revision.fileLink && (
                 <p className="text-xs text-amber-600 mt-3 italic max-w-sm">Nota: Links locais (ex: "/uploads/mock/...") não podem ser pré-visualizados diretamente no navegador sem um servidor de arquivos configurado.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewerModal;
