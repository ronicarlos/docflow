import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'docflow-session';

export async function POST(request: NextRequest) {
  try {
    // Remover cookie de sessão
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    return NextResponse.json({
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Também permitir GET para logout via link
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);

    // Redirecionar para página de login
    return NextResponse.redirect(new URL('/login', request.url));

  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}