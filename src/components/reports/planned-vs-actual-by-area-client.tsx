
"use client";

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ClipboardCheck } from 'lucide-react';

interface ChartData {
  area: string;
  previstos: number;
  realizados: number;
  total: number;
  percPrevistos: string;
  percRealizados: string;
}

interface PlannedVsActualByAreaClientProps {
  chartData: ChartData[];
}

export default function PlannedVsActualByAreaClient({ chartData }: PlannedVsActualByAreaClientProps) {
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
          <CardTitle className="text-2xl font-semibold text-primary flex items-center gap-2">
            <ClipboardCheck className="h-7 w-7" />
            Documentos Previstos x Realizados por Área
          </CardTitle>
          <CardDescription>
            Comparativo entre documentos planejados (não aprovados) e realizados (aprovados) em cada área/disciplina.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart className="mx-auto h-12 w-12 mb-4 text-gray-400" />
              <p className="text-lg font-semibold">Nenhum dado encontrado para este relatório.</p>
              <p className="text-sm">Verifique se há documentos cadastrados no sistema.</p>
            </div>
          ) : (
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 50,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="area"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                    tick={{ fontSize: 10 }}
                    className="text-xs fill-muted-foreground"
                  />
                  <YAxis allowDecimals={false} className="text-xs fill-muted-foreground" />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--muted))' }}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                    formatter={(value, name, props) => {
                      const suffix = name === "Previstos" ? ` (${props.payload.percPrevistos})` : ` (${props.payload.percRealizados})`;
                      return [`${value}${suffix}`, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }} />
                  <Bar dataKey="previstos" name="Previstos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} barSize={30}>
                    <LabelList dataKey="previstos" position="top" offset={5} className="fill-muted-foreground" fontSize={10} />
                  </Bar>
                  <Bar dataKey="realizados" name="Realizados" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} barSize={30}>
                     <LabelList dataKey="realizados" position="top" offset={5} className="fill-muted-foreground" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
