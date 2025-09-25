import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // 1. Criar Tenant
  const tenant = await prisma.tenant.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      name: 'DocFlow Empresa Exemplo',
      cnpj: '12.345.678/0001-90',
      commercialPhone: '(11) 99999-9999',
      commercialEmail: 'contato@docflow.com.br',
      plan: 'PREMIUM',
      subscriptionStatus: 'ACTIVE',
      subscriptionStartDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      accountOwnerName: 'Roni Carlos',
      accountOwnerEmail: 'ronicarlos@gmail.com',
      paymentGatewayStatus: 'ACTIVE',
      isActive: true,
      addressStreet: 'Rua das Empresas',
      addressNumber: '123',
      addressComplement: 'Sala 456',
      addressNeighborhood: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZipCode: '01234-567',
      addressCountry: 'Brasil'
    }
  })

  console.log('✅ Tenant criado:', tenant.name)

  // 2. Criar Usuário Principal
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'ronicarlos@gmail.com' },
    update: {},
    create: {
      email: 'ronicarlos@gmail.com',
      name: 'Roni Carlos',
      area: 'Administração',
      role: 'SuperAdmin',
      password: hashedPassword,
      canCreateRecords: true,
      canEditRecords: true,
      canDeleteRecords: true,
      canDownloadDocuments: true,
      canApproveDocuments: true,
      canPrintDocuments: true,
      isActive: true,
      tenantId: tenant.id
    }
  })

  console.log('✅ Usuário criado:', user.name)

  // 3. Criar Disciplinas
  const disciplines = [
    { name: 'Engenharia Civil', code: 'ENG-CIV', description: 'Documentos relacionados à engenharia civil', color: '#3B82F6' },
    { name: 'Engenharia Elétrica', code: 'ENG-ELE', description: 'Documentos relacionados à engenharia elétrica', color: '#F59E0B' },
    { name: 'Engenharia Mecânica', code: 'ENG-MEC', description: 'Documentos relacionados à engenharia mecânica', color: '#10B981' },
    { name: 'Segurança do Trabalho', code: 'SEG-TRA', description: 'Documentos de segurança e saúde ocupacional', color: '#EF4444' },
    { name: 'Qualidade', code: 'QUA', description: 'Documentos de controle de qualidade', color: '#8B5CF6' },
    { name: 'Meio Ambiente', code: 'AMB', description: 'Documentos ambientais e sustentabilidade', color: '#059669' }
  ]

  for (const disciplineData of disciplines) {
    await prisma.discipline.upsert({
      where: { 
        tenantId_code: { 
          tenantId: tenant.id, 
          code: disciplineData.code 
        } 
      },
      update: {},
      create: {
        ...disciplineData,
        tenantId: tenant.id
      }
    })
  }

  console.log('✅ Disciplinas criadas:', disciplines.length)

  // 4. Criar Áreas de Localização
  const locationAreas = [
    { name: 'Área Industrial', code: 'AI-001', description: 'Área de produção industrial' },
    { name: 'Área Administrativa', code: 'AA-001', description: 'Área de escritórios e administração' },
    { name: 'Área de Manutenção', code: 'AM-001', description: 'Área de manutenção e oficinas' },
    { name: 'Área de Armazenagem', code: 'AR-001', description: 'Área de estoque e armazenagem' },
    { name: 'Área Externa', code: 'AE-001', description: 'Área externa e pátio' }
  ]

  for (const areaData of locationAreas) {
    await prisma.locationArea.upsert({
      where: { 
        tenantId_code: { 
          tenantId: tenant.id, 
          code: areaData.code 
        } 
      },
      update: {},
      create: {
        ...areaData,
        tenantId: tenant.id
      }
    })
  }

  console.log('✅ Áreas de localização criadas:', locationAreas.length)

  // 5. Criar Contratos
  const contracts = [
    {
      name: 'Contrato de Construção Civil - Edifício Comercial',
      internalCode: 'CC-2024-001',
      client: 'Construtora ABC Ltda',
      scope: 'Construção de edifício comercial de 15 andares',
      startDate: '2024-01-15',
      endDate: '2025-12-31',
      status: 'active' as const,
      commonRisks: ['Atraso na entrega', 'Problemas estruturais', 'Condições climáticas'],
      alertKeywords: ['estrutural', 'fundação', 'concreto', 'aço'],
      analysisDocumentTypeIds: [],
      createdById: user.id,
      responsibleUserId: user.id
    },
    {
      name: 'Contrato de Manutenção Elétrica Industrial',
      internalCode: 'ME-2024-002',
      client: 'Indústria XYZ S.A.',
      scope: 'Manutenção preventiva e corretiva de sistemas elétricos',
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      status: 'active' as const,
      commonRisks: ['Falha elétrica', 'Parada de produção', 'Segurança elétrica'],
      alertKeywords: ['elétrico', 'transformador', 'painel', 'motor'],
      analysisDocumentTypeIds: [],
      createdById: user.id,
      responsibleUserId: user.id
    },
    {
      name: 'Contrato de Consultoria em Segurança do Trabalho',
      internalCode: 'ST-2024-003',
      client: 'Empresa Segura Ltda',
      scope: 'Consultoria e treinamentos em segurança ocupacional',
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      status: 'active' as const,
      commonRisks: ['Acidentes de trabalho', 'Não conformidades regulamentares'],
      alertKeywords: ['segurança', 'EPI', 'treinamento', 'acidente'],
      analysisDocumentTypeIds: [],
      createdById: user.id,
      responsibleUserId: user.id
    }
  ]

  const createdContracts = []
  for (const contractData of contracts) {
    const contract = await prisma.contract.upsert({
      where: { 
        tenantId_internalCode: { 
          tenantId: tenant.id, 
          internalCode: contractData.internalCode 
        } 
      },
      update: {},
      create: {
        ...contractData,
        tenantId: tenant.id
      }
    })
    createdContracts.push(contract)
  }

  console.log('✅ Contratos criados:', createdContracts.length)

  // 6. Criar Tipos de Documento
  const disciplineRecords = await prisma.discipline.findMany({
    where: { tenantId: tenant.id }
  })

  const documentTypes = [
    {
      name: 'Projeto Estrutural',
      code: 'PE-001',
      requiredFields: ['description', 'area', 'elaborationDate'],
      requiresCriticalAnalysis: true,
      criticalAnalysisDays: 7,
      disciplineId: disciplineRecords.find(d => d.code === 'ENG-CIV')?.id || disciplineRecords[0].id
    },
    {
      name: 'Diagrama Elétrico',
      code: 'DE-001',
      requiredFields: ['description', 'area', 'elaborationDate'],
      requiresCriticalAnalysis: true,
      criticalAnalysisDays: 5,
      disciplineId: disciplineRecords.find(d => d.code === 'ENG-ELE')?.id || disciplineRecords[1].id
    },
    {
      name: 'Manual de Operação',
      code: 'MO-001',
      requiredFields: ['description', 'area', 'elaborationDate'],
      requiresCriticalAnalysis: false,
      criticalAnalysisDays: 0,
      disciplineId: disciplineRecords.find(d => d.code === 'ENG-MEC')?.id || disciplineRecords[2].id
    },
    {
      name: 'Procedimento de Segurança',
      code: 'PS-001',
      requiredFields: ['description', 'area', 'elaborationDate'],
      requiresCriticalAnalysis: true,
      criticalAnalysisDays: 3,
      disciplineId: disciplineRecords.find(d => d.code === 'SEG-TRA')?.id || disciplineRecords[3].id
    },
    {
      name: 'Plano de Qualidade',
      code: 'PQ-001',
      requiredFields: ['description', 'area', 'elaborationDate'],
      requiresCriticalAnalysis: true,
      criticalAnalysisDays: 5,
      disciplineId: disciplineRecords.find(d => d.code === 'QUA')?.id || disciplineRecords[4].id
    },
    {
      name: 'Relatório Ambiental',
      code: 'RA-001',
      requiredFields: ['description', 'area', 'elaborationDate'],
      requiresCriticalAnalysis: true,
      criticalAnalysisDays: 10,
      disciplineId: disciplineRecords.find(d => d.code === 'AMB')?.id || disciplineRecords[5].id
    }
  ]

  for (const docTypeData of documentTypes) {
    await prisma.documentType.upsert({
      where: { 
        tenantId_code: { 
          tenantId: tenant.id, 
          code: docTypeData.code 
        } 
      },
      update: {},
      create: {
        ...docTypeData,
        tenantId: tenant.id
      }
    })
  }

  console.log('✅ Tipos de documento criados:', documentTypes.length)

  // 7. Criar Empresas
  const companies = [
    { nome: 'Fornecedor ABC Materiais', tipo: 'FORNECEDOR' as const },
    { nome: 'Fornecedor XYZ Equipamentos', tipo: 'FORNECEDOR' as const },
    { nome: 'Cliente Construtora Exemplo', tipo: 'CLIENTE' as const },
    { nome: 'Cliente Indústria Modelo', tipo: 'CLIENTE' as const },
    { nome: 'Fornecedor 123 Serviços', tipo: 'FORNECEDOR' as const }
  ]

  for (const companyData of companies) {
    await prisma.company.create({
      data: {
        ...companyData,
        tenantId: tenant.id
      }
    })
  }

  console.log('✅ Empresas criadas:', companies.length)

  // 8. Criar Documentos de Exemplo
  const locationAreaRecords = await prisma.locationArea.findMany({
    where: { tenantId: tenant.id }
  })
  
  const documentTypeRecords = await prisma.documentType.findMany({
    where: { tenantId: tenant.id }
  })

  const documents = [
    {
      code: 'DOC-2024-001',
      description: 'Projeto estrutural do edifício comercial - Fundações',
      area: 'Engenharia',
      elaborationDate: '2024-01-20',
      lastStatusChangeDate: '2024-01-25',
      status: 'approved' as const,
      validityDays: 365,
      requiresContinuousImprovement: true,
      nextReviewDate: '2025-01-20',
      currentRevisionNumber: 'Rev. 01',
      currentRevisionDescription: 'Versão inicial aprovada',
      currentRevisionDate: '2024-01-25',
      currentRevisionCreatedById: user.id,
      contractId: createdContracts[0].id,
      documentTypeId: documentTypeRecords[0].id,
      disciplineId: disciplineRecords[0].id,
      locationAreaId: locationAreaRecords[0].id,
      createdById: user.id,
      responsibleUserId: user.id,
      approverId: user.id
    },
    {
      code: 'DOC-2024-002',
      description: 'Diagrama elétrico - Painel principal de distribuição',
      area: 'Elétrica',
      elaborationDate: '2024-02-05',
      lastStatusChangeDate: '2024-02-10',
      status: 'pending_approval' as const,
      validityDays: 180,
      requiresContinuousImprovement: false,
      nextReviewDate: '2024-08-05',
      currentRevisionNumber: 'Rev. 00',
      currentRevisionDescription: 'Versão para aprovação',
      currentRevisionDate: '2024-02-10',
      currentRevisionCreatedById: user.id,
      contractId: createdContracts[1].id,
      documentTypeId: documentTypeRecords[1].id,
      disciplineId: disciplineRecords[1].id,
      locationAreaId: locationAreaRecords[1].id,
      createdById: user.id,
      responsibleUserId: user.id
    },
    {
      code: 'DOC-2024-003',
      description: 'Procedimento de segurança para trabalho em altura',
      area: 'Segurança',
      elaborationDate: '2024-03-01',
      lastStatusChangeDate: '2024-03-05',
      status: 'approved' as const,
      validityDays: 90,
      requiresContinuousImprovement: true,
      nextReviewDate: '2024-06-01',
      currentRevisionNumber: 'Rev. 02',
      currentRevisionDescription: 'Atualização com novas normas',
      currentRevisionDate: '2024-03-05',
      currentRevisionCreatedById: user.id,
      contractId: createdContracts[2].id,
      documentTypeId: documentTypeRecords[3].id,
      disciplineId: disciplineRecords[3].id,
      locationAreaId: locationAreaRecords[2].id,
      createdById: user.id,
      responsibleUserId: user.id,
      approverId: user.id
    }
  ]

  for (const docData of documents) {
    await prisma.document.upsert({
      where: { 
        tenantId_code: { 
          tenantId: tenant.id, 
          code: docData.code 
        } 
      },
      update: {},
      create: {
        ...docData,
        tenantId: tenant.id
      }
    })
  }

  console.log('✅ Documentos criados:', documents.length)

  console.log('🎉 Seed concluído com sucesso!')
  console.log(`📧 Usuário criado: ${user.email}`)
  console.log(`🔑 Senha padrão: 123456`)
  console.log(`🏢 Tenant: ${tenant.name}`)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })