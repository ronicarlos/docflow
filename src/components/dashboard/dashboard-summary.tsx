
"use client";
import type { FC }from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, CheckCircle2, FileText, Users, XCircle, FileEdit } from 'lucide-react';

interface SummaryStats {
  totalDocuments: number;
  approvedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  draftDocuments: number;
  activeContracts: number;
}

interface DashboardSummaryProps {
  stats: SummaryStats;
}

const DashboardSummary: FC<DashboardSummaryProps> = ({ stats }) => {
  const summaryItems = [
    { title: 'Total de Documentos Ativos', value: stats.totalDocuments, icon: FileText, color: 'text-primary' },
    { title: 'Contratos Ativos', value: stats.activeContracts, icon: BarChart, color: 'text-blue-500' },
    { title: 'Rascunhos', value: stats.draftDocuments, icon: FileEdit, color: 'text-slate-500' },
    { title: 'Aprovados', value: stats.approvedDocuments, icon: CheckCircle2, color: 'text-green-500' },
    { title: 'Pendentes', value: stats.pendingDocuments, icon: Users, color: 'text-yellow-500' },
    { title: 'Reprovados', value: stats.rejectedDocuments, icon: XCircle, color: 'text-red-500' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6">
      {summaryItems.map((item) => (
        <Card key={item.title} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className={`h-5 w-5 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummary;
