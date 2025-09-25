'use server';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, RefreshCw, Map } from "lucide-react";
import Link from "next/link";
import * as locationAreaService from '@/services/locationAreaService';
import { prisma } from '@/lib/prisma';
import LocationAreasList from '@/components/location-areas/location-areas-list';

export default async function LocationAreasPage() {
  // Buscar o tenant ativo real do banco de dados
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true }
  });

  if (!tenant) {
    throw new Error('Nenhum tenant ativo encontrado');
  }

  const locationAreas = await locationAreaService.findAll(tenant.id);

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Map className="w-7 h-7 text-primary" />
              Gerenciamento de Localizações
            </CardTitle>
            <CardDescription>Visualize e gerencie as localizações físicas ou geográficas.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/location-areas">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                </Link>
            </Button>
            <Button asChild>
                <Link href="/location-areas/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Localização
                </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LocationAreasList locationAreas={locationAreas} />
        </CardContent>
      </Card>
    </div>
  );
}
