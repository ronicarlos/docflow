'use client';

import type { FC } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Discipline } from "@/types";
import { Tags } from "lucide-react";
import DisciplineActions from './discipline-actions';

interface DisciplinesListProps {
  disciplines: Discipline[];
}

const DisciplinesList: FC<DisciplinesListProps> = ({ disciplines }) => {
  return (
    <>
      {disciplines.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Disciplina (Área)</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>Tenant ID</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {disciplines.map((discipline) => (
              <TableRow key={discipline.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{discipline.name}</TableCell>
                <TableCell>{discipline.code || 'N/A'}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{discipline.tenantId}</TableCell>
                <TableCell className="text-right">
                  <DisciplineActions discipline={discipline} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <Tags className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg font-semibold">Nenhuma disciplina encontrada.</p>
          <p>Comece adicionando disciplinas ao sistema.</p>
        </div>
      )}
    </>
  );
};

export default DisciplinesList;
