
'use client';

import type { FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PopulatedDocumentType, Discipline } from "@/types";
import { FileType2 } from "lucide-react";
import DocumentTypeActions from './document-type-actions';
import { useMemo, useState } from 'react';
import EditDocumentTypeModal from './edit-document-type-modal';

interface DocumentTypesListProps {
  documentTypes: PopulatedDocumentType[];
  disciplines: Discipline[];
}

const DocumentTypesList: FC<DocumentTypesListProps> = ({ documentTypes, disciplines }) => {
  const disciplineMap = useMemo(() => new Map(disciplines.map(d => [d.id, d.name])), [disciplines]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocType, setEditingDocType] = useState<PopulatedDocumentType | null>(null);

  const handleEdit = (docType: PopulatedDocumentType) => {
    setEditingDocType(docType);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setEditingDocType(null);
    setIsModalOpen(false);
  }

  return (
    <>
      {documentTypes.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Área Principal (Disciplina)</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documentTypes.map((docType) => (
              <TableRow key={docType.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{docType.name}</TableCell>
                <TableCell>{docType.code}</TableCell>
                <TableCell>{disciplineMap.get(String(docType.disciplineId)) || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{docType.tenantId}</TableCell>
                <TableCell className="text-right">
                  <DocumentTypeActions docType={docType} onEdit={handleEdit} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <FileType2 className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Nenhum tipo de documento encontrado.</p>
          <p>Comece adicionando tipos de documento ao sistema.</p>
        </div>
      )}
      {isModalOpen && (
        <EditDocumentTypeModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            docType={editingDocType}
            disciplines={disciplines}
        />
      )}
    </>
  );
};

export default DocumentTypesList;
