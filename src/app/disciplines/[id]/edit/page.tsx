import { notFound } from 'next/navigation';
import * as disciplineService from '@/services/disciplineService';
import EditDisciplineForm from '@/components/disciplines/edit-discipline-form';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditDisciplinePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDisciplinePage({ params }: EditDisciplinePageProps) {
  const { id } = await params;
  
  const discipline = await disciplineService.findById(id);
  if (!discipline) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
       <Button variant="outline" asChild className="mb-6">
        <Link href="/disciplines">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Link>
      </Button>
      <EditDisciplineForm discipline={discipline} />
    </div>
  );
}
