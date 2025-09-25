# Product Requirements Document (PRD) - DocFlow v3.0
## Migração MongoDB para PostgreSQL

---

## 1.4 Benefícios e Impacto Esperado

### 1.4.1 Redução de Tempo e Automação
- **Redução de até 90%** no tempo gasto com gestão documental
- Automação de tarefas manuais e repetitivas
- Liberação da equipe para atividades estratégicas
- Eliminação de trabalho manual desnecessário

### 1.4.2 Segurança Jurídica e Conformidade
- Garantia de segurança jurídica em todos os processos
- Conformidade automática com regulamentações
- Eficiência operacional maximizada
- Preparação para auditorias e certificações

### 1.4.3 Inteligência e Controle
- Plataforma que pensa, automatiza e protege ativos valiosos
- Cérebro digital da gestão documental
- Crescimento organizacional com inteligência e controle total
- Vantagem competitiva sustentável

---

## 1. Visão Geral do Projeto

### 1.1 Contexto
O **DocFlow** é uma plataforma inteligente de gestão documental e conformidade que representa o futuro da gestão de documentos corporativos. Combina um Sistema de Gestão de Documentos (GED) robusto com uma camada de Inteligência Artificial avançada, projetada para automatizar, analisar e otimizar processos críticos, garantindo conformidade e eficiência operacional.

**Diferencial Competitivo**: O DocFlow transcende a simples gestão de documentos, sendo uma plataforma que pensa, analisa, prevê riscos e garante conformidade proativa com normas e exigências setoriais, especialmente ISO 9001.

**Posicionamento**: Não é apenas um GED - é a plataforma inteligente que transforma a gestão documental em uma vantagem competitiva, reduzindo o tempo gasto com gestão documental em até 90%.

### 1.2 Objetivo da Migração
- **Performance**: Melhorar consultas complexas e relatórios
- **Escalabilidade**: Suporte a transações ACID completas
- **Integridade**: Constraints e relacionamentos mais robustos
- **Análise**: Capacidades SQL avançadas para BI e relatórios
- **Manutenibilidade**: Estrutura relacional mais clara

### 1.3 Arquitetura Atual
- **Frontend**: Next.js 14 com App Router
- **Backend**: Server Actions e Server Components
- **Banco Atual**: MongoDB com Mongoose ODM
- **IA**: Google Genkit para análise inteligente
- **Autenticação**: Sistema próprio (em desenvolvimento)
- **Storage**: Firebase Storage (planejado)

---

## 2. Análise do Sistema Atual

### 2.1 Módulos Principais

#### 2.1.1 Núcleo Robusto de Gestão de Documentos (GED)

**Painel de Controle Centralizado**
- Visão 360° do ambiente documental
- Indicadores visuais de status (rascunhos, pendentes, aprovados)
- Contratos ativos e métricas em tempo real
- Lista Mestra Inteligente com busca e filtragem avançada

**Controle Total de Revisões**
- Histórico completo de cada documento
- Visualização, download e auditoria de qualquer versão anterior
- Controle de versões imutável e rastreável
- Garantia de informação sempre correta

**Fluxo de Aprovação Estruturado**
- Ciclo de vida claro: Rascunho → Em Aprovação → Aprovado/Reprovado
- Responsáveis designados para cada etapa
- Governança e conformidade asseguradas
- Controle granular de acessos por usuário

**Busca e Navegação Eficiente**
- Busca global avançada
- Visão em Árvore hierárquica (Empresa > Contrato > Área > Tipo)
- Localização e organização facilitadas
- Interface otimizada para produtividade

**Lixeira Inteligente**
- Documentos excluídos com possibilidade de restauração
- Remoção permanente controlada
- Prevenção de perda acidental de dados
- Segurança e controle total

#### 2.1.2 Inteligência Artificial - O Diferencial Competitivo

**Templates Inteligentes (O Cérebro do Sistema)**
- Criação de "templates-mestres" para contratos
- Análise proativa de novos documentos
- Verificação de aderência e identificação de cláusulas ausentes
- Apontamento de riscos e configuração de alertas personalizados
- Monitoramento automatizado de prazos e conformidade

**Análise Automática de Contratos e Riscos**
- Identificação de riscos e desvios antes que se tornem problemas
- Comparação automática com normas e regulamentações
- Alertas proativos para não conformidades
- Auditoria contínua e automatizada

