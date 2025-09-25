
"use client";
import type { FC } from 'react';
import type { Revision } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, User, CalendarDays, Download, Eye } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import { DOCUMENT_STATUSES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DocumentViewerModal from './document-viewer-modal'; 
import React, { useState, useEffect } from 'react'; 
import { parseISO, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';

interface RevisionHistoryProps {
  revisions: Revision[];
  documentCode: string;
}

// Sub-componente seguro para renderizar a data da revisão e evitar erros de hidratação
const SafeRevisionDate: React.FC<{ dateString: string }> = ({ dateString }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        // A lógica de formatação de data agora roda apenas no cliente, após a montagem.
        try {
            if (dateString) {
                const date = parseISO(dateString);
                if (isValid(date)) {
                    setFormattedDate(format(date, "dd/MM/yyyy", { locale: ptBR }));
                } else {
                    setFormattedDate("Data inválida");
                }
            } else {
                setFormattedDate("N/A");
            }
        } catch (e) {
            setFormattedDate("Erro");
        }
    }, [dateString]);

    // Exibe um esqueleto de carregamento enquanto a data não é formatada no cliente
    if (formattedDate === null) {
        return <span className="inline-block align-middle"><Skeleton className="h-4 w-20" /></span>;
    }

    return <>{formattedDate}</>;
};

const RevisionHistory: FC<RevisionHistoryProps> = ({ revisions, documentCode }) => {
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [selectedRevisionForView, setSelectedRevisionForView] = useState<Revision | undefined>(undefined);

  const handleViewRevision = (revision: Revision) => {
    setSelectedRevisionForView(revision);
    setIsViewerModalOpen(true);
  };

  if (!revisions || revisions.length === 0) {
    return (
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ListChecks className="h-6 w-6 text-primary" />
            Histórico de Revisões: {documentCode}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum histórico de revisão disponível para este documento.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ListChecks className="h-6 w-6 text-primary" />
            Histórico de Revisões: {documentCode}
          </CardTitle>
          <CardDescription>Acompanhe todas as alterações e versões deste documento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {revisions.sort((a,b) => (b.revisionNumber > a.revisionNumber ? 1 : -1)).map((rev) => {
              const statusInfo = DOCUMENT_STATUSES[rev.status];
              let badgeColorClass = "bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500";
              if (rev.status === 'approved') badgeColorClass = "bg-green-100 text-green-700 border-green-300 dark:bg-green-700/30 dark:text-green-400 dark:border-green-600";
              if (rev.status === 'pending_approval') badgeColorClass = "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-600/30 dark:text-yellow-400 dark:border-yellow-500";
              if (rev.status === 'rejected') badgeColorClass = "bg-red-100 text-red-700 border-red-300 dark:bg-red-700/30 dark:text-red-400 dark:border-red-600";
              
              return (
                <div key={rev.id} className="p-4 border rounded-md bg-background hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <h3 className="text-lg font-semibold text-primary">Revisão {rev.revisionNumber}</h3>
                    <Badge variant="outline" className={cn("text-xs", badgeColorClass, "border-transparent")}>{statusInfo.label}</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center"><User className="w-4 h-4 mr-2 text-gray-400" /> Por: {rev.user.name}</div>
                    <div className="flex items-center"><CalendarDays className="w-4 h-4 mr-2 text-gray-400" /> Data: <SafeRevisionDate dateString={rev.date} /></div>
                  </div>
                  {rev.observation && (
                    <div className="mt-3">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Observação:</h4>
                      <p className="text-sm bg-muted/50 p-2 rounded-md">{rev.observation}</p>
                    </div>
                  )}
                  <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewRevision(rev)}>
                      <Eye className="w-4 h-4 mr-2" /> Visualizar
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={rev.fileLink} target="_blank" rel="noopener noreferrer" download={rev.fileName}>
                        <Download className="w-4 h-4 mr-2" /> Baixar Revisão
                      </a>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedRevisionForView && (
        <DocumentViewerModal
          isOpen={isViewerModalOpen}
          onOpenChange={setIsViewerModalOpen}
          documentCode={documentCode}
          revision={selectedRevisionForView}
        />
      )}
    </>
  );
};

export default RevisionHistory;
