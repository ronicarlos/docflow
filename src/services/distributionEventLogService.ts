
'use server';

import { prisma } from '@/lib/prisma';
import type { IDistributionEventLog } from '@/types/IDistributionEventLog';

function cleanObject<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Finds all distribution event logs for a given tenant ID.
 * @param tenantId The ID of the tenant.
 * @returns A promise that resolves to an array of distribution event logs.
 */
export async function findAll(tenantId: string): Promise<IDistributionEventLog[]> {
  try {
    const logs = await prisma.distributionEventLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' } // Sort by createdAt (valid field)
    });
    
    return cleanObject(logs);
  } catch (error) {
    console.error('Error finding all distribution event logs:', error);
    throw new Error('Failed to fetch distribution event logs from the database.');
  }
}