**Sugestão de Tags com IA**
- Sugestão automática de Tipo de Documento baseada no conteúdo
- Identificação inteligente de Área/Disciplina
- Aceleração do cadastro e redução de erros
- Padronização automática da organização

**Geração de Procedimentos SGQ**
- Criação de documentos complexos do Sistema de Gestão da Qualidade (ISO 9001)
- Geração em minutos com um único comando
- Conformidade automática com normas ISO 9001
- Templates pré-configurados para diferentes processos

**Atas de Reunião Instantâneas**
- Upload de gravação com transcrição automática
- Identificação de decisões e responsáveis por cada ação
- Formatação automática pronta para uso
- Extração de action items e prazos

**OCR Inteligente**
- Cadastro de documentos sem esforço manual
- Identificação automática de tipo, área e metadados
- Extração de informações estruturadas
- Processamento de documentos digitalizados

**Assistente Virtual ISO 9001**
- Consultor digital treinado para garantir conformidade
- Respostas em tempo real sobre normas e procedimentos
- Orientação contextual baseada no documento atual
- Base de conhecimento especializada em qualidade

**Regras de Distribuição Automatizadas**
- Configuração de regras para distribuição automática
- Documentos aprovados enviados automaticamente
- Eliminação de trabalho manual
- Garantia de que informação certa chegue na hora certa

#### 2.1.3 Controle, Segurança e Rastreabilidade Absolutos

**Arquitetura Multi-Tenant**
- Sistema projetado para isolamento completo de dados
- Privacidade e segurança máxima entre empresas
- Escalabilidade para múltiplos clientes
- Configurações independentes por tenant

**Permissões Granulares**
- Controle específico por usuário (criar, editar, excluir, aprovar)
- Permissões de impressão e download individualizadas
- Controle inigualável de acesso
- Segurança baseada em roles e responsabilidades

**Logs e Auditoria Completos**
- Registro imutável de todas as ações críticas
- Logs de criações, edições, exclusões e logins
- Rastreabilidade completa de distribuição e mensagens
- Essencial para auditorias e conformidade regulatória
- Transparência sem precedentes

**Módulo de Controle de Calibração de Equipamentos**
- Cálculo automático da próxima data de calibração
- Essencial para conformidade ISO 9001
- Gestão completa de instrumentos e equipamentos
- Alertas automáticos de vencimento

#### 2.1.4 Módulos Especializados e Estrutura Flexível

**Cadastros Auxiliares Completos**
- Sistema totalmente configurável
- Cadastro de Contratos personalizados
- Tipos de Documento customizáveis
- Disciplinas (Áreas) específicas da organização
- Localizações e Usuários adaptáveis
- Moldagem do DocFlow à estrutura exata da empresa

**Experiência do Usuário Moderna**
- Interface amigável e intuitiva
- Design otimizado para produtividade
- Facilidade de uso e experiência satisfatória
- Plataforma 100% responsiva
- Acesso total em qualquer dispositivo

**Cadastro Otimizado e Ágil**
- Importação em lote de documentos
- Sugestão inteligente de tags
- Economia significativa de tempo
- Adição de entidades diretamente da tela de trabalho
- Importação de centenas de documentos de uma só vez

**Integração com Família Flow**
- Conexão com IsoFlow Gestão com IA
- Implantação completa do SGQ ISO 9001
- Ciclo completo para atender requisitos ISO 9001
- Ecossistema integrado de soluções

### 2.2 Entidades Principais Identificadas

#### 2.2.1 Core Entities
- **Tenant**: Organização/empresa
- **User**: Usuários do sistema
- **Contract**: Contratos/projetos
- **Document**: Documentos principais
- **DocumentType**: Tipos de documento
- **Discipline**: Disciplinas/áreas

#### 2.2.2 Location Entities
- **LocationArea**: Áreas de localização
- **LocationSubArea**: Sub-áreas de localização

#### 2.2.3 Process Entities
- **Revision**: Revisões de documentos
- **ApprovalEvent**: Eventos de aprovação
- **DistributionRule**: Regras de distribuição
- **SystemEventLog**: Logs de sistema

#### 2.2.4 AI & Quality Entities
- **AnalysisResult**: Resultados de análise IA
- **Procedure**: Procedimentos SGQ
- **MeetingMinute**: Atas de reunião
- **CalibrationInstrument**: Instrumentos de calibração

