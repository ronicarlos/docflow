
"use client";

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  name: string; // Área do Documento
  total: number; // Contagem de distribuições bem-sucedidas
}

interface DistributionByAreaClientProps {
  chartData: ChartData[];
}

export default function DistributionByAreaClient({ chartData }: DistributionByAreaClientProps) {
  const [clientMounted, setClientMounted] = React.useState(false);

  React.useEffect(() => {
    setClientMounted(true);
  }, []);

  if (!clientMounted) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2 mt-1" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[450px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">
            Dashboard: Distribuição de Documentos por Área
          </CardTitle>
          <CardDescription>
            Total de documentos distribuídos com sucesso, agrupados pela área/disciplina do documento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Nenhum dado de distribuição encontrado.</p>
              <p className="text-sm">Verifique se há logs de distribuição bem-sucedidos no sistema.</p>
            </div>
          ) : (
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 80,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    className="text-xs fill-muted-foreground"
                    width={150}
                    tick={{ dy: 2 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }} />
                  <Bar dataKey="total" name="Distribuições Bem-sucedidas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
