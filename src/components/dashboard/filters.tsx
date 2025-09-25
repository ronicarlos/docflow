
"use client";
import type { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { DOCUMENT_STATUSES } from '@/lib/constants'; 
import { Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Contract } from '@/types/Contract';
import type { DocumentType } from '@/types/DocumentType';
import type { Discipline } from '@/types/Discipline';

interface FiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
  contracts: Contract[];
  documentTypes: DocumentType[];
  disciplines: Discipline[];
}

const ALL_ITEMS_VALUE = "_ALL_"; 

const Filters: FC<FiltersProps> = ({ onFilterChange, contracts, documentTypes, disciplines }) => {
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedArea, setSelectedArea] = useState(''); 
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFilterType, setDateFilterType] = useState<'elaborationDate' | 'approvalDate'>('elaborationDate');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApplyFilters = () => {
    // A lógica de busca agora será feita pelo serviço, aqui apenas preparamos os filtros para a UI
    const docTypeValue = documentTypes.find(dt => dt.id === selectedDocType)?.code || "";
    const contractValue = contracts.find(c => c.id === selectedContract)?.id || "";

    const currentFilters = {
      search: searchTerm,
      contractId: contractValue,
      documentTypeId: selectedDocType, // A lista agora filtra pelo ID
      area: selectedArea,
      status: selectedStatus,
      dateFilterType: (startDate || endDate) ? dateFilterType : '', // Só envia se houver data
      startDate,
      endDate,
    };
    onFilterChange(currentFilters); 
    toast({
      title: "Filtros Aplicados",
      description: "A lista de documentos foi atualizada com base nos filtros selecionados.",
    });
  };

  return (
    <div className="mb-6 p-4 bg-card rounded-lg shadow">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 items-end">
        <div className="relative xl:col-span-2">
          <Label htmlFor="search">Buscar por Código ou Descrição</Label>
           <Search className="absolute left-2.5 top-[calc(50%_+_2px)] h-4 w-4 text-muted-foreground" />
          <Input 
            id="search" 
            placeholder="Digite para buscar..." 
            className="pl-8" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="contract">Contrato</Label>
          <Select 
            disabled={contracts.length === 0} 
            value={selectedContract} 
            onValueChange={(val) => setSelectedContract(val === ALL_ITEMS_VALUE ? "" : val)}
          >
            <SelectTrigger id="contract">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_VALUE}>Todos</SelectItem>
              {contracts.map(contract => (
                <SelectItem key={contract.id} value={contract.id}>{contract.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="docType">Tipo de Documento</Label>
          <Select 
            disabled={documentTypes.length === 0} 
            value={selectedDocType}
            onValueChange={(val) => setSelectedDocType(val === ALL_ITEMS_VALUE ? "" : val)}
          >
            <SelectTrigger id="docType">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_VALUE}>Todos</SelectItem>
              {documentTypes.map(docType => (
                <SelectItem key={docType.id} value={docType.id}>
                  {docType.name} ({docType.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="area">Área/Setor</Label>
          <Select 
            disabled={disciplines.length === 0}
            value={selectedArea} 
            onValueChange={(val) => setSelectedArea(val === ALL_ITEMS_VALUE ? "" : val)}
          >
            <SelectTrigger id="area">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_VALUE}>Todas</SelectItem>
              {disciplines.map(discipline => ( 
                <SelectItem key={discipline.id} value={discipline.name}>{discipline.name}</SelectItem> 
              ))}
            </SelectContent>
          </Select>
        </div>
         <div>
          <Label htmlFor="status">Status</Label>
          <Select 
            value={selectedStatus} 
            onValueChange={(val) => setSelectedStatus(val === ALL_ITEMS_VALUE ? "" : val)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_ITEMS_VALUE}>Todos</SelectItem>
               {Object.entries(DOCUMENT_STATUSES).map(([key, statusInfo]) => (
                <SelectItem key={key} value={key}>{statusInfo.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
            <Label htmlFor="start-date">Data Início</Label>
            <Input id="start-date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div>
            <Label htmlFor="end-date">Data Fim</Label>
            <Input id="end-date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>
       <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <RadioGroup value={dateFilterType} onValueChange={(v) => setDateFilterType(v as any)} className="flex items-center gap-4">
          <Label className="text-sm font-medium">Filtrar por data de:</Label>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="elaborationDate" id="date-elab" />
            <Label htmlFor="date-elab" className="text-sm font-normal">Elaboração</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approvalDate" id="date-approv" />
            <Label htmlFor="date-approv" className="text-sm font-normal">Aprovação</Label>
          </div>
        </RadioGroup>
        <Button onClick={handleApplyFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Aplicar Filtros
        </Button>
      </div>
    </div>
  );
};

export default Filters;