---

## 3. Especificação da Migração PostgreSQL

### 3.1 Estratégia de Migração

#### 3.1.1 Abordagem
- **Migração Gradual**: Implementar PostgreSQL em paralelo
- **Dual Write**: Escrever em ambos os bancos durante transição
- **Validação**: Comparar dados entre sistemas
- **Cutover**: Migração final coordenada

#### 3.1.2 Fases da Migração
1. **Fase 1**: Setup PostgreSQL e schema inicial
2. **Fase 2**: Migração de dados estáticos (tenants, users, contracts)
3. **Fase 3**: Migração de documentos e relacionamentos
4. **Fase 4**: Migração de dados de IA e logs
5. **Fase 5**: Cutover e descomissionamento MongoDB

### 3.2 Schema PostgreSQL

#### 3.2.1 Tabelas Principais

```sql
-- Tenants (Multi-tenancy)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'basic',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Viewer',
    permissions JSONB DEFAULT '{}',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Contracts
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    internal_code VARCHAR(100) NOT NULL,
    client VARCHAR(255) NOT NULL,
    scope TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    responsible_user_id UUID REFERENCES users(id),
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, internal_code)
);

-- Disciplines
CREATE TABLE disciplines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Document Types
CREATE TABLE document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    discipline_id UUID NOT NULL REFERENCES disciplines(id),
    required_fields TEXT[] DEFAULT '{}',
    requires_critical_analysis BOOLEAN DEFAULT FALSE,
    critical_analysis_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Location Areas
CREATE TABLE location_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Location Sub Areas
CREATE TABLE location_sub_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    location_area_id UUID NOT NULL REFERENCES location_areas(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Documents
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id),
    document_type_id UUID NOT NULL REFERENCES document_types(id),
    code VARCHAR(255) NOT NULL,
    description TEXT,
    ai_prompt TEXT,
    area VARCHAR(255) NOT NULL,
    location_area_id UUID REFERENCES location_areas(id),
    location_sub_area_id UUID REFERENCES location_sub_areas(id),
    created_by_id UUID NOT NULL REFERENCES users(id),
    responsible_user_id UUID NOT NULL REFERENCES users(id),
    elaboration_date DATE NOT NULL,
    last_status_change_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL,
    approver_id UUID REFERENCES users(id),
    file_link TEXT,
    text_content TEXT,
    validity_days INTEGER,
    requires_continuous_improvement BOOLEAN DEFAULT FALSE,
    next_review_date DATE,
    import_id VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, contract_id, code)
);

-- Document Revisions
CREATE TABLE document_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    revision_number VARCHAR(10) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    observation TEXT,
    status VARCHAR(50) NOT NULL,
    approving_user_id UUID REFERENCES users(id),
    approved_by_user_id UUID REFERENCES users(id),
    approval_date TIMESTAMP WITH TIME ZONE,
    approver_observation TEXT,
    file_link TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    text_content TEXT,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval Events
CREATE TABLE approval_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3.2.2 Tabelas de IA e Qualidade

```sql
-- Analysis Results (IA)
CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id),
    executed_by_id UUID NOT NULL REFERENCES users(id),
    parameters JSONB DEFAULT '{}',
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    summary TEXT,
    conformity_points TEXT[] DEFAULT '{}',
    deviations JSONB DEFAULT '[]',
    triggered_alerts JSONB DEFAULT '[]',
    error_details TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Procedures (SGQ)
CREATE TABLE procedures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    area VARCHAR(255),
    contract_id UUID REFERENCES contracts(id),
    content TEXT NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    attachments JSONB DEFAULT '[]',
    responsible_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);

-- Meeting Minutes
CREATE TABLE meeting_minutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id),
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    participants JSONB DEFAULT '[]',
    agenda TEXT,
    content TEXT,
    action_items JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    created_by_id UUID NOT NULL REFERENCES users(id),
    audio_file_link TEXT,
    transcription_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calibration Instruments
CREATE TABLE calibration_instruments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    equipment_type VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) NOT NULL,
    calibration_frequency INTEGER NOT NULL,
    last_calibration_date DATE NOT NULL,
    next_calibration_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, tag)
);
```

#### 3.2.3 Tabelas de Sistema

```sql
-- Distribution Rules
CREATE TABLE distribution_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    area VARCHAR(255) NOT NULL,
    user_emails TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Event Logs
