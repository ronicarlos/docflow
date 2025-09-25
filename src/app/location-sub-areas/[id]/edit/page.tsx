import { notFound } from 'next/navigation';
import * as locationSubAreaService from '@/services/locationSubAreaService';
import * as locationAreaService from '@/services/locationAreaService';
import EditLocationSubAreaForm from '@/components/location-sub-areas/edit-location-sub-area-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditLocationSubAreaPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationSubAreaPage({ params }: EditLocationSubAreaPageProps) {
  const { id } = await params;
  
  const subArea = await locationSubAreaService.findById(id);
  if (!subArea) {
    notFound();
  }

  const locationAreas = await locationAreaService.findAll();
  
  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/location-sub-areas">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <EditLocationSubAreaForm subArea={subArea} locationAreas={locationAreas} />
    </div>
  );
}
