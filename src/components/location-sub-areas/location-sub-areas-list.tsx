'use client';

import type { FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Waypoints } from "lucide-react";
import LocationSubAreaActions from './location-sub-area-actions';
import type { PopulatedLocationSubArea } from '@/types/Location';

interface LocationSubAreasListProps {
  subAreas: PopulatedLocationSubArea[];
}

const LocationSubAreasList: FC<LocationSubAreasListProps> = ({ subAreas }) => {
  return (
    <>
      {subAreas.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Sub-Localização</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Localização Pai</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subAreas.map((subArea) => (
              <TableRow key={subArea.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{subArea.name}</TableCell>
                <TableCell>{subArea.code || 'N/A'}</TableCell>
                <TableCell>{subArea.locationArea?.name || 'Não definida'}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{subArea.tenantId}</TableCell>
                <TableCell className="text-right">
                  <LocationSubAreaActions subArea={subArea} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Waypoints className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Nenhuma sub-localização encontrada.</p>
          <p>Comece adicionando sub-localizações ao sistema.</p>
        </div>
      )}
    </>
  );
};

export default LocationSubAreasList;