CREATE TABLE system_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    entity_description TEXT,
    details TEXT NOT NULL,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import Logs
CREATE TABLE import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES contracts(id),
    user_id UUID NOT NULL REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    total_rows INTEGER NOT NULL,
    processed_rows INTEGER DEFAULT 0,
    successful_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'processing',
    error_details JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3.3 Índices e Performance

```sql
-- Índices principais para performance
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_contracts_tenant_id ON contracts(tenant_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_documents_tenant_id ON documents(tenant_id);
CREATE INDEX idx_documents_contract_id ON documents(contract_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);
CREATE INDEX idx_documents_is_deleted ON documents(is_deleted);
CREATE INDEX idx_document_revisions_document_id ON document_revisions(document_id);
CREATE INDEX idx_document_revisions_is_current ON document_revisions(is_current);
CREATE INDEX idx_system_event_logs_tenant_id ON system_event_logs(tenant_id);
CREATE INDEX idx_system_event_logs_created_at ON system_event_logs(created_at);

-- Índices compostos para queries complexas
CREATE INDEX idx_documents_tenant_contract_status ON documents(tenant_id, contract_id, status);
CREATE INDEX idx_documents_tenant_area_status ON documents(tenant_id, area, status);
CREATE INDEX idx_documents_tenant_type_status ON documents(tenant_id, document_type_id, status);
```

---

## 4. Requisitos Técnicos

### 4.1 Stack Tecnológico

#### 4.1.1 Banco de Dados
- **PostgreSQL 15+**: Banco principal
- **Prisma ORM**: Substituir Mongoose
- **Connection Pooling**: PgBouncer ou similar
- **Backup**: Automated daily backups

#### 4.1.2 Aplicação
- **Next.js 14**: Manter App Router
- **TypeScript**: Tipagem forte
- **Prisma Client**: Acesso ao banco
- **Zod**: Validação de dados
- **Server Actions**: Manter padrão atual

#### 4.1.3 Infraestrutura
- **Docker**: Containerização
- **Environment Variables**: Configuração
- **Migrations**: Versionamento do schema
- **Monitoring**: Logs e métricas

### 4.2 Configuração do Prisma

#### 4.2.1 Schema Prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Tenant {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String   @db.VarChar(255)
  slug      String   @unique @db.VarChar(100)
  plan      String   @default("basic") @db.VarChar(50)
  status    String   @default("active") @db.VarChar(20)
  settings  Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  users               User[]
  contracts           Contract[]
  disciplines         Discipline[]
  documentTypes       DocumentType[]      @relation("TenantDocumentTypes")
  locationAreas       LocationArea[]
  locationSubAreas    LocationSubArea[]
  documents           Document[]
  documentRevisions   DocumentRevision[]
  approvalEvents      ApprovalEvent[]
  analysisResults     AnalysisResult[]
  procedures          Procedure[]
  meetingMinutes      MeetingMinute[]
  calibrationInstruments CalibrationInstrument[]
  distributionRules   DistributionRule[]
  systemEventLogs     SystemEventLog[]
  importLogs          ImportLog[]

  @@map("tenants")
}

model User {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenantId    String   @map("tenant_id") @db.Uuid
  name        String   @db.VarChar(255)
  email       String   @db.VarChar(255)
  area        String   @db.VarChar(255)
  role        String   @default("Viewer") @db.VarChar(50)
  permissions Json     @default("{}")
  avatarUrl   String?  @map("avatar_url")
  createdAt   DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  // Relations
  tenant                    Tenant                   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  responsibleContracts      Contract[]               @relation("ContractResponsible")
  createdDocuments          Document[]               @relation("DocumentCreatedBy")
  responsibleDocuments      Document[]               @relation("DocumentResponsible")
  approvedDocuments         Document[]               @relation("DocumentApprover")
  documentRevisions         DocumentRevision[]
  approvalEvents            ApprovalEvent[]
  analysisResults           AnalysisResult[]
  responsibleProcedures     Procedure[]
  createdMeetingMinutes     MeetingMinute[]
  systemEventLogs           SystemEventLog[]
  importLogs                ImportLog[]

  @@unique([tenantId, email])
  @@map("users")
}

// ... outros modelos seguindo o mesmo padrão
```

### 4.3 Camada de Serviços

#### 4.3.1 Estrutura de Serviços
```typescript
// src/services/database.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// src/services/documentService.ts
import { prisma } from './database'
import type { Document, DocumentCreateInput } from '@/types/Document'

