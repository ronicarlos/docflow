import { PrismaClient, UserRole, DocumentStatus, ContractStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create default tenant
  const defaultTenant = await prisma.tenant.upsert({
    where: { name: 'DocFlow Default' },
    update: {},
    create: {
      name: 'DocFlow Default',
      cnpj: '00.000.000/0001-00',
      subscriptionStartDate: new Date(),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      accountOwnerName: 'Admin',
      accountOwnerEmail: 'admin@docflow.com',
      addressStreet: 'Rua Principal',
      addressNumber: '123',
      addressNeighborhood: 'Centro',
      addressCity: 'São Paulo',
      addressState: 'SP',
      addressZipCode: '01000-000',
      isActive: true,
    }
  })

  console.log('✅ Default tenant created:', defaultTenant.name)

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@docflow.com' },
    update: {},
    create: {
      email: 'admin@docflow.com',
      password: '$2b$10$1UlqojKp8U.MXIhrOe2xXu094sLIUSyNEx8oTF5xgruFrJrp3snFe', // senha: admin123 (hash bcrypt)
      name: 'Administrador DocFlow',
      area: 'Administração',
      role: UserRole.Admin,
      tenantId: defaultTenant.id,
      isActive: true
    }
  })

  console.log('✅ Admin user created:', adminUser.email)

  // Create default document types
  const documentTypes = [
    { name: 'Procedimento', code: 'PROC', description: 'Procedimentos operacionais padrão' },
    { name: 'Instrução de Trabalho', code: 'IT', description: 'Instruções detalhadas de trabalho' },
    { name: 'Política', code: 'POL', description: 'Políticas organizacionais' },
    { name: 'Manual', code: 'MAN', description: 'Manuais técnicos e operacionais' },
    { name: 'Formulário', code: 'FORM', description: 'Formulários e registros' },
    { name: 'Certificado', code: 'CERT', description: 'Certificados e comprovantes' },
    { name: 'Contrato', code: 'CONT', description: 'Contratos e acordos' },
    { name: 'Ata de Reunião', code: 'ATA', description: 'Atas e registros de reuniões' }
  ]

  // First create a default discipline
  const defaultDiscipline = await prisma.discipline.upsert({
    where: {
      tenantId_code: {
        tenantId: defaultTenant.id,
        code: 'GERAL'
      }
    },
    update: {},
    create: {
      name: 'Geral',
      code: 'GERAL',
      description: 'Disciplina geral',
      tenantId: defaultTenant.id,
      isActive: true
    }
  })

  for (const docType of documentTypes) {
    await prisma.documentType.upsert({
      where: { 
        tenantId_code: {
          tenantId: defaultTenant.id,
          code: docType.code
        }
      },
      update: {},
      create: {
        name: docType.name,
        code: docType.code,
        tenantId: defaultTenant.id,
        disciplineId: defaultDiscipline.id,
        isActive: true
      }
    })
  }

  console.log('✅ Document types created')

  // Create default disciplines
  const disciplines = [
    { name: 'Qualidade', code: 'QUAL', description: 'Sistema de Gestão da Qualidade', color: '#3B82F6' },
    { name: 'Segurança', code: 'SEG', description: 'Segurança do Trabalho', color: '#EF4444' },
    { name: 'Meio Ambiente', code: 'MA', description: 'Gestão Ambiental', color: '#10B981' },
    { name: 'Recursos Humanos', code: 'RH', description: 'Gestão de Pessoas', color: '#F59E0B' },
    { name: 'Financeiro', code: 'FIN', description: 'Gestão Financeira', color: '#8B5CF6' },
    { name: 'Operacional', code: 'OP', description: 'Processos Operacionais', color: '#6B7280' },
    { name: 'Tecnologia', code: 'TI', description: 'Tecnologia da Informação', color: '#06B6D4' },
    { name: 'Jurídico', code: 'JUR', description: 'Assuntos Jurídicos', color: '#84CC16' }
  ]

  for (const discipline of disciplines) {
    await prisma.discipline.upsert({
      where: { 
        tenantId_code: {
          tenantId: defaultTenant.id,
          code: discipline.code
        }
      },
      update: {},
      create: {
        ...discipline,
        tenantId: defaultTenant.id,
        isActive: true
      }
    })
  }

  console.log('✅ Disciplines created')

  // Create default location areas
  const locationAreas = [
    { name: 'Sede Principal', code: 'SEDE', description: 'Escritório principal da empresa' },
    { name: 'Filial Norte', code: 'FIL_N', description: 'Filial região norte' },
    { name: 'Filial Sul', code: 'FIL_S', description: 'Filial região sul' },
    { name: 'Centro de Distribuição', code: 'CD', description: 'Centro de distribuição logística' },
    { name: 'Laboratório', code: 'LAB', description: 'Laboratório de análises' },
    { name: 'Fábrica', code: 'FAB', description: 'Unidade fabril' }
  ]

  for (const locationArea of locationAreas) {
    await prisma.locationArea.upsert({
      where: { 
        tenantId_code: {
          tenantId: defaultTenant.id,
          code: locationArea.code
        }
      },
      update: {},
      create: {
        ...locationArea,
        tenantId: defaultTenant.id,
        isActive: true
      }
    })
  }

  console.log('✅ Location areas created')

  // Create default contract
  const defaultContract = await prisma.contract.upsert({
    where: {
      tenantId_internalCode: {
        tenantId: defaultTenant.id,
        internalCode: 'CONT-001'
      }
    },
    update: {},
    create: {
      name: 'Contrato Padrão',
      internalCode: 'CONT-001',
      client: 'Cliente Exemplo',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 ano
      status: 'active',
      tenantId: defaultTenant.id,
      responsibleUserId: adminUser.id,
      createdById: adminUser.id
    }
  })

  console.log('✅ Default contract created')

  // Create sample documents
  const qualityDiscipline = await prisma.discipline.findFirst({
    where: { name: 'Qualidade', tenantId: defaultTenant.id }
  })

  const procedureType = await prisma.documentType.findFirst({
    where: { name: 'Procedimento', tenantId: defaultTenant.id }
  })

  if (qualityDiscipline && procedureType) {
    await prisma.document.upsert({
      where: { 
        tenantId_code: {
          tenantId: defaultTenant.id,
          code: 'PROC-001'
        }
      },
      update: {},
      create: {
        code: 'PROC-001',
        description: 'Procedimento para controle e gestão de documentos do SGQ',
        area: 'Qualidade',
        elaborationDate: new Date().toISOString(),
        lastStatusChangeDate: new Date().toISOString(),
        status: 'approved',
        currentRevisionNumber: 'R00',
        currentRevisionDescription: 'Versão inicial',
        currentRevisionDate: new Date().toISOString(),
        tenantId: defaultTenant.id,
        contractId: defaultContract.id,
        createdById: adminUser.id,
        responsibleUserId: adminUser.id,
        documentTypeId: procedureType.id,
        disciplineId: qualityDiscipline.id,
        currentRevisionCreatedById: adminUser.id
      }
    })
  }

  console.log('✅ Sample documents created')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })