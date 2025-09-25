

'use server';

import { prisma } from '@/lib/prisma';
import type { DocumentType } from '@/types/DocumentType';

function cleanObject<T>(obj: any): T {
    if (!obj) return obj;
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Busca todos os tipos de documento para um tenant específico.
 */
export async function findAll(tenantId: string): Promise<DocumentType[]> {
  try {
    const documentTypes = await prisma.documentType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });

    return cleanObject(documentTypes);
  } catch (error) {
    console.error('Erro ao buscar todos os tipos de documento:', error);
    throw new Error('Falha ao buscar tipos de documento do banco de dados.');
  }
}

/**
 * Busca um tipo de documento específico pelo seu ID.
 */
export async function findById(id: string): Promise<DocumentType | null> {
  if (!id) {
      return null;
  }
  
  try {
    const documentType = await prisma.documentType.findUnique({
      where: { id }
    });
      
    if (!documentType) {
      return null;
    }

    return cleanObject(documentType);
  } catch (error) {
    console.error(`Erro ao buscar tipo de documento pelo ID ${id}:`, error);
    throw new Error('Falha ao buscar tipo de documento do banco de dados.');
  }
}

/**
 * Cria um novo tipo de documento.
 */
export async function create(data: Partial<DocumentType>): Promise<DocumentType> {
  try {
    const newDocumentType = await prisma.documentType.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    });
    
    return cleanObject(newDocumentType);
  } catch (error: any) {
    console.error('Erro ao criar tipo de documento:', error);
    
    if (error.code === 'P2002') {
      throw new Error('Já existe um tipo de documento com este código para este inquilino.');
    }
    
    throw new Error('Falha ao criar novo tipo de documento no banco de dados.');
  }
}

/**
 * Atualiza um tipo de documento existente.
 */
export async function update(id: string, data: Partial<DocumentType>): Promise<DocumentType | null> {
  try {
    const updatedDocumentType = await prisma.documentType.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any
    });
    
    return cleanObject(updatedDocumentType);
  } catch (error: any) {
    console.error(`Erro ao atualizar tipo de documento ${id}:`, error);
    
    if (error.code === 'P2025') {
      return null; // Tipo de documento não encontrado
    }
    
    throw new Error('Falha ao atualizar tipo de documento no banco de dados.');
  }
}

/**
 * Remove um tipo de documento do banco de dados.
 */
export async function remove(id: string): Promise<void> {
  if (!id) {
      return;
  }
  
  try {
    // TODO: Implementar verificação de dependência.
    // const isInUse = await prisma.document.findFirst({ where: { documentTypeId: id } });
    // if (isInUse) {
    //   throw new Error("Este tipo de documento está em uso e não pode ser excluído.");
    // }
    
    await prisma.documentType.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Erro ao remover tipo de documento ${id}:`, error);
    
    if (error.code === 'P2025') {
      throw new Error('Tipo de documento não encontrado.');
    }
    
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    
    throw new Error('Falha ao remover tipo de documento do banco de dados.');
  }
}