export class DocumentService {
  static async findAll(tenantId: string): Promise<Document[]> {
    return await prisma.document.findMany({
      where: { tenantId, isDeleted: false },
      include: {
        contract: { select: { id: true, name: true, internalCode: true } },
        documentType: { select: { id: true, name: true, code: true } },
        createdBy: true,
        responsibleUser: { select: { id: true, name: true, email: true } },
        approver: { select: { id: true, name: true, email: true } },
        currentRevision: true
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async create(data: DocumentCreateInput): Promise<Document> {
    return await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          ...data,
          currentRevision: {
            create: data.currentRevision
          }
        },
        include: {
          contract: true,
          documentType: true,
          createdBy: true,
          responsibleUser: true,
          currentRevision: true
        }
      })

      // Log da criação
      await tx.systemEventLog.create({
        data: {
          tenantId: data.tenantId,
          contractId: data.contractId,
          userId: data.createdById,
          userName: 'System', // Buscar nome do usuário
          actionType: 'CREATE',
          entityType: 'DOCUMENT',
          entityId: document.id,
          entityDescription: document.code,
          details: `Documento ${document.code} criado`
        }
      })

      return document
    })
  }

  // ... outros métodos
}
```

---

## 5. Plano de Implementação

### 5.1 Cronograma

#### Fase 1: Preparação (Semanas 1-2)
- [ ] Setup PostgreSQL e ambiente de desenvolvimento
- [ ] Configuração do Prisma
- [ ] Criação do schema inicial
- [ ] Setup de migrations
- [ ] Configuração de testes

#### Fase 2: Migração Core (Semanas 3-4)
- [ ] Migração de Tenants e Users
- [ ] Migração de Contracts e Disciplines
- [ ] Migração de DocumentTypes e LocationAreas
- [ ] Testes de integridade

#### Fase 3: Migração Documentos (Semanas 5-6)
- [ ] Migração de Documents
- [ ] Migração de DocumentRevisions
- [ ] Migração de ApprovalEvents
- [ ] Validação de relacionamentos

#### Fase 4: Migração IA e Qualidade (Semanas 7-8)
- [ ] Migração de AnalysisResults
- [ ] Migração de Procedures
- [ ] Migração de MeetingMinutes
- [ ] Migração de CalibrationInstruments

#### Fase 5: Migração Sistema (Semanas 9-10)
- [ ] Migração de SystemEventLogs
- [ ] Migração de DistributionRules
- [ ] Migração de ImportLogs
- [ ] Testes finais

#### Fase 6: Cutover (Semana 11)
- [ ] Sincronização final
- [ ] Cutover coordenado
- [ ] Monitoramento pós-migração
- [ ] Descomissionamento MongoDB

### 5.2 Scripts de Migração

#### 5.2.1 Script de Migração de Dados
```typescript
// scripts/migrate-data.ts
import { MongoClient } from 'mongodb'
import { PrismaClient } from '@prisma/client'

const mongoClient = new MongoClient(process.env.MONGODB_URI!)
const prisma = new PrismaClient()

async function migrateTenants() {
  console.log('Migrando Tenants...')
  
  const mongoDb = mongoClient.db('doc_flow')
  const tenants = await mongoDb.collection('tenants').find({}).toArray()
  
  for (const tenant of tenants) {
    await prisma.tenant.upsert({
      where: { id: tenant._id.toString() },
      update: {
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan || 'basic',
        status: tenant.status || 'active',
        settings: tenant.settings || {},
        updatedAt: tenant.updatedAt || new Date()
      },
      create: {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan || 'basic',
        status: tenant.status || 'active',
        settings: tenant.settings || {},
        createdAt: tenant.createdAt || new Date(),
        updatedAt: tenant.updatedAt || new Date()
      }
    })
  }
  
  console.log(`Migrados ${tenants.length} tenants`)
}

