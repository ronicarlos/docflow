import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { sign } from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, companyName } = await request.json();

    // Validação dos campos obrigatórios
    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Validação do formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validação da senha
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await hash(password, 12);

    // Criar tenant (empresa) e usuário em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar o tenant
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          cnpj: '00.000.000/0000-00', // CNPJ temporário - deve ser atualizado depois
          accountOwnerName: name,
          accountOwnerEmail: email,
          subscriptionStartDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
          addressStreet: 'Não informado',
          addressNumber: 'S/N',
          addressNeighborhood: 'Não informado',
          addressCity: 'Não informado',
          addressState: 'Não informado',
          addressZipCode: '00000-000',
          isActive: true
        }
      });

      // Criar o usuário administrador
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'Admin', // Corrigido: usar 'Admin' em vez de 'ADMIN'
          area: 'Administração', // Adicionado campo obrigatório 'area'
          tenantId: tenant.id,
          isActive: true
        },
        include: {
          tenant: true
        }
      });

      return { user, tenant };
    });

    // Criar token JWT
    const token = sign(
      {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.user.tenantId
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Definir cookie alinhado com o login/middleware
    const COOKIE_NAME = 'docflow-session';
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/'
    });

    // Retornar dados do usuário (sem senha)
    const { password: _, ...userWithoutPassword } = result.user;

    return NextResponse.json({
      message: 'Cadastro realizado com sucesso',
      user: userWithoutPassword,
      tenant: result.tenant
    });

  } catch (error) {
    // 🔍 [DEBUG] Log detalhado do erro no signup
    console.group('❌ [DEBUG] Erro no Signup - Detalhes Completos');
    console.error('🕐 Timestamp:', new Date().toISOString());
    console.error('📝 Tipo do erro:', error?.constructor?.name || 'Unknown');
    console.error('💬 Mensagem:', (error as any)?.message || 'Sem mensagem');
    console.error('🔢 Código do erro:', (error as any)?.code || 'Sem código');
    console.error('📊 Meta dados:', (error as any)?.meta || 'Sem meta');
    console.error('🗂️ Stack trace:', (error as any)?.stack || 'Sem stack');
    
    // Informações específicas do Prisma
    if ((error as any)?.code) {
      console.error('🔧 Erro do Prisma detectado:');
      console.error('  - Código:', (error as any).code);
      console.error('  - Target:', (error as any)?.meta?.target || 'N/A');
      console.error('  - Field name:', (error as any)?.meta?.field_name || 'N/A');
      console.error('  - Model name:', (error as any)?.meta?.model_name || 'N/A');
    }
    
    // Informações do ambiente
    console.error('🌍 Ambiente:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? '***CONFIGURADO***' : '❌ NÃO CONFIGURADO',
      JWT_SECRET: process.env.JWT_SECRET ? '***CONFIGURADO***' : '❌ NÃO CONFIGURADO'
    });
    
    console.error('📋 Erro completo:', error);
    console.groupEnd();

    // Determinar mensagem de erro específica
    let errorMessage = 'Erro interno do servidor';
    let debugInfo = {};

    if ((error as any)?.code === 'P2002') {
      errorMessage = 'Email já cadastrado no sistema';
      debugInfo = { code: 'P2002', field: (error as any)?.meta?.target };
    } else if ((error as any)?.code === 'P2003') {
      errorMessage = 'Erro de referência no banco de dados';
      debugInfo = { code: 'P2003', field: (error as any)?.meta?.field_name };
    } else if ((error as any)?.code === 'P1001') {
      errorMessage = 'Não foi possível conectar ao banco de dados';
      debugInfo = { code: 'P1001', connection: 'failed' };
    } else if ((error as any)?.code === 'P2025') {
      errorMessage = 'Registro não encontrado';
      debugInfo = { code: 'P2025', cause: (error as any)?.meta?.cause };
    }

    return NextResponse.json(
      { 
        message: errorMessage,
        debugInfo: {
          timestamp: new Date().toISOString(),
          errorType: error?.constructor?.name || 'Unknown',
          code: (error as any)?.code || null,
          meta: (error as any)?.meta || null,
          ...debugInfo
        }
      },
      { status: 500 }
    );
  }
}