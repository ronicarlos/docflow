
// src/services/documentService.ts
'use server';

import { prisma } from '@/lib/prisma';
import type { Document, Revision } from '@/types/Document';

// Helper to ensure we return plain objects
function cleanObject<T>(obj: any): T {
    return JSON.parse(JSON.stringify(obj));
}

// Define os includes para população
const INCLUDE_RELATIONS = {
    contract: {
        select: {
            id: true,
            name: true,
            internalCode: true
        }
    },
    documentType: {
        select: {
            id: true,
            name: true,
            code: true
        }
    },
    responsibleUser: {
        select: {
            id: true,
            name: true,
            email: true
        }
    },
    locationArea: {
        select: {
            id: true,
            name: true,
            code: true
        }
    },
    locationSubArea: {
        select: {
            id: true,
            name: true,
            code: true
        }
    }
};


export async function findAll(tenantId: string, includeDeleted = false): Promise<Document[]> {
  try {
    const whereClause: any = { tenantId };
    if (!includeDeleted) {
      whereClause.isDeleted = false;
    }
    
    const documents = await prisma.document.findMany({
      where: whereClause,
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: 'desc' }
    });

    return cleanObject(documents);
  } catch (error) {
    console.error('Erro ao buscar todos os documentos:', error);
    throw new Error('Falha ao buscar documentos do banco de dados.');
  }
}

export async function findById(id: string): Promise<Document | null> {
  if (!id) {
    console.warn(`Tentativa de buscar documento com ID inválido: ${id}`);
    return null;
  }
  
  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS
    });
    
    if (!document) {
      return null;
    }
    
    return cleanObject(document);
  } catch (error) {
    console.error(`Erro ao buscar documento pelo ID ${id}:`, error);
    throw new Error('Falha ao buscar documento do banco de dados.');
  }
}

export async function create(data: Partial<Omit<Document, 'id' | '_id'>>): Promise<Document> {
    try {
      // Validar campos obrigatórios
      if (!data.code) {
        throw new Error('Código do documento é obrigatório');
      }
      if (!data.area) {
        throw new Error('Área é obrigatória');
      }
      if (!data.elaborationDate) {
        throw new Error('Data de elaboração é obrigatória');
      }
      if (!data.lastStatusChangeDate) {
        throw new Error('Data da última mudança de status é obrigatória');
      }
      if (!data.tenantId) {
        throw new Error('Tenant ID é obrigatório');
      }
      if (!data.contractId) {
        throw new Error('Contract ID é obrigatório');
      }
      if (!data.documentTypeId) {
        throw new Error('Tipo de documento é obrigatório');
      }
      if (!data.disciplineId) {
        throw new Error('Disciplina é obrigatória');
      }
      if (!data.createdById) {
        throw new Error('ID do criador é obrigatório');
      }
      if (!data.responsibleUserId) {
        throw new Error('ID do responsável é obrigatório');
      }
      if (!data.currentRevisionNumber) {
        throw new Error('Número da revisão atual é obrigatório');
      }
      if (!data.currentRevisionDate) {
        throw new Error('Data da revisão atual é obrigatória');
      }
      if (!data.currentRevisionCreatedById) {
        throw new Error('ID do criador da revisão atual é obrigatório');
      }

      console.log('Creating document with data:', JSON.stringify(data, null, 2));

      const newDocument = await prisma.document.create({
        data: {
          code: data.code,
          description: data.description || null,
          aiPrompt: data.aiPrompt || null,
          area: data.area,
          elaborationDate: data.elaborationDate,
          lastStatusChangeDate: data.lastStatusChangeDate,
          status: data.status || 'draft',
          fileLink: data.fileLink || null,
          isDeleted: data.isDeleted || false,
          deletedAt: data.deletedAt || null,
          validityDays: data.validityDays || null,
          requiresContinuousImprovement: data.requiresContinuousImprovement || false,
          nextReviewDate: data.nextReviewDate || null,
          importId: data.importId || null,
          textContent: data.textContent || null,
          tenantId: data.tenantId,
          contractId: data.contractId,
          documentTypeId: data.documentTypeId,
          disciplineId: data.disciplineId,
          locationAreaId: data.locationAreaId || null,
          locationSubAreaId: data.locationSubAreaId || null,
          createdById: data.createdById,
          responsibleUserId: data.responsibleUserId,
          approverId: data.approverId || null,
          currentRevisionNumber: data.currentRevisionNumber,
          currentRevisionDescription: data.currentRevisionDescription || null,
          currentRevisionDate: data.currentRevisionDate,
          currentRevisionFileLink: data.currentRevisionFileLink || null,
          currentRevisionCreatedById: data.currentRevisionCreatedById,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: INCLUDE_RELATIONS
      });
      
      console.log('Document created successfully:', newDocument.id);
      return cleanObject(newDocument);
    } catch (error: any) {
      console.error('Erro ao criar documento no serviço:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      
      if (error.code === 'P2002') {
        throw new Error('Já existe um documento com este código para este inquilino.');
      }
      if (error.code === 'P2003') {
        throw new Error('Tenant, contrato, tipo de documento, disciplina ou usuário não encontrado. Verifique os dados fornecidos.');
      }
      
      throw new Error(`Falha ao criar novo documento: ${error.message}`);
    }
}
export async function update(id: string, data: Partial<Document>): Promise<Document | null> {
  try {
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any,
      include: INCLUDE_RELATIONS
    });

    return cleanObject(updatedDocument);
  } catch (error: any) {
    console.error(`Erro ao atualizar documento ${id}:`, error);
    
    if (error.code === 'P2025') {
      return null; // Documento não encontrado
    }
    
    throw new Error('Falha ao atualizar documento no banco de dados.');
  }
}