async function migrateUsers() {
  console.log('Migrando Users...')
  
  const mongoDb = mongoClient.db('doc_flow')
  const users = await mongoDb.collection('users').find({}).toArray()
  
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user._id.toString() },
      update: {
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        area: user.area,
        role: user.role || 'Viewer',
        permissions: {
          canCreateRecords: user.canCreateRecords || false,
          canEditRecords: user.canEditRecords || false,
          canDeleteRecords: user.canDeleteRecords || false,
          canDownloadDocuments: user.canDownloadDocuments || true,
          canApproveDocuments: user.canApproveDocuments || false,
          canPrintDocuments: user.canPrintDocuments || true
        },
        avatarUrl: user.avatarUrl,
        updatedAt: user.updatedAt || new Date()
      },
      create: {
        id: user._id.toString(),
        tenantId: user.tenantId,
        name: user.name,
        email: user.email,
        area: user.area,
        role: user.role || 'Viewer',
        permissions: {
          canCreateRecords: user.canCreateRecords || false,
          canEditRecords: user.canEditRecords || false,
          canDeleteRecords: user.canDeleteRecords || false,
          canDownloadDocuments: user.canDownloadDocuments || true,
          canApproveDocuments: user.canApproveDocuments || false,
          canPrintDocuments: user.canPrintDocuments || true
        },
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date()
      }
    })
  }
  
  console.log(`Migrados ${users.length} users`)
}

// ... outras funções de migração

async function main() {
  try {
    await mongoClient.connect()
    
    await migrateTenants()
    await migrateUsers()
    // ... outras migrações
    
    console.log('Migração concluída com sucesso!')
  } catch (error) {
    console.error('Erro na migração:', error)
  } finally {
    await mongoClient.close()
    await prisma.$disconnect()
  }
}

main()
```

### 5.3 Validação e Testes

#### 5.3.1 Testes de Integridade
```typescript
// tests/migration-validation.test.ts
import { MongoClient } from 'mongodb'
import { PrismaClient } from '@prisma/client'

const mongoClient = new MongoClient(process.env.MONGODB_URI!)
const prisma = new PrismaClient()

