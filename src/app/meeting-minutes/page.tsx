
'use server';

import * as meetingMinuteService from '@/services/meetingMinuteService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { getCurrentUser } from '@/lib/auth';
import MeetingMinutesClient from '@/components/meeting-minutes/meeting-minutes-client';

// Esta é agora uma página de servidor
export default async function MeetingMinutesPage() {
  const user = await getCurrentUser();
  const tenantId = user?.tenantId;
  
  if (!tenantId) {
    return <div>Usuário não autenticado</div>;
  }
  
  // Busca todos os dados necessários no servidor
  const [initialMinutes, initialContracts] = await Promise.all([
    meetingMinuteService.findAll(tenantId),
    ContractDrizzleService.findAll(tenantId)
  ]);

  return (
    <MeetingMinutesClient
      initialMinutes={initialMinutes}
      initialContracts={initialContracts}
    />
  );
}
