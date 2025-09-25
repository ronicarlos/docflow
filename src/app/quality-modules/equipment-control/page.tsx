
'use server';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Thermometer } from "lucide-react";
import Link from "next/link";
import * as calibrationInstrumentService from '@/services/calibrationInstrumentService';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import InstrumentListClient from '@/components/quality-modules/equipment-control/instrument-list-client';

export default async function EquipmentControlPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  const instruments = await calibrationInstrumentService.findAll(currentUser.tenantId);

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Thermometer className="w-7 h-7 text-primary" />
              Controle de Equipamentos e Calibração
            </CardTitle>
            <CardDescription>Gerencie os instrumentos de calibração, suas datas e certificados.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/quality-modules/equipment-control/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Equipamento
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InstrumentListClient initialInstruments={instruments} />
        </CardContent>
      </Card>
    </div>
  );
}
