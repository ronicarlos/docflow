import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromHeaders } from '@/lib/auth';
import { updateUserProfile } from '@/services/userService';
import { z } from 'zod';

// Schema de validação para atualização do perfil
const updateProfileSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido'),
  area: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
});

export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticação
    const currentUser = await getCurrentUserFromHeaders();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Validar dados do corpo da requisição
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // Atualizar perfil do usuário
    const updatedUser = await updateUserProfile(currentUser.id, {
      name: validatedData.name,
      email: validatedData.email,
      area: validatedData.area,
      avatarUrl: validatedData.avatarUrl || undefined
    });

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        area: updatedUser.area,
        avatarUrl: updatedUser.avatarUrl
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Dados inválidos',
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const currentUser = await getCurrentUserFromHeaders();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        area: currentUser.area,
        avatarUrl: currentUser.avatarUrl,
        tenantId: currentUser.tenantId
      }
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}