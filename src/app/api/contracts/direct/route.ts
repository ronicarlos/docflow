import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/postgres';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      contractType,
      value,
      startDate,
      endDate,
      clientName,
      clientEmail,
      clientPhone,
      status = 'DRAFT'
    } = body;

    // Validação básica
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Título e descrição são obrigatórios' },
        { status: 400 }
      );
    }

    // Inserir contrato diretamente no PostgreSQL
    const insertQuery = `
      INSERT INTO "contracts" (
        id, name, "internalCode", client, scope, "startDate", "endDate",
        status, "createdAt", "updatedAt", "tenantId", "createdById"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9
      ) RETURNING *
    `;

    const values = [
      title, // name
      `CONT-${Date.now()}`, // internalCode
      clientName || 'Cliente não informado', // client
      description, // scope
      startDate || new Date().toISOString().split('T')[0], // startDate
      endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // endDate
      'active', // status
      user.tenantId,
      user.id
    ];

    const result = await query(insertQuery, values);
    const newContract = result.rows[0];

    console.log('Contrato criado com sucesso via conexão direta:', {
      id: newContract.id,
      name: newContract.name,
      userId: user.id,
      tenantId: user.tenantId
    });

    return NextResponse.json({
      success: true,
      contract: newContract,
      message: 'Contrato criado com sucesso via conexão direta!'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar contrato via conexão direta:', error);
    
    return NextResponse.json({
      error: 'Erro interno do servidor ao criar contrato',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar contratos do tenant do usuário
    const selectQuery = `
      SELECT * FROM "contracts" 
      WHERE "tenantId" = $1 
      ORDER BY "createdAt" DESC
    `;

    const result = await query(selectQuery, [user.tenantId]);
    const contracts = result.rows;

    return NextResponse.json({
      success: true,
      contracts,
      count: contracts.length
    });

  } catch (error) {
    console.error('Erro ao buscar contratos via conexão direta:', error);
    
    return NextResponse.json({
      error: 'Erro interno do servidor ao buscar contratos',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}