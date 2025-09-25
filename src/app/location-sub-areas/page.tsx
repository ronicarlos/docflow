'use server';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, RefreshCw, Waypoints } from "lucide-react";
import Link from "next/link";
import * as locationSubAreaService from '@/services/locationSubAreaService';
import { prisma } from '@/lib/prisma';
import LocationSubAreasList from '@/components/location-sub-areas/location-sub-areas-list';

export default async function LocationSubAreasPage() {
  // Buscar o tenant ativo real do banco de dados
  const tenant = await prisma.tenant.findFirst({
    where: { isActive: true }
  });

  if (!tenant) {
    throw new Error('Nenhum tenant ativo encontrado');
  }

  const subAreas = await locationSubAreaService.findAll(tenant.id);

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Waypoints className="w-7 h-7 text-primary" />
              Gerenciamento de Sub-Localizações
            </CardTitle>
            <CardDescription>Visualize e gerencie as sub-localizações, vinculando-as às localizações.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
                <Link href="/location-sub-areas">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Atualizar
                </Link>
            </Button>
            <Button asChild>
                <Link href="/location-sub-areas/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Sub-Localização
                </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <LocationSubAreasList subAreas={subAreas} />
        </CardContent>
      </Card>
    </div>
  );
}
