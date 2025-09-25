
'use server';

import SystemEventsClient from '@/components/reports/system-events-client';
import * as systemEventLogService from '@/services/systemEventLogService';
import { getCurrentUser } from '@/lib/auth';

// This is now a Server Component
export default async function SystemEventsLogPage() {
  // Fetch data on the server
  const user = await getCurrentUser();
  const tenantId = user?.tenantId;
  
  if (!tenantId) {
    return <div>Usuário não autenticado</div>;
  }
  
  const initialLogs = await systemEventLogService.findAll(tenantId);

  // Pass server-fetched data to the client component for rendering
  return (
    <SystemEventsClient initialLogs={initialLogs} />
  );
}
