import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

const COOKIE_NAME = 'docflow-session';

export async function GET(req: NextRequest) {
  try {
    console.log('🔍 [/api/auth/me] Iniciando verificação de autenticação');
    
    const token = req.cookies.get(COOKIE_NAME)?.value;
    console.log('🍪 [/api/auth/me] Cookie encontrado:', token ? 'SIM' : 'NÃO');
    console.log('🍪 [/api/auth/me] Nome do cookie:', COOKIE_NAME);
    console.log('🍪 [/api/auth/me] Todos os cookies:', req.cookies.getAll());

    if (!token) {
      console.log('❌ [/api/auth/me] Token não encontrado - retornando 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔐 [/api/auth/me] Verificando JWT token...');
    const { payload } = await jwtVerify(token, JWT_SECRET);
    console.log('✅ [/api/auth/me] JWT verificado com sucesso');
    console.log('📋 [/api/auth/me] Payload do JWT:', payload);

    const userId = String(payload.userId || '');
    console.log('👤 [/api/auth/me] User ID extraído:', userId);
    
    if (!userId) {
      console.log('❌ [/api/auth/me] User ID inválido - retornando 401');
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    console.log('🔍 [/api/auth/me] Buscando usuário no banco de dados...');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      console.log('❌ [/api/auth/me] Usuário não encontrado no banco - retornando 404');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ [/api/auth/me] Usuário encontrado:', { id: user.id, email: user.email, name: user.name });

    const { password, ...userWithoutPassword } = user as any;

    console.log('✅ [/api/auth/me] Retornando dados do usuário com sucesso');
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.group('❌ [/api/auth/me] Erro capturado:');
    console.error('🕐 Timestamp:', new Date().toISOString());
    console.error('📝 Tipo do erro:', error?.constructor?.name || 'Unknown');
    console.error('💬 Mensagem:', (error as any)?.message || 'Sem mensagem');
    console.error('🔢 Código do erro:', (error as any)?.code || 'Sem código');
    console.error('🗂️ Stack trace:', (error as any)?.stack || 'Sem stack');
    console.error('📋 Erro completo:', error);
    console.groupEnd();
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}