
'use server';

import { prisma } from '@/lib/prisma';
import type { ISystemEventLog } from '@/types';

function cleanObject<T>(obj: any): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Finds all system event logs for a given tenant ID.
 * @param tenantId The ID of the tenant.
 * @returns A promise that resolves to an array of system event logs.
 */
export async function findAll(tenantId: string): Promise<ISystemEventLog[]> {
  try {
    const logs = await prisma.systemEventLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map the database objects to the application-facing ISystemEventLog type
    const mappedLogs: ISystemEventLog[] = logs.map((log: any) => ({
      id: log.id,
      tenantId: log.tenantId,
      timestamp: log.createdAt.toISOString(),
      userId: log.userId,
      userName: log.userName,
      actionType: log.actionType,
      entityType: log.entityType,
      entityId: log.entityId,
      entityDescription: log.entityDescription,
      details: log.details,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    }));

    return cleanObject(mappedLogs);
  } catch (error) {
    console.error('Error finding all system event logs:', error);
    throw new Error('Failed to fetch system event logs from the database.');
  }
}
