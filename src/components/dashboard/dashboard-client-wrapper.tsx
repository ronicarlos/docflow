
"use client";

import { useState, useMemo, FC } from 'react';
import Filters from './filters';
import DocumentList from './document-list';
import type { Document } from '@/types/Document';
import type { Contract } from '@/types/Contract';
import type { DocumentType, PopulatedDocumentType } from '@/types/DocumentType';
import type { Discipline } from '@/types/Discipline';
import { useRouter } from 'next/navigation';

interface DashboardClientWrapperProps {
  initialDocuments: Document[];
  contracts: Contract[];
  documentTypes: PopulatedDocumentType[];
  disciplines: Discipline[];
}

const DashboardClientWrapper: FC<DashboardClientWrapperProps> = ({ 
  initialDocuments, 
  contracts, 
  documentTypes, 
  disciplines 
}) => {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const router = useRouter();

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setActiveFilters(newFilters);
  };
  
  const handleDocumentsChange = () => {
    router.refresh();
  };

  const filteredDocuments = useMemo(() => {
    if (Object.values(activeFilters).every(val => !val)) {
      return initialDocuments;
    }
    return initialDocuments.filter(doc => {
      const searchMatch = !activeFilters.search || 
                          doc.code.toLowerCase().includes(activeFilters.search.toLowerCase()) || 
                          doc.description.toLowerCase().includes(activeFilters.search.toLowerCase());
      
      const contractMatch = !activeFilters.contractId || 
        (typeof doc.contract === 'object' ? doc.contract.id === activeFilters.contractId : doc.contract === activeFilters.contractId);
      const docTypeMatch = !activeFilters.documentTypeId || 
        (typeof doc.documentType === 'object' ? doc.documentType.id === activeFilters.documentTypeId : doc.documentType === activeFilters.documentTypeId);
      const areaMatch = !activeFilters.area || doc.area === activeFilters.area;
      const statusMatch = !activeFilters.status || doc.status === activeFilters.status;

      let dateMatch = true;
      if (activeFilters.startDate || activeFilters.endDate) {
          const dateField = activeFilters.dateFilterType === 'approvalDate' 
              ? doc.currentRevision?.approvalDate 
              : doc.elaborationDate;

          if (!dateField) {
              dateMatch = false;
          } else {
              const docDate = new Date(dateField);
              if (activeFilters.startDate) {
                  dateMatch = dateMatch && docDate >= new Date(activeFilters.startDate + 'T00:00:00');
              }
              if (activeFilters.endDate) {
                  dateMatch = dateMatch && docDate <= new Date(activeFilters.endDate + 'T23:59:59');
              }
          }
      }
      
      return searchMatch && contractMatch && docTypeMatch && areaMatch && statusMatch && dateMatch;
    });
  }, [initialDocuments, activeFilters]);

  return (
    <>
      <Filters 
        contracts={contracts} 
        documentTypes={documentTypes as DocumentType[]} 
        disciplines={disciplines}
        onFilterChange={handleFilterChange}
      />
      <DocumentList 
        documents={filteredDocuments}
        listType="active"
        onDocumentsChange={handleDocumentsChange}
      />
    </>
  );
};

export default DashboardClientWrapper;
