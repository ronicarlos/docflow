###nao utilizar essa documentação pois a migração ja foi toda feita######


# Plano de Refatoração: MongoDB + Mongoose → PostgreSQL + Prisma



## Sumário Executivo

Este documento apresenta um plano detalhado para migração do projeto HubFlow da stack atual MongoDB + Mongoose para PostgreSQL + Prisma, mantendo a integridade dos dados e funcionalidades existentes.

## 1. Análise Comparativa das Tecnologias

### 1.1 Tecnologias Atuais vs Propostas

| Aspecto | MongoDB + Mongoose | PostgreSQL + Prisma |
|---------|-------------------|---------------------|
| **Tipo de Banco** | NoSQL (Documento) | SQL (Relacional) |
| **Schema** | Flexível, dinâmico | Rígido, tipado |
| **Relacionamentos** | Referências/Embedding | Foreign Keys nativos |
| **Transações** | Limitadas (single document) | ACID completas |
| **Consultas** | MongoDB Query Language | SQL padrão |
| **Tipagem** | TypeScript interfaces | Geração automática de tipos |
| **Migrações** | Manuais via scripts | Automáticas via Prisma Migrate |
| **Performance** | Boa para reads simples | Excelente para queries complexas |
| **Integridade** | Validação na aplicação | Constraints no banco |

### 1.2 Vantagens da Migração

#### PostgreSQL




- **Integridade referencial**: Constraints e foreign keys garantem consistência
- **Transações ACID**: Operações complexas com rollback automático
- **Consultas avançadas**: JOINs, CTEs, window functions
- **Performance**: Otimizações de query e índices avançados
- **Maturidade**: Banco estável com vasta documentação

#### Prisma
- **Type Safety**: Tipos TypeScript gerados automaticamente
- **Developer Experience**: IntelliSense completo e validação em tempo de compilação
- **Migrações**: Sistema robusto de versionamento de schema
- **Query Builder**: API intuitiva e type-safe
- **Introspection**: Sincronização automática com o banco

### 1.3 Desafios da Migração

- **Modelagem relacional**: Conversão de documentos aninhados para tabelas relacionadas
- **Mudança de paradigma**: De NoSQL para SQL
- **Refatoração de código**: Adaptação de todas as queries e operações
- **Migração de dados**: Transformação e transferência dos dados existentes

## 1.4 Fontes e guias de referência

