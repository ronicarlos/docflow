
'use server';

import InstrumentForm from '@/components/quality-modules/equipment-control/instrument-form';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewInstrumentPage() {
    // In the future, we might fetch lists for dropdowns here (e.g., equipment types, brands)
    return (
        <div className="container mx-auto py-8 px-4">
             <Button variant="outline" asChild className="mb-6">
                <Link href="/quality-modules/equipment-control">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
                </Link>
            </Button>
            <InstrumentForm />
        </div>
    );
}
