
'use server';

import { redirect } from 'next/navigation';

// Este componente não é mais necessário, pois a funcionalidade é tratada pelo formulário em /sgq-procedures/new/edit.
// Redireciona para a lista principal para evitar acesso direto a uma página órfã.
export default async function ProcedureEditPage() {
  redirect('/sgq-procedures');
}
