import { notFound } from 'next/navigation';
import * as locationAreaService from '@/services/locationAreaService';
import EditLocationAreaForm from '@/components/location-areas/edit-location-area-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditLocationAreaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationAreaPage({ params }: EditLocationAreaPageProps) {
  const { id } = await params;
  
  const locationArea = await locationAreaService.findById(id);
  if (!locationArea) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/location-areas">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <EditLocationAreaForm locationArea={locationArea} />
    </div>
  );
}
