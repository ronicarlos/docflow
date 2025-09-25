
import { redirect } from 'next/navigation';

// Esta página foi substituída pelo componente de formulário reutilizável
// que pode ser acessado diretamente. Redirecionando para evitar uma página em branco.
export default async function NewSgqProcedurePage() {
    redirect('/sgq-procedures');
}