- [Fonte: Guia de migração Mongoose → Prisma](https://www.prisma.io/docs/guides/migrate-from-mongoose)
- [Subdocumentos mongodb](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations#types-of-relations)
- [Types of relations](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations#types-of-relations)
- [Dynamic (create/update/delete) Form CRUD](https://github.com/prisma/prisma/discussions/11907)
- [Explicit m-n](https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/many-to-many-relations#explicit-many-to-many-relations)
- [Fonte: Uso recomendado em apps longos e Next.js](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections#prismaclient-in-long-running-applications)

## 2. Análise da Estrutura Atual

### 2.1 Modelos Identificados

O projeto HubFlow possui os seguintes modelos MongoDB:

1. **User** - Usuários do sistema
2. **Supplier** - Fornecedores com documentos e análises
3. **Order** - Pedidos com itens e respostas
4. **ServiceItem** - Itens de serviço com requisitos específicos
5. **Notification** - Notificações do sistema
6. **Log** - Logs de auditoria
7. **CompanyProfile** - Perfil da empresa
8. **FormConfiguration** - Configuração de formulários
9. **TrainingData** - Dados de treinamento

### 2.2 Características dos Modelos Atuais

#### Subdocumentos Complexos
- **Supplier**: Documentos aninhados, análises AI, checklists
- **Order**: Items e responses como arrays de objetos
- **FormConfiguration**: Campos dinâmicos com validações

#### Relacionamentos
- **User ↔ Supplier**: 1:1 via userId
- **User ↔ Order**: 1:N via createdBy
- **Supplier ↔ ServiceItem**: N:N via services array
- **Order ↔ Supplier**: N:N via invitedSuppliers

#### Exclusão lógica
- Implementado em User, Supplier, Order, ServiceItem
- Campos: isDeleted, deletedAt, deletedBy

## 3. Plano de Migração Passo a Passo

### Fase 0: Preparação e Planejamento

#### 3.1 Configuração do Ambiente

```bash
# Instalar dependências do Prisma
npm install prisma @prisma/client
npm install -D prisma

# Instalar driver PostgreSQL
npm install pg
npm install -D @types/pg

# Remover dependências MongoDB (após migração)
# npm uninstall mongodb mongoose
```

#### 3.2 Configuração do PostgreSQL

```env
# .env
DATABASE_URL="postgresql://postgres:123@localhost:5432/hubflow-comgas?schema=public"
```

#### 3.3 Inicialização do Prisma

```bash
npx prisma init
```

### Fase 1: Modelagem do Schema Relacional

#### 3.4 Schema Prisma Base

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Função para gerar UUID v7
generator uuid {
  provider = "prisma-client-js"
  previewFeatures = ["uuidV7"]
}
```

### Fase 2: Implementação dos Modelos

#### 3.5 Modelo User

```prisma
model User {
  id                    String    @id @default(uuid(7))
  email                 String    @unique
  password              String
  name                  String
  profileType           ProfileType
  role                  UserRole
  isActive              Boolean   @default(true)
  lastLogin             DateTime?
  resetPasswordToken    String?
  resetPasswordExpires  DateTime?
  rememberMe            Boolean   @default(false)
  
  // Exclusão lógica
  isDeleted             Boolean   @default(false)
  deletedAt             DateTime?
  deletedById           String?
  deletedBy             User?     @relation("UserDeletes", fields: [deletedById], references: [id])
  deletedUsers          User[]    @relation("UserDeletes")
  
  // Relacionamentos
  supplier              Supplier?
  createdOrders         Order[]   @relation("OrderCreator")
  notifications         Notification[]
  logs                  Log[]
  deletedSuppliers      Supplier[] @relation("SupplierDeletes")
  deletedOrders         Order[]    @relation("OrderDeletes")
  deletedServiceItems   ServiceItem[] @relation("ServiceItemDeletes")
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([email])
  @@index([isDeleted])
  @@index([profileType])
}

enum ProfileType {
  supplier
  admin
  system
}

enum UserRole {
  Admin
  Analyst
  Supplier
}
```

#### 3.6 Modelo Supplier

```prisma
model Supplier {
  id                              String    @id @default(uuid(7))
  userId                          String    @unique
  user                            User      @relation(fields: [userId], references: [id])
  cnpj                            String    @unique
  companyName                     String
  legalRepresentative             String
  email                           String
  phone                           String
  companySize                     String?
  hasExperience                   Boolean?
  hasIso9001                      Boolean?
  iso9001Justification            String?
  registrationStatus              RegistrationStatus @default(incomplete)
  aiStatus                        AiStatus?
  internalStatus                  InternalStatus @default(Pendente)
  lockedFields                    String[]
  
  // Exclusão lógica
  isDeleted                       Boolean   @default(false)
  deletedAt                       DateTime?
  deletedById                     String?
  deletedBy                       User?     @relation("SupplierDeletes", fields: [deletedById], references: [id])
  
  // Relacionamentos
  documents                       SupplierDocument[]
  services                        SupplierService[]
  specificRequirementResponses    SpecificRequirementResponse[]
  aiAnalysis                      SupplierAiAnalysis?
  orderResponses                  OrderResponse[]
  invitedOrders                   Order[]   @relation("OrderSuppliers")
  
  createdAt                       DateTime  @default(now())
  updatedAt                       DateTime  @updatedAt
  
  @@index([cnpj])
  @@index([isDeleted])
  @@index([aiStatus])
  @@index([internalStatus])
}

enum RegistrationStatus {
  incomplete
  pending_analysis
  complete
}

enum AiStatus {
  Apto
  AptoComRessalvas @map("Apto com ressalvas")
  Inapto
}

enum InternalStatus {
  Pendente
  Aprovado
  Rejeitado
}
```

#### 3.7 Modelos de Documentos

```prisma
model SupplierDocument {
  id              String    @id @default(uuid(7))
  supplierId      String
  supplier        Supplier  @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  documentType    String    // cnpjCard, socialContract, etc.
  name            String
  url             String
  contentType     String
  extractedText   String?
  extractedAt     DateTime?
  
  // Páginas extraídas
  extractedPages  ExtractedPage[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@unique([supplierId, documentType])
}

model ExtractedPage {
  id                    String            @id @default(uuid(7))
  supplierDocumentId    String
  supplierDocument      SupplierDocument  @relation(fields: [supplierDocumentId], references: [id], onDelete: Cascade)
  pageNumber            Int
  text                  String
  
  @@unique([supplierDocumentId, pageNumber])
}
```

#### 3.8 Modelo de Análise AI

```prisma
model SupplierAiAnalysis {
  id                    String    @id @default(uuid(7))
  supplierId            String    @unique
  supplier              Supplier  @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  
  // Análise de conformidade
  isConformant          Boolean?
  conformitySummary     String?
  
  // Avaliação de risco
  riskLevel             String?
  riskDetails           String?
  
  extractedScope        String?
  promptsUsed           Json?
  
  // Relacionamentos
  complianceChecklist   ComplianceChecklistItem[]
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model ComplianceChecklistItem {
  id                        String              @id @default(uuid(7))
  aiAnalysisId              String
  aiAnalysis                SupplierAiAnalysis  @relation(fields: [aiAnalysisId], references: [id], onDelete: Cascade)
  key                       String
  item                      String
  status                    ComplianceStatus
  reason                    String
  manualStatus              ComplianceStatus?
  manualReason              String?
  manualOverrideUserId      String?
  manualOverrideUserName    String?
  
  @@unique([aiAnalysisId, key])
}

enum ComplianceStatus {
  Atendido
  ParcialmenteAtendido @map("Parcialmente Atendido")
  NaoAtendido @map("Não Atendido")
}
```

### Fase 3: Implementação do Prisma Client

#### 3.9 Configuração do Cliente Prisma

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Fase 4: Configuração Inicial

#### 3.10 Configuração do Banco de Dados Limpo

Como você iniciará com dados vazios, esta fase focará na configuração inicial do PostgreSQL e na preparação do ambiente.

##### 3.10.1 Inicialização do Banco de Dados

```bash
# Executar migrações do Prisma
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate

# Verificar status das migrações
npx prisma migrate status
```

##### 3.10.2 Seed de Dados Iniciais (Opcional)

Caso precise de dados básicos para desenvolvimento:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import { v7 as uuidv7 } from 'uuid'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')
  
  // Criar usuário administrador padrão
  const adminPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hubflow.com' },
    update: {},
    create: {
      id: uuidv7(),
      email: 'admin@hubflow.com',
      name: 'Administrador',
      role: 'ADMIN',
      passwordHash: adminPassword,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  
  console.log('Usuário administrador criado:', adminUser.email)
  
  // Criar configurações padrão do sistema
  const defaultFormConfig = await prisma.formConfiguration.upsert({
    where: { name: 'supplier-registration' },
    update: {},
    create: {
      id: uuidv7(),
      name: 'supplier-registration',
      title: 'Cadastro de Fornecedor',
      description: 'Formulário padrão para cadastro de fornecedores',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Nome da Empresa',
          required: true,
          validation: { minLength: 2, maxLength: 100 }
        },
        {
          name: 'cnpj',
          type: 'text',
          label: 'CNPJ',
          required: true,
          validation: { pattern: '^\\d{14}$' }
        },
        {
          name: 'email',
          type: 'email',
          label: 'E-mail',
          required: true
        }
      ],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  })
  
  console.log('Configuração de formulário criada:', defaultFormConfig.name)
  
  console.log('Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

#### 3.11 Scripts de Configuração

```json
// package.json - adicionar scripts
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",
    "db:init": "npm run db:migrate && npm run db:generate && npm run db:seed"
  }
}
```

#### 3.12 Validação da Configuração

```javascript
// scripts/validate-db-setup.js
const { PrismaClient } = require('@prisma/client')

async function validateDatabaseSetup() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Validando configuração do banco de dados...')
    
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conexão com PostgreSQL estabelecida')
    
    // Verificar tabelas
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    
    console.log('✅ Tabelas encontradas:', tables.length)
    
    // Verificar se há usuário admin
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    
    if (adminUser) {
      console.log('✅ Usuário administrador encontrado')
    } else {
      console.log('⚠️  Nenhum usuário administrador encontrado')
    }
    
    console.log('\n🎉 Configuração do banco validada com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro na validação:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

validateDatabaseSetup()
```

#### 3.13 Configuração de Ambiente

```bash
# .env.example
# Banco de Dados
DATABASE_URL="postgresql://postgres:123@localhost:5432/hubflow-comgas?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Aplicação
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Email (opcional)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
```

#### 3.14 Checklist de Configuração Inicial

##### ✅ Preparação (CONCLUÍDA)
- [x] PostgreSQL instalado e rodando
- [x] Banco de dados criado (`hubflow-comgas`)
- [x] Variáveis de ambiente configuradas
- [x] Dependências instaladas (`npm install`)

##### ✅ Configuração do Prisma (CONCLUÍDA)
- [x] Schema do Prisma configurado
- [x] Migrações executadas (`npx prisma db push`)
- [x] Cliente Prisma gerado (`npx prisma generate`)
- [x] Seed executado (opcional) - não necessário para banco limpo

##### ✅ Validação (CONCLUÍDA)
- [x] Conexão com banco testada
- [x] Tabelas criadas corretamente
- [x] Aplicação iniciando sem erros
- [x] Endpoints básicos funcionando (testes 100% passando)

##### ⏳ Pós-Configuração (EM ANDAMENTO)
- [ ] Backup inicial criado
- [x] Monitoramento configurado (via testes de validação)
- [x] Logs configurados
- [x] Documentação atualizada


## 4. Estratégia UUID v7

### 4.1 Implementação de UUID v7

UUID v7 oferece vantagens significativas:
- **Ordenação temporal**: IDs são naturalmente ordenados por tempo de criação
- **Performance**: Melhor para índices B-tree
- **Compatibilidade**: Padrão UUID válido

```typescript
// lib/uuid.ts
import { v7 as uuidv7 } from 'uuid'

/**
 * Gera um UUID v7 (time-ordered)
 * @returns UUID v7 string
 */
export function generateUUIDv7(): string {
  return uuidv7()
}

/**
 * Extrai timestamp de um UUID v7
 * @param uuid UUID v7 string
 * @returns Date object
 */
export function extractTimestampFromUUIDv7(uuid: string): Date {
  const hex = uuid.replace(/-/g, '')
  const timestamp = parseInt(hex.substring(0, 12), 16)
  return new Date(timestamp)
}
```

### 4.2 Configuração no Schema

```prisma
// Usar UUID v7 como padrão
model User {
  id String @id @default(uuid(7))
  // ...
}
```

## 5. Refatoração do Código da Aplicação

### 5.1 Substituição de Actions

#### Antes (MongoDB/Mongoose)
```typescript
// src/actions/user.actions.ts
export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    await dbConnect()
    const user = await UserModel.findOne({ email }).select('-password').lean()
    return user ? { ...user, _id: user._id.toString() } : null
  } catch (error) {
    console.error('Error finding user:', error)
    return null
  }
}
```

#### Depois (PostgreSQL/Prisma)
```typescript
// src/actions/user.actions.ts
import { prisma } from '@/lib/prisma'

export async function findUserByEmail(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        profileType: true,
        role: true,
        isActive: true,
        lastLogin: true,
        rememberMe: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return user
  } catch (error) {
    console.error('Error finding user:', error)
    return null
  }
}
```

### 5.2 Queries Complexas com Relacionamentos

```typescript
// Buscar supplier com documentos e análise
export async function getSupplierWithDetails(supplierId: string) {
  return await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      documents: {
        include: {
          extractedPages: true,
        },
      },
      aiAnalysis: {
        include: {
          complianceChecklist: true,
        },
      },
      services: {
        include: {
          serviceItem: true,
        },
      },
    },
  })
}
```

### 5.3 Transações

```typescript
// Operação transacional para criar supplier completo
export async function createSupplierWithDocuments(data: CreateSupplierData) {
  return await prisma.$transaction(async (tx) => {
    // Criar supplier
    const supplier = await tx.supplier.create({
      data: {
        userId: data.userId,
        cnpj: data.cnpj,
        companyName: data.companyName,
        // ... outros campos
      },
    })
    
    // Criar documentos
    if (data.documents) {
      for (const [docType, docData] of Object.entries(data.documents)) {
        await tx.supplierDocument.create({
          data: {
            supplierId: supplier.id,
            documentType: docType,
            name: docData.name,
            url: docData.url,
            contentType: docData.contentType,
          },
        })
      }
    }
    
    return supplier
  })
}
```

## 6. Considerações de Performance

### 6.1 Índices Estratégicos

```prisma
model User {
  // ...
  @@index([email])
  @@index([isDeleted])
  @@index([profileType, role])
}

model Supplier {
  // ...
  @@index([cnpj])
  @@index([isDeleted])
  @@index([aiStatus, internalStatus])
  @@index([userId]) // FK index
}

model SupplierDocument {
  // ...
  @@index([supplierId, documentType])
}
```

### 6.2 Otimizações de Query

```typescript
// Paginação eficiente
export async function getSuppliersPaginated({
  page = 1,
  limit = 10,
  filters = {},
}: PaginationParams) {
  const skip = (page - 1) * limit
  
  const [suppliers, total] = await Promise.all([
    prisma.supplier.findMany({
      where: {
        isDeleted: false,
        ...filters,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.supplier.count({
      where: {
        isDeleted: false,
        ...filters,
      },
    }),
  ])
  
  return {
    data: suppliers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}
```

### 6.3 Connection Pooling

```typescript
// lib/prisma.ts
export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Configuração de pool no DATABASE_URL
// postgresql://user:123@localhost:5432/hubflow-comgas?connection_limit=20&pool_timeout=20
```

## 7. Plano de Testes e Validação

### 7.1 Testes de Migração

```typescript
// tests/migration.test.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

describe('Data Migration Tests', () => {
  beforeAll(async () => {
    // Reset database
    execSync('npx prisma migrate reset --force')
    execSync('npx prisma db push')
  })
  
  afterAll(async () => {
    await prisma.$disconnect()
  })
  
  test('should migrate users correctly', async () => {
    // Run migration script
    execSync('npm run migrate:users')
    
    // Verify data
    const users = await prisma.user.findMany()
    expect(users.length).toBeGreaterThan(0)
    
    // Verify specific user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    })
    expect(testUser).toBeTruthy()
    expect(testUser?.profileType).toBe('admin')
  })
  
  test('should maintain referential integrity', async () => {
    const supplier = await prisma.supplier.findFirst({
      include: {
        user: true,
        documents: true,
      },
    })
    
    expect(supplier?.user).toBeTruthy()
    expect(supplier?.documents.length).toBeGreaterThan(0)
  })
})
```

### 7.2 Testes de Performance

```typescript
// tests/performance.test.ts
describe('Performance Tests', () => {
  test('should handle large dataset queries efficiently', async () => {
    const start = Date.now()
    
    const suppliers = await prisma.supplier.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        user: true,
        documents: true,
      },
      take: 1000,
    })
    
    const duration = Date.now() - start
    expect(duration).toBeLessThan(5000) // 5 segundos
    expect(suppliers.length).toBeLessThanOrEqual(1000)
  })
})
```

### 7.3 Validação de Integridade

```typescript
// scripts/validate-migration.ts
async function validateMigration() {
  console.log('Validando integridade dos dados...')
  
  // Verificar contagens
  const [userCount, supplierCount, orderCount] = await Promise.all([
    prisma.user.count(),
    prisma.supplier.count(),
    prisma.order.count(),
  ])
  
  console.log(`Usuários: ${userCount}`)
  console.log(`Fornecedores: ${supplierCount}`)
  console.log(`Pedidos: ${orderCount}`)
  
  // Verificar relacionamentos órfãos
  const orphanSuppliers = await prisma.supplier.findMany({
    where: {
      user: null,
    },
  })
  
  if (orphanSuppliers.length > 0) {
    console.error(`Encontrados ${orphanSuppliers.length} fornecedores órfãos`)
  }
  
  // Verificar constraints
  const duplicateCNPJs = await prisma.supplier.groupBy({
    by: ['cnpj'],
    having: {
      cnpj: {
        _count: {
          gt: 1,
        },
      },
    },
  })
  
  if (duplicateCNPJs.length > 0) {
    console.error(`Encontrados CNPJs duplicados: ${duplicateCNPJs.length}`)
  }
  
  console.log('Validação concluída!')
}
```

## 8. Cronograma de Execução

### ✅ Semana 1: Preparação (CONCLUÍDA)
- [x] Configuração do ambiente PostgreSQL
- [x] Instalação e configuração do Prisma
- [x] Modelagem inicial do schema
- [x] Configuração de testes

### ✅ Semana 2: Implementação dos Modelos (CONCLUÍDA)
- [x] Criação dos modelos principais (User, Supplier, Order)
- [x] Implementação dos relacionamentos
- [x] Configuração de índices
- [x] Testes dos modelos

### ✅ Semana 3: Migração de Dados (CONCLUÍDA)
- [x] Desenvolvimento dos scripts de migração
- [x] Migração de dados de teste (banco limpo configurado)
- [x] Validação da integridade (100% dos testes passando)
- [x] Otimização de performance (índices configurados)

### ✅ Semana 4: Refatoração do Código (CONCLUÍDA)
- [x] Substituição das actions
- [x] Atualização dos services
- [x] Implementação de transações
- [x] Testes de integração

### Semana 5: Testes e Validação
- [ ] Testes de performance
- [ ] Testes de carga
- [ ] Validação funcional completa
- [ ] Documentação final

### Semana 6: Deploy e Monitoramento
- [ ] Deploy em ambiente de staging
- [ ] Migração de produção
- [ ] Monitoramento pós-deploy
- [ ] Ajustes finais

## 9. Riscos e Mitigações

### 9.1 Riscos Identificados

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|----------|
| Perda de dados na migração | Baixa | Alto | Backups completos + testes extensivos |
| Performance degradada | Média | Médio | Testes de carga + otimização de índices |
| Incompatibilidade de tipos | Média | Médio | Validação rigorosa + testes unitários |
| Downtime prolongado | Baixa | Alto | Migração em etapas + rollback plan |

### 9.2 Plano de Rollback

```bash
# Script de rollback
#!/bin/bash
echo "Iniciando rollback..."

# Restaurar backup do MongoDB
mongorestore --drop /backup/mongodb/

# Reverter código para versão anterior
git checkout main-mongodb

# Reinstalar dependências antigas
npm install

# Restart da aplicação
pm2 restart hubflow

echo "Rollback concluído!"
```

## 10. Conclusão

A migração do HubFlow de MongoDB + Mongoose para PostgreSQL + Prisma representa uma evolução significativa na arquitetura do sistema, oferecendo:

- **Maior integridade de dados** através de constraints relacionais
- **Melhor experiência de desenvolvimento** com type safety completo
- **Performance otimizada** para consultas complexas
- **Manutenibilidade aprimorada** com migrações automáticas

O plano apresentado minimiza riscos através de uma abordagem incremental, testes abrangentes e estratégias de rollback bem definidas.

### Status Atual da Migração (Janeiro 2025)

#### ✅ Concluído
- **Configuração completa do ambiente PostgreSQL**
  - Banco `hubflow-comgas` criado e funcionando
  - Schema Prisma totalmente modelado com todos os relacionamentos
  - Cliente Prisma gerado e funcional

- **Implementação dos modelos principais**
  - User, Supplier, Order, ServiceItem, Notification, Log, CompanyProfile
  - Relacionamentos 1:1, 1:N e N:N implementados
  - Índices estratégicos configurados
  - Exclusão lógica implementada

- **Scripts de migração e validação**
  - Scripts de migração desenvolvidos e testados
  - Testes de validação com 100% de sucesso (6/6 testes passando)
  - Validação de integridade, relacionamentos e operações CRUD
  - Documentação completa criada

#### ⏳ Próximos Passos

1. **Semana 5: Testes e Validação**
   - Testes de performance
   - Testes de carga
   - Validação funcional completa

2. **Semana 6: Deploy e Monitoramento**
   - Deploy em ambiente de staging
   - Migração de produção
   - Monitoramento pós-deploy

---

**Documento elaborado por:** Equipe de Desenvolvimento HubFlow  
**Data:** Janeiro 2025  
**Versão:** 1.2 (Semana 4 concluída - Refatoração do Código)  
**Última atualização:** Janeiro 2025