# DocFlow — SCHEMA (PostgreSQL)

Atualizado automaticamente a partir do código e migrações presentes no repositório nesta data.

Fonte de verdade do schema: PostgreSQL, com duas camadas de acesso coexistindo no projeto:
- Prisma ORM (principal) — models em prisma/schema.prisma e migrações em prisma/migrations
- Drizzle ORM (pontual) — apenas agregado de Contratos em src/lib/db/schema.ts e serviços correspondentes

Observação importante (ambiente real): foi identificado um registro na tabela TENANT (id uuid, name text, deleted boolean, created_at) que não está mapeada no Prisma. No Prisma a tabela mapeada é tenants (no plural) com outras colunas. Essa divergência precisa ser alinhada antes de qualquer alteração de schema no banco em produção. Não executar alterações destrutivas sem autorização.

## Enums (global)
Definidos nas migrações iniciais e usados pelos modelos do Prisma:
- TenantPlan: FREE, BASIC, PREMIUM, ENTERPRISE
- TenantSubscriptionStatus: ACTIVE, INACTIVE, SUSPENDED, CANCELLED
- GatewayStatus: NOT_APPLICABLE, PENDING, ACTIVE, SUSPENDED, ERROR
- UserRole: Viewer, Editor, Approver, Admin, SuperAdmin
- ContractStatus: active, inactive
- DocumentStatus: draft, pending_approval, approved, rejected, archived
- ApprovalStatus: pending, approved, rejected
- MeetingMinuteStatus: draft, final, archived
- CalibrationStatus: active, inactive, maintenance
- ProcedureStatus: draft, review, approved, published, archived
- RiskLevel: LOW, MEDIUM, HIGH, CRITICAL
- NotificationType: INFO, WARNING, ERROR, SUCCESS
- MessagePriority: LOW, NORMAL, HIGH, URGENT
- DistributionStatus: PENDING, SENT, FAILED, CANCELLED
- ImportStatus: PROCESSING, COMPLETED, FAILED, CANCELLED
- CompanyType: FORNECEDOR, CLIENTE

## Tabelas principais (Prisma)
Nomes físicos conforme @@map no Prisma e migrações SQL.

### tenants
- id (text, PK)
- name (text, único)
- cnpj (text, único)
- commercialPhone (text, opcional)
- commercialEmail (text, opcional)
- plan (TenantPlan, default FREE)
- subscriptionStatus (TenantSubscriptionStatus, default INACTIVE)
- subscriptionStartDate (timestamp)
- nextBillingDate (timestamp)
- accountOwnerName (text)
- accountOwnerEmail (text)
- paymentGatewayStatus (GatewayStatus, default NOT_APPLICABLE)
- isActive (boolean, default true)
- createdAt (timestamp, default now())
- updatedAt (timestamp, auto @updatedAt)
- addressStreet, addressNumber, addressComplement?, addressNeighborhood, addressCity, addressState, addressZipCode, addressCountry (default "Brasil")

Relacionamentos: 1:N com users, contracts, documents, disciplines, document_types, location_areas, location_sub_areas, meeting_minutes, procedures, analysis_results, notification_messages, training_guide_modules, user_notifications, audit_logs(system_event_logs), import_logs, intelligent_templates, companies, ai_knowledge_base etc.

### users
- id (text, PK)
- email (text, único)
- name (text)
- area (text)
- role (UserRole, default Viewer)
- avatarUrl (text, opcional)
- canCreateRecords (boolean, default false)
- canEditRecords (boolean, default false)
- canDeleteRecords (boolean, default false)
- canDownloadDocuments (boolean, default true)
- canApproveDocuments (boolean, default false)
- isActive (boolean, default true)
- createdAt (timestamp, default now())
- updatedAt (timestamp, auto)
- tenantId (text, FK → tenants.id)
- password (text)

Índices/uniques: email único.

### contracts
Tabela: contracts
- id (text, PK)
- name (text, NOT NULL)
- internalCode (text, NOT NULL)
- client (text, NOT NULL)
- scope (text, opcional)
- startDate (text)
- endDate (text)
- status (ContractStatus, default active)
- commonRisks (text[])
- alertKeywords (text[])
- createdAt (timestamp, default now())
- updatedAt (timestamp)
- tenantId (text, FK → tenants.id)
- createdById (text, FK → users.id, nulo)
- responsibleUserId (text, FK → users.id, nulo)
- analysisDocumentTypeIds (text[])

