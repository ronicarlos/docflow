
'use server';

import { prisma } from '@/lib/prisma';
import type { MeetingMinute } from '@/types';

// Helper to ensure we return plain objects
function cleanObject<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function findAll(tenantId: string): Promise<MeetingMinute[]> {
  try {
    const minutes = await prisma.meetingMinute.findMany({
      where: { tenantId },
      include: {
        contract: {
          select: { id: true, title: true }
        }
      },
      orderBy: { meetingDate: 'desc' }
    });
    return cleanObject(minutes);
  } catch (error) {
    console.error('Error finding all meeting minutes:', error);
    throw new Error('Failed to fetch meeting minutes from the database.');
  }
}

export async function findById(id: string): Promise<MeetingMinute | null> {
  try {
    const minute = await prisma.meetingMinute.findUnique({
      where: { id },
      include: {
        contract: {
          select: { id: true, title: true }
        },
        attachments: true
      }
    });
    if (!minute) return null;

    return cleanObject(minute);
  } catch (error) {
    console.error(`Error finding meeting minute by ID ${id}:`, error);
    throw new Error('Failed to fetch meeting minute from the database.');
  }
}

export async function create(data: Partial<MeetingMinute>): Promise<MeetingMinute> {
  try {
    // Validar campos obrigatórios
    if (!data.title) {
      throw new Error('Título da ata é obrigatório');
    }
    if (!data.meetingDate) {
      throw new Error('Data da reunião é obrigatória');
    }
    if (!data.generatedMarkdown) {
      throw new Error('Conteúdo da ata é obrigatório');
    }
    if (!data.tenantId) {
      throw new Error('Tenant ID é obrigatório');
    }
    if (!data.contractId) {
      throw new Error('Contract ID é obrigatório');
    }
    if (!data.createdByUserId) {
      throw new Error('ID do criador é obrigatório');
    }

    console.log('Creating meeting minute with data:', JSON.stringify(data, null, 2));

    const newMinute = await prisma.meetingMinute.create({
      data: {
        title: data.title,
        meetingDate: data.meetingDate,
        generatedMarkdown: data.generatedMarkdown,
        status: data.status || 'draft',
        tenantId: data.tenantId,
        contractId: data.contractId,
        createdByUserId: data.createdByUserId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        contract: {
          select: { id: true, name: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    console.log('Meeting minute created successfully:', newMinute.id);
    return cleanObject(newMinute);
  } catch (error: any) {
    console.error('Error creating meeting minute:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });

    if (error.code === 'P2002') {
      throw new Error('Já existe uma ata com estes dados.');
    }
    if (error.code === 'P2003') {
      throw new Error('Tenant, contrato ou usuário não encontrado. Verifique os dados fornecidos.');
    }
    
    throw new Error(`Falha ao criar nova ata de reunião: ${error.message}`);
  }
}

export async function update(id: string, data: Partial<MeetingMinute>): Promise<MeetingMinute | null> {
  try {
    const updatedMinute = await prisma.meetingMinute.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any,
      include: {
        contract: {
          select: { id: true, title: true }
        }
      }
    });
    return cleanObject(updatedMinute);
  } catch (error: any) {
    console.error(`Error updating meeting minute ${id}:`, error);
    if (error.code === 'P2025') {
      return null; // Ata não encontrada
    }
    throw new Error('Failed to update meeting minute in the database.');
  }
}

export async function remove(id: string): Promise<void> {
  try {
    await prisma.meetingMinute.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Error removing meeting minute ${id}:`, error);
    if (error.code === 'P2025') {
      throw new Error('Ata de reunião não encontrada.');
    }
    throw new Error('Failed to remove meeting minute from the database.');
  }
}
