import { NextResponse } from 'next/server';
import { findAllUsers } from '@/services/userService';

export async function GET() {
  try {
    // Para desenvolvimento, vamos buscar usuários de todos os tenants
    // Em produção, isso seria filtrado por tenant específico
    const users = await findAllUsers();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}