'use server';

import { notFound } from 'next/navigation';
import * as meetingMinuteService from '@/services/meetingMinuteService';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { getCurrentUser } from '@/lib/auth';
import EditMeetingMinuteForm from '@/components/meeting-minutes/edit-meeting-minute-form';

interface EditMeetingMinutePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMeetingMinutePage({ params }: EditMeetingMinutePageProps) {
  const { id } = await params;
  
  const user = await getCurrentUser();
  const tenantId = user?.tenantId;
  
  if (!tenantId) {
    notFound();
  }

  const [minute, contracts] = await Promise.all([
    meetingMinuteService.findById(id),
    ContractDrizzleService.findAll(tenantId),
  ]);

  if (!minute) {
    notFound();
  }

  return (
    <EditMeetingMinuteForm
      initialMinute={minute}
      contracts={contracts}
    />
  );
}
