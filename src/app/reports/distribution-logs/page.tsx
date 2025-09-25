
'use server';

import DistributionLogsClient from '@/components/reports/distribution-logs-client';
import * as distributionEventLogService from '@/services/distributionEventLogService';
import * as tenantService from '@/services/tenantService';
import { getCurrentUser } from '@/lib/auth';

// This is now a Server Component
export default async function DistributionLogsPage() {
  // Fetch data on the server
  const user = await getCurrentUser();
  const tenantId = user?.tenantId;
  
  if (!tenantId) {
    return <div>Usuário não autenticado</div>;
  }
  
  const initialLogs = await distributionEventLogService.findAll(tenantId);
  const tenantDetails = await tenantService.findTenantById(tenantId);
  
  if (!tenantDetails) {
    return <div>Dados do tenant não encontrados</div>;
  }
  
  // Pass server-fetched data to the client component
  return (
    <DistributionLogsClient initialLogs={initialLogs} tenantDetails={tenantDetails} />
  );
}
