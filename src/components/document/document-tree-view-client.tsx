

"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Document, Contract, DocumentType as DocType, ITenant } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, Folder, GanttChartSquare, Network, Search, FileType2, Tag, ArrowLeft, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Interfaces and helper functions from the original file
interface TreeNode {
  id: string;
  label: string;
  type: 'tenant' | 'contract' | 'area' | 'documentType' | 'document';
  icon: React.ElementType;
  children?: TreeNode[];
  data?: Document | Partial<Contract> | Partial<DocType> | { name: string } | { id: string, name: string };
  defaultOpen?: boolean;
}

interface GroupedData {
  [contractId: string]: {
    contract: Pick<Contract, 'id' | 'name' | 'internalCode'>;
    areas: {
      [areaName: string]: {
        documentTypes: {
          [docTypeId: string]: {
            docType: Pick<DocType, 'id' | 'name' | 'code'>;
            documents: Document[];
          };
        };
      };
    };
  };
}

const buildTree = (documents: Document[], currentTenant: { tenantId: string; name: string } | undefined): TreeNode[] => {
  if (!currentTenant) return [];

  const grouped: GroupedData = {};

  documents.forEach(doc => {
    if (!doc.contract || !doc.documentType || !doc.area) return;

    const contractId = typeof doc.contract === 'object' ? doc.contract.id : doc.contract;
    const docTypeId = typeof doc.documentType === 'object' ? doc.documentType.id : doc.documentType;
    
    if (!grouped[contractId]) {
      grouped[contractId] = { 
        contract: typeof doc.contract === 'object' ? doc.contract : { id: doc.contract, name: doc.contract, internalCode: '' }, 
        areas: {} 
      };
    }
    if (!grouped[contractId].areas[doc.area]) {
      grouped[contractId].areas[doc.area] = { documentTypes: {} };
    }
    if (!grouped[contractId].areas[doc.area].documentTypes[docTypeId]) {
      grouped[contractId].areas[doc.area].documentTypes[docTypeId] = {
        docType: typeof doc.documentType === 'object' ? doc.documentType : { id: doc.documentType, name: doc.documentType, code: '' },
        documents: [],
      };
    }
    grouped[contractId].areas[doc.area].documentTypes[docTypeId].documents.push(doc);
  });

  const contractNodes: TreeNode[] = Object.values(grouped).map(contractGroup => ({
    id: contractGroup.contract.id,
    label: `${contractGroup.contract.name} (${contractGroup.contract.internalCode})`,
    type: 'contract' as const,
    icon: GanttChartSquare,
    data: contractGroup.contract,
    children: Object.entries(contractGroup.areas).map(([areaName, areaGroup]) => ({
      id: `${contractGroup.contract.id}-${areaName}`,
      label: areaName,
      type: 'area' as const,
      icon: Folder,
      data: { name: areaName },
      children: Object.values(areaGroup.documentTypes).map(docTypeGroup => ({
        id: `${contractGroup.contract.id}-${areaName}-${docTypeGroup.docType.id}`,
        label: `${docTypeGroup.docType.name} (${docTypeGroup.docType.code})`,
        type: 'documentType' as const,
        icon: FileType2,
        data: docTypeGroup.docType,
        children: docTypeGroup.documents.map(doc => ({
          id: doc.id,
          label: `${doc.code} (Rev: ${doc.currentRevision?.revisionNumber || 'N/A'}) - ${doc.description.substring(0, 50)}${doc.description.length > 50 ? '...' : ''}`,
          type: 'document' as const,
          icon: FileText,
          data: doc,
        })).sort((a, b) => a.data!.code.localeCompare(b.data!.code)),
      })).sort((a, b) => a.label.localeCompare(b.label)),
    })).sort((a, b) => a.label.localeCompare(b.label)),
    defaultOpen: false,
  })).sort((a, b) => a.label.localeCompare(b.label));

  return [{
    id: currentTenant.tenantId,
    label: currentTenant.name,
    type: 'tenant' as const,
    icon: Building,
    data: currentTenant,
    children: contractNodes,
    defaultOpen: true,
  }];
};

const TreeViewItem: React.FC<{ node: TreeNode; level: number }> = ({ node, level }) => {
  if (node.type === 'document') {
    return (
      <>
        {node.id && node.id !== 'undefined' ? (
          <Link href={`/documentos/${node.id}`} className="flex items-center py-1.5 px-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm ml-2">
            <node.icon className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
            <span className="truncate" title={node.label}>{node.label}</span>
          </Link>
        ) : (
          <div className="flex items-center py-1.5 px-2 rounded-md text-muted-foreground cursor-not-allowed text-sm ml-2">
            <node.icon className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate" title={`${node.label} (ID inválido)`}>{node.label} (ID inválido)</span>
          </div>
        )}
      </>
    );
  }

  return (
    <AccordionItem value={node.id} className="border-none">
      <AccordionTrigger className="py-1.5 px-2 text-sm hover:bg-muted/50 rounded-md hover:no-underline [&[data-state=open]>svg]:text-primary">
        <div className="flex items-center gap-2">
          <node.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground data-[state=open]:text-primary" />
          <span className="font-medium text-left">{node.label}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className={cn("pl-6 border-l border-dashed pt-1 pb-0", node.type === 'tenant' ? "ml-0" : "ml-2")}>
        {node.children && node.children.length > 0 ? (
          <Accordion type="multiple" defaultValue={node.children.filter(c => c.defaultOpen).map(c => c.id)} className="flex flex-col gap-0.5">
            {node.children.map(childNode => (
              <TreeViewItem key={childNode.id} node={childNode} level={level + 1} />
            ))}
          </Accordion>
        ) : (
          <p className="text-xs text-muted-foreground py-1 px-2 ml-2">Nenhum item encontrado.</p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

interface DocumentTreeViewClientProps {
    initialDocuments: Document[];
    currentTenant: Pick<ITenant, 'tenantId' | 'name'> | undefined;
}

export default function DocumentTreeViewClient({ initialDocuments, currentTenant }: DocumentTreeViewClientProps) {
  const router = useRouter();
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientMounted, setClientMounted] = React.useState(false);

  useEffect(() => {
    setClientMounted(true);
  }, []);

  useEffect(() => {
    if (clientMounted) {
      let documents = initialDocuments;
      
      if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        documents = documents.filter(doc =>
          doc.code.toLowerCase().includes(lowerSearchTerm) ||
          doc.description.toLowerCase().includes(lowerSearchTerm) ||
          doc.currentRevision?.textContent?.toLowerCase().includes(lowerSearchTerm)
        );
      }
      
      setTreeData(buildTree(documents, currentTenant));
    }
  }, [clientMounted, searchTerm, initialDocuments, currentTenant]);

  if (!clientMounted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Network className="h-7 w-7 text-primary" />
            Visão em Árvore dos Documentos
          </CardTitle>
          <CardDescription>
            Navegue pelos documentos de forma hierárquica: Empresa &gt; Contrato &gt; Área &gt; Tipo &gt; Documento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por código, descrição ou conteúdo do documento..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {treeData.length > 0 ? (
             <Accordion type="multiple" defaultValue={treeData.filter(node => node.defaultOpen).map(node => node.id)} className="w-full space-y-1">
              {treeData.map(node => (
                <TreeViewItem key={node.id} node={node} level={0} />
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Network className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Nenhum documento encontrado.</p>
              <p className="text-sm">Verifique os filtros aplicados ou adicione documentos ao sistema.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
