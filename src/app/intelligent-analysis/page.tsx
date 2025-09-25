
'use server';
import { redirect } from 'next/navigation';

// A funcionalidade desta página foi movida e aprimorada para dentro da gestão de contratos.
// Redirecionamos para a tela de contratos.
export default async function IntelligentAnalysisPage() {
  redirect('/contracts');
}
