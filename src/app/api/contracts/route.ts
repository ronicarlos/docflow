import { NextRequest, NextResponse } from 'next/server';
import { ContractDrizzleService } from '@/services/contract-drizzle.service';
import { getContracts } from '@/actions/contractActions';
import { getCurrentUser } from '@/lib/auth';

// Função de validação simples para a API
function validateCreateContractData(data: any): { success: boolean; data?: any; error?: string } {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Nome do contrato é obrigatório');
  } else if (data.name.trim().length < 3) {
    errors.push('Nome deve ter pelo menos 3 caracteres');
  } else if (data.name.trim().length > 255) {
    errors.push('Nome deve ter no máximo 255 caracteres');
  }

  if (!data.internalCode || typeof data.internalCode !== 'string' || data.internalCode.trim().length === 0) {
    errors.push('Código interno é obrigatório');
  } else if (data.internalCode.trim().length < 2) {
    errors.push('Código interno deve ter pelo menos 2 caracteres');
  } else if (data.internalCode.trim().length > 50) {
    errors.push('Código interno deve ter no máximo 50 caracteres');
  }

  if (!data.client || typeof data.client !== 'string' || data.client.trim().length === 0) {
    errors.push('Cliente é obrigatório');
  } else if (data.client.trim().length < 2) {
    errors.push('Nome do cliente deve ter pelo menos 2 caracteres');
  } else if (data.client.trim().length > 255) {
    errors.push('Nome do cliente deve ter no máximo 255 caracteres');
  }

  if (!data.startDate) {
    errors.push('Data de início é obrigatória');
  } else {
    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      errors.push('Data de início inválida');
    }
  }

  if (!data.endDate) {
    errors.push('Data de fim é obrigatória');
  } else {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      errors.push('Data de fim inválida');
    } else if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (!isNaN(startDate.getTime()) && endDate <= startDate) {
        errors.push('Data de fim deve ser posterior à data de início');
      }
    }
  }

  if (data.status && !['active', 'inactive'].includes(data.status)) {
    errors.push('Status deve ser "active" ou "inactive"');
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join(', ') };
  }

  return { success: true, data };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [API] POST /api/contracts - Iniciando...');
    
    // Verificar autenticação
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.log('❌ [API] Usuário não autenticado');
      return NextResponse.json(
        { success: false, error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }
    
    console.log('👤 [API] Usuário autenticado:', {
      id: currentUser.id,
      email: currentUser.email,
      tenantId: currentUser.tenantId
    });
    
    const formData = await request.formData();
    console.log('📋 [API] FormData recebido');
    
    // Log dos dados recebidos
    const entries = Array.from(formData.entries());
    console.log('📝 [API] Dados do FormData:', entries.map(([key, value]) => `${key}: ${value}`));
    
    // Extrair dados do FormData
    const data = {
      name: formData.get('name') as string,
      internalCode: formData.get('internalCode') as string,
      client: formData.get('client') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: formData.get('status') as string,
      description: formData.get('description') as string || '',
      value: formData.get('value') ? parseFloat(formData.get('value') as string) : undefined,
      responsibleUserId: formData.get('responsibleUserId') as string || undefined,
      commonRisks: formData.getAll('commonRisks') as string[],
      alertKeywords: formData.getAll('alertKeywords') as string[],
    };
    
    console.log('🔍 [API] Dados extraídos:', data);
    
    // Validar dados
    const validation = validateCreateContractData(data);
    if (!validation.success) {
      console.log('❌ [API] Validação falhou:', validation.error);
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }
    
    console.log('✅ [API] Validação passou');
    
    // Usar dados do usuário autenticado
    const contractData = {
      ...validation.data,
      responsibleUserId: null // Não definir usuário responsável para evitar erro de FK
    };
    
    // Criar contrato usando o tenantId e userId do usuário logado
    const contract = await ContractDrizzleService.create(
      contractData,
      currentUser.tenantId,
      currentUser.id
    );
    
    console.log('✅ [API] Contrato criado com sucesso:', contract.id);
    
    return NextResponse.json(
      { success: true, contract },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 [API] Erro na rota POST /api/contracts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [API] GET /api/contracts - Iniciando...');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const statusParam = searchParams.get('status');
    const filters = {
      status: statusParam && statusParam !== 'all' ? statusParam as 'active' | 'inactive' : undefined,
      responsibleUserId: searchParams.get('responsibleUserId') || undefined,
      client: searchParams.get('client') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
    };
    
    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });
    
    const result = await getContracts(filters, page, limit);
    console.log('✅ [API] Resultado da busca:', { success: result.success, total: result.data?.total });
    
    if (result.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('💥 [API] Erro na rota GET /api/contracts:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}