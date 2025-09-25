
'use server';

import { redirect } from 'next/navigation';

// Esta página agora é tratada por um modal na página de lista.
// Redirecionamos para a página principal para evitar acesso direto e erros.
export default async function EditDocumentTypePage() {
    redirect('/document-types');
}
