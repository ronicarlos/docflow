
'use server';

import InstrumentForm from '@/components/quality-modules/equipment-control/instrument-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import * as calibrationInstrumentService from '@/services/calibrationInstrumentService';
import { notFound } from 'next/navigation';

interface EditInstrumentPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditInstrumentPage({ params }: EditInstrumentPageProps) {
    const { id } = await params;
    const instrument = await calibrationInstrumentService.findById(id);

    if (!instrument) {
        notFound();
    }
    
    return (
        <div className="container mx-auto py-8 px-4">
             <Button variant="outline" asChild className="mb-6">
                <Link href="/quality-modules/equipment-control">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
                </Link>
            </Button>
            <InstrumentForm instrument={instrument} />
        </div>
    );
}