export async function addRevision(documentId: string, revisionData: Omit<Revision, 'id'>): Promise<Document | null> {
    try {
        const updatedDocument = await prisma.document.update({
            where: { id: documentId },
            data: {
                revisions: {
                    push: revisionData
                },
                currentRevision: revisionData as any,
                status: revisionData.status,
                lastStatusChangeDate: new Date(),
                fileLink: revisionData.fileLink,
                updatedAt: new Date()
            },
            include: INCLUDE_RELATIONS
        });
        
        return cleanObject(updatedDocument);
    } catch (error: any) {
        console.error(`Erro ao adicionar revisão ao documento ${documentId}:`, error);
        
        if (error.code === 'P2025') {
            return null; // Documento não encontrado
        }
        
        throw new Error('Falha ao adicionar nova revisão.');
    }
}

export async function softDelete(id: string): Promise<Document | null> {
  try {
    const deletedDocument = await prisma.document.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    return cleanObject(deletedDocument);
  } catch (error: any) {
    console.error(`Erro ao mover documento ${id} para a lixeira:`, error);
    
    if (error.code === 'P2025') {
      return null; // Documento não encontrado
    }
    
    throw new Error('Falha ao mover documento para a lixeira.');
  }
}

export async function restore(id: string): Promise<Document | null> {
  try {
    const restoredDocument = await prisma.document.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date()
      }
    });
    
    return cleanObject(restoredDocument);
  } catch (error: any) {
    console.error(`Erro ao restaurar documento ${id}:`, error);
    
    if (error.code === 'P2025') {
      return null; // Documento não encontrado
    }
    
    throw new Error('Falha ao restaurar documento.');
  }
}

export async function remove(id: string): Promise<void> {
  try {
    await prisma.document.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Erro ao remover permanentemente o documento ${id}:`, error);
    
    if (error.code === 'P2025') {
      throw new Error('Documento não encontrado.');
    }
    
    throw new Error('Falha ao remover permanentemente o documento.');
  }
}

export async function findByFilters(tenantId: string, filters: {
  search?: string;
  contractId?: string;
  documentTypeIds?: string[];
  area?: string;
  status?: string;
  dateFilterType?: 'elaborationDate' | 'approvalDate';
  startDate?: string;
  endDate?: string;
}): Promise<Document[]> {
  try {
    const whereClause: any = {
      tenantId,
      isDeleted: false
    };

    if (filters.contractId) {
      whereClause.contractId = filters.contractId;
    }
    
    if (filters.documentTypeIds && filters.documentTypeIds.length > 0) {
      whereClause.documentTypeId = {
        in: filters.documentTypeIds
      };
    }
    
    if (filters.area) {
      whereClause.area = filters.area;
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.search) {
      whereClause.OR = [
        {
          code: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: filters.search,
            mode: 'insensitive'
          }
        },
        {
          currentRevision: {
            path: ['textContent'],
            string_contains: filters.search
          }
        }
      ];
    }
    
    // Date filtering logic
    if (filters.dateFilterType && (filters.startDate || filters.endDate)) {
      const dateFilter: any = {};
      
      if (filters.startDate) {
        dateFilter.gte = new Date(filters.startDate);
      }
      
      if (filters.endDate) {
        dateFilter.lte = new Date(filters.endDate);
      }
      
      if (filters.dateFilterType === 'approvalDate') {
        whereClause.currentRevision = {
          path: ['approvalDate'],
          ...dateFilter
        };
      } else {
        whereClause.elaborationDate = dateFilter;
      }
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: INCLUDE_RELATIONS,
      orderBy: [
        { contract: { name: 'asc' } },
        { area: 'asc' },
        { code: 'asc' }
      ]
    });

    return cleanObject(documents);
  } catch (error) {
    console.error('Erro ao buscar documentos por filtros:', error);
    throw new Error('Falha ao buscar documentos filtrados do banco de dados.');
  }
}
