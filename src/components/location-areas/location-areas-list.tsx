'use client';

import type { FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LocationArea } from "@/types";
import { Map } from "lucide-react";
import LocationAreaActions from './location-area-actions';

interface LocationAreasListProps {
  locationAreas: LocationArea[];
}

const LocationAreasList: FC<LocationAreasListProps> = ({ locationAreas }) => {
  return (
    <>
      {locationAreas.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locationAreas.map((area) => (
              <TableRow key={area.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{area.name}</TableCell>
                <TableCell>{area.code || 'N/A'}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">{area.tenantId}</TableCell>
                <TableCell className="text-right">
                  <LocationAreaActions locationArea={area} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Map className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Nenhuma localização encontrada.</p>
          <p>Comece adicionando localizações ao sistema.</p>
        </div>
      )}
    </>
  );
};

export default LocationAreasList;
