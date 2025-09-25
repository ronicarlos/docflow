import NewLocationSubAreaForm from '@/components/location-sub-areas/new-location-sub-area-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import * as locationAreaService from '@/services/locationAreaService';

export default async function NewLocationSubAreaPage() {
  const locationAreas = await locationAreaService.findAll();

  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/location-sub-areas">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <NewLocationSubAreaForm locationAreas={locationAreas} />
    </div>
  );
}
