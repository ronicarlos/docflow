
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  try {
    // Verificar se o usuário está autenticado
    const user = await getCurrentUser();
    
    if (user) {
      // Se autenticado, redirecionar para o dashboard
      redirect('/dashboard');
    } else {
      // Se não autenticado, redirecionar para login
      redirect('/login');
    }
  } catch (error) {
    // Em caso de erro, redirecionar para login
    redirect('/login');
  }
}