Relacionamentos auxiliares:
- user_contract_access (acesso do usuário ao contrato)
- contract_attachments (anexos)
- contract_ai_analysis (análises de IA por contrato)

### contract_attachments
- id (text, PK)
- fileName, fileType, fileSize, fileLink, uploadedAt
- contractId (text, FK → contracts.id)

### contract_ai_analysis
- id (text, PK)
- contractId (text, FK → contracts.id)
- documentId (text, FK → documents.id, nulo)
- analysisType (text)
- result (jsonb)
- riskLevel (text, opcional)
- recommendations (text[])
- createdAt (timestamp, default now())

### document_types
- id (text, PK)
- name (text)
- code (text)
- requiredFields (text[])
- requiresCriticalAnalysis (boolean, default false)
- criticalAnalysisDays (int, default 0)
- isActive (boolean, default true)
- createdAt, updatedAt (timestamps)
- tenantId (text, FK → tenants)
- disciplineId (text, FK → disciplines)

### documents
- id (text, PK)
- code (text)
- description (text, opcional)
- typeId (text, FK → document_types.id)
- contractId (text, FK → contracts.id, nulo)
- responsibleUserId (text, FK → users.id, nulo)
- approverId (text, FK → users.id, nulo)
- status (DocumentStatus)
- elaborationDate (timestamp)
- validityDays (int)
- nextReviewDate (timestamp, nulo)
- createdAt (timestamp, default now())
- tenantId (text, FK → tenants.id)

Tabelas relacionadas: document_revisions, document_approvals, document_tags, document_ai_analysis.

### disciplines
- id (text, PK)
- name, code, description?, color?
- isActive (boolean, default true)
- createdAt (default now()), updatedAt
- tenantId (text, FK → tenants)

### location_areas, location_sub_areas
Áreas de localização e subáreas (ambas com isActive, timestamps, tenantId e, no caso de subáreas, FK para location_areas).

### meeting_minutes
- atas de reunião com status (MeetingMinuteStatus), relacionamentos com usuário criador e tenant.

### procedures
- fluxo de procedimentos com status (ProcedureStatus), createdBy, responsibleUser?, tenantId.

### analysis_results
- id (text, PK)
- type, title, description?, result (json), confidence?, riskLevel?
- recommendations (text[])
- createdAt (default now())
- tenantId (text, FK)
- contractId (text, FK → contracts.id, CASCADE)
- executedById (text, FK → users.id, SET NULL)
- updatedAt (timestamp) [adicionado por migração]

### companies
- id (text, PK)
- tenantId (text, FK)
- nome (text)
- tipo (CompanyType)
- createdAt (default now()), updatedAt

### user_contract_access, user_discipline_access
- tabelas de vínculo N:N com PK próprio (text) e índices/unique compostos (no caso de disciplinas: unique(userId, disciplineId)).

### ai_knowledge_base
- id (text, PK)
- content (text), version (int, default 1), isActive (boolean)
- createdAt (default now()), updatedAt
- tenantId (text, FK), createdBy (text, FK users.id)

### notificações e mensagens
- notification_messages, user_notifications, message priority/notification type, relacionamentos com tenant e usuário.

### auditoria e importação
- system_event_logs (audit_logs) e import_logs, ambos relacionados a tenant e contendo metadados em JSON quando aplicável.

## Tabela(s) via Drizzle ORM
Arquivo: src/lib/db/schema.ts — agrega somente contracts com colunas equivalentes às do Prisma (tipos text e timestamps como string). Serviços: src/services/contract-drizzle.service.ts. A conexão usa pg + drizzle (src/lib/db/index.ts). O restante do domínio utiliza Prisma.

## Scripts auxiliares
scripts/init-db.sql: criação de extensões, timezone e função utilitária para updated_at. Não altera o schema de entidades do app.

## Divergências conhecidas
- TENANT (singular, id uuid, name text, deleted boolean, created_at) existe no banco apontado pelo usuário e não está mapeada no Prisma. O app usa tenants (plural) com outra estrutura. Próximo passo é decidir a fonte de verdade (manter tenants do Prisma, mapear TENANT no Prisma, ou consolidar) e planejar migração/ETL se necessário. Nenhuma ação será executada sem autorização prévia.

## Diretrizes de evolução
- Novas colunas/tabelas: adicionar nos models Prisma e gerar migração; manter Drizzle alinhado para contracts quando aplicável.
- Remoção/renomeação: usar feature flags e migrações compatíveis (add → migrar dados → switch → remover), evitando quebras.
- Multi-tenant: garantir filtro por tenantId em todas as consultas de leitura/escrita.