
'use server';

import { prisma } from '@/lib/prisma';
import type { CalibrationInstrument } from '@/types/Calibration';

function cleanObject<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function findAll(tenantId: string): Promise<CalibrationInstrument[]> {
  try {
    const instruments = await prisma.calibrationInstrument.findMany({
      where: { tenantId },
      orderBy: { tag: 'asc' }
    });
    return cleanObject(instruments);
  } catch (error) {
    console.error('Error finding all calibration instruments:', error);
    throw new Error('Failed to fetch calibration instruments from the database.');
  }
}

export async function findById(id: string): Promise<CalibrationInstrument | null> {
  try {
    const instrument = await prisma.calibrationInstrument.findUnique({
      where: { id }
    });
    return instrument ? cleanObject(instrument) : null;
  } catch (error) {
    console.error(`Error finding calibration instrument by ID ${id}:`, error);
    throw new Error('Failed to fetch calibration instrument from the database.');
  }
}

export async function create(data: Partial<CalibrationInstrument>): Promise<CalibrationInstrument> {
  try {
    const newInstrument = await prisma.calibrationInstrument.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any
    });
    return cleanObject(newInstrument);
  } catch (error: any) {
    console.error('Error creating calibration instrument:', error);
    if (error.code === 'P2002') {
      throw new Error('Já existe um instrumento com esta TAG ou Número de Série para este inquilino.');
    }
    throw new Error('Falha ao criar novo instrumento de calibração no banco de dados.');
  }
}

export async function update(id: string, data: Partial<CalibrationInstrument>): Promise<CalibrationInstrument | null> {
  try {
    const updatedInstrument = await prisma.calibrationInstrument.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      } as any
    });
    return cleanObject(updatedInstrument);
  } catch (error: any) {
    console.error(`Error updating calibration instrument ${id}:`, error);
    if (error.code === 'P2025') {
      return null; // Instrumento não encontrado
    }
    throw new Error('Failed to update calibration instrument in the database.');
  }
}

export async function remove(id: string): Promise<void> {
  try {
    await prisma.calibrationInstrument.delete({
      where: { id }
    });
  } catch (error: any) {
    console.error(`Error removing calibration instrument ${id}:`, error);
    if (error.code === 'P2025') {
      throw new Error('Instrumento de calibração não encontrado.');
    }
    throw new Error('Failed to remove calibration instrument from the database.');
  }
}
