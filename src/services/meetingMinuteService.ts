
'use server';

import { prisma } from '@/lib/prisma';
import type { IMeetingMinute } from '@/types';

// Map Prisma MeetingMinute to IMeetingMinute
function toIMinute(minute: any): IMeetingMinute {
  return {
    id: minute.id,
    tenantId: minute.tenantId,
    contractId: minute.contractId,
    contractName: minute.contract?.name ?? '',
    title: minute.title,
    meetingDate: new Date(minute.meetingDate),
    generatedMarkdown: minute.generatedMarkdown,
    status: minute.status,
    attachments: (minute.attachments ?? []).map((a: any) => ({
      id: a.id,
      fileName: a.fileName,
      fileType: a.fileType,
      fileSize: a.fileSize,
      fileLink: a.fileLink,
      uploadedAt: a.uploadedAt,
      meetingMinuteId: a.meetingMinuteId,
    })),
    createdByUserId: minute.createdByUserId,
  };
}

export async function findAll(tenantId: string): Promise<IMeetingMinute[]> {
  try {
    const minutes = await prisma.meetingMinute.findMany({
      where: { tenantId },
      include: {
        contract: {
          select: { id: true, name: true }
        }
      },
      orderBy: { meetingDate: 'desc' }
    });
    return minutes.map(toIMinute);
  } catch (error) {
    console.error('Error finding all meeting minutes:', error);
    throw new Error('Failed to fetch meeting minutes from the database.');
  }
}

export async function findById(id: string): Promise<IMeetingMinute | null> {
  try {
    const minute = await prisma.meetingMinute.findUnique({
      where: { id },
      include: {
        contract: {
          select: { id: true, name: true }
        },
        attachments: true
      }
    });
    if (!minute) return null;

    return toIMinute(minute);
  } catch (error) {
    console.error(`Error finding meeting minute by ID ${id}:`, error);
    throw new Error('Failed to fetch meeting minute from the database.');
  }
}

export async function create(data: Partial<IMeetingMinute>): Promise<IMeetingMinute> {
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

    const created = await prisma.meetingMinute.create({
      data: {
        title: data.title,
        meetingDate: (data.meetingDate as unknown as Date)?.toISOString?.() ?? String(data.meetingDate),
        generatedMarkdown: data.generatedMarkdown,
        status: (data as any).status || 'draft',
        tenantId: data.tenantId,
        contractId: data.contractId,
        createdByUserId: data.createdByUserId,
      },
      include: {
        contract: { select: { id: true, name: true } },
        attachments: true,
      }
    });

    return toIMinute(created);
  } catch (error: any) {
    console.error('Error creating meeting minute:', error);
    if (error.code === 'P2002') {
      throw new Error('Já existe uma ata com estes dados.');
    }
    if (error.code === 'P2003') {
      throw new Error('Tenant, contrato ou usuário não encontrado. Verifique os dados fornecidos.');
    }
    throw new Error(`Falha ao criar nova ata de reunião: ${error.message}`);
  }
}

export async function update(id: string, data: Partial<IMeetingMinute>): Promise<IMeetingMinute | null> {
  try {
    const updated = await prisma.meetingMinute.update({
      where: { id },
      data: {
        title: data.title,
        meetingDate: data.meetingDate ? (data.meetingDate as unknown as Date)?.toISOString?.() ?? String(data.meetingDate) : undefined,
        generatedMarkdown: data.generatedMarkdown,
        status: (data as any).status,
      },
      include: {
        contract: { select: { id: true, name: true } },
        attachments: true,
      }
    });
    return toIMinute(updated);
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