describe('Migration Validation', () => {
  beforeAll(async () => {
    await mongoClient.connect()
  })

  afterAll(async () => {
    await mongoClient.close()
    await prisma.$disconnect()
  })

  test('should have same number of tenants', async () => {
    const mongoDb = mongoClient.db('doc_flow')
    const mongoCount = await mongoDb.collection('tenants').countDocuments()
    const pgCount = await prisma.tenant.count()
    
    expect(pgCount).toBe(mongoCount)
  })

  test('should have same number of users', async () => {
    const mongoDb = mongoClient.db('doc_flow')
    const mongoCount = await mongoDb.collection('users').countDocuments()
    const pgCount = await prisma.user.count()
    
    expect(pgCount).toBe(mongoCount)
  })

  test('should have same number of documents', async () => {
    const mongoDb = mongoClient.db('doc_flow')
    const mongoCount = await mongoDb.collection('documents').countDocuments()
    const pgCount = await prisma.document.count()
    
    expect(pgCount).toBe(mongoCount)
  })

  // ... outros testes de validação
})
```

---

## 6. Requisitos Funcionais

### 6.1 Funcionalidades Mantidas

#### 6.1.1 Gestão de Documentos
- [x] Upload e versionamento de documentos
- [x] Controle de revisões e aprovações
- [x] Distribuição automática baseada em regras
- [x] Lixeira com restauração
- [x] Visão em árvore hierárquica
- [x] Busca e filtros avançados

#### 6.1.2 Inteligência Artificial
- [x] Análise de contratos e riscos
- [x] Geração de procedimentos SGQ
- [x] Templates inteligentes
- [x] Assistente contextual
- [x] Transcrição de áudio para atas

#### 6.1.3 Qualidade e Conformidade
- [x] Controle de equipamentos e calibração
- [x] Gestão de não conformidades (RNC)
- [x] Procedimentos do Sistema de Gestão da Qualidade
- [x] Relatórios de auditoria

#### 6.1.4 Administração
- [x] Gestão multi-tenant
- [x] Controle de usuários e permissões
- [x] Configurações por tenant
- [x] Logs de sistema e auditoria

### 6.2 Funcionalidades Aprimoradas

#### 6.2.1 Performance
- [ ] Consultas SQL otimizadas
- [ ] Índices estratégicos
- [ ] Cache de queries frequentes
- [ ] Paginação eficiente

#### 6.2.2 Relatórios
- [ ] Relatórios SQL nativos
- [ ] Dashboards em tempo real
- [ ] Exportação para múltiplos formatos
- [ ] Agendamento de relatórios

#### 6.2.3 Integridade de Dados
- [ ] Constraints de integridade referencial
- [ ] Validações no nível do banco
- [ ] Transações ACID completas
- [ ] Backup e recovery automatizados

---

## 7. Requisitos Não Funcionais

### 7.1 Performance
- **Tempo de Resposta**: < 200ms para consultas simples
- **Throughput**: Suporte a 1000+ usuários simultâneos
- **Latência**: < 50ms para operações de leitura
- **Escalabilidade**: Horizontal e vertical

### 7.2 Disponibilidade
- **Uptime**: 99.9% de disponibilidade
- **Recovery Time**: < 4 horas para recovery completo
- **Backup**: Backups diários automatizados
- **Monitoring**: Alertas em tempo real

### 7.3 Segurança
- **Autenticação**: Multi-fator obrigatório
- **Autorização**: RBAC granular
- **Criptografia**: Dados em trânsito e em repouso
- **Auditoria**: Log completo de todas as operações

### 7.4 Manutenibilidade
- **Código**: Cobertura de testes > 80%
- **Documentação**: Documentação técnica completa
- **Monitoramento**: Métricas de performance e saúde
- **Deployment**: CI/CD automatizado

---

## 8. Riscos e Mitigações

### 8.1 Riscos Técnicos

#### 8.1.1 Perda de Dados
- **Risco**: Corrupção durante migração
- **Probabilidade**: Baixa
- **Impacto**: Alto
- **Mitigação**: Backups completos antes da migração, validação em cada etapa

#### 8.1.2 Downtime Prolongado
- **Risco**: Migração mais lenta que esperado
- **Probabilidade**: Média
- **Impacto**: Médio
- **Mitigação**: Migração em etapas, rollback plan, comunicação prévia

#### 8.1.3 Incompatibilidade de Dados
- **Risco**: Estruturas de dados incompatíveis
- **Probabilidade**: Baixa
- **Impacto**: Alto
- **Mitigação**: Mapeamento detalhado, testes extensivos, validação contínua

### 8.2 Riscos de Negócio

#### 8.2.1 Resistência dos Usuários
- **Risco**: Usuários resistentes à mudança
- **Probabilidade**: Média
- **Impacto**: Baixo
- **Mitigação**: Treinamento, comunicação clara, suporte dedicado

#### 8.2.2 Impacto na Produtividade
- **Risco**: Redução temporária de produtividade
- **Probabilidade**: Alta
- **Impacto**: Médio
- **Mitigação**: Migração gradual, suporte 24/7, documentação detalhada

---

## 9. Critérios de Sucesso

### 9.1 Critérios Técnicos
- [ ] Migração de 100% dos dados sem perda
- [ ] Performance igual ou superior ao sistema atual
- [ ] Zero downtime não planejado
- [ ] Todas as funcionalidades operacionais
- [ ] Testes de integridade 100% aprovados

### 9.2 Critérios de Negócio
- [ ] Usuários conseguem realizar todas as tarefas habituais
- [ ] Relatórios gerados corretamente
- [ ] Integrações funcionando normalmente
- [ ] Satisfação dos usuários > 80%
- [ ] Suporte técnico < 5% de tickets relacionados à migração

### 9.3 Critérios de Qualidade
- [ ] Cobertura de testes > 80%
- [ ] Documentação técnica completa
- [ ] Código revisado e aprovado
- [ ] Monitoramento implementado
- [ ] Backup e recovery testados

---

## 10. Conclusão

A migração do DocFlow do MongoDB para PostgreSQL representa uma evolução natural da plataforma, visando melhorar performance, escalabilidade e capacidades analíticas. Com um planejamento cuidadoso, execução em fases e validação rigorosa, esta migração posicionará o DocFlow como uma solução ainda mais robusta e confiável para gestão documental inteligente.

O sucesso desta migração dependerá da execução disciplinada do plano, comunicação efetiva com stakeholders e monitoramento contínuo durante todo o processo. Com as mitigações de risco adequadas e critérios de sucesso bem definidos, esperamos uma transição suave que resultará em uma plataforma mais performática e escalável.

---

**Documento**: PRD DocFlow v3.0 - Migração PostgreSQL  
**Versão**: 1.0  
**Data**: Janeiro 2025  
**Autor**: Equipe de Desenvolvimento DocFlow  
**Status**: Aprovado para Implementação