# Plano de Refatoração e Migração (MongoDB → PostgreSQL)

**Stack alvo:** Next.js + TypeScript + **Drizzle ORM** (+ `drizzle-kit`) + `pg` + **pgvector** + Zod (validação)  
**Objetivo:** sair de Mongo ou iniciar do zero em Postgres com **ORM leve, tipos fortes, migrações claras e baixo acoplamento**, pronto para IA (embeddings, busca vetorial) e evolução constante de schema sem “quebras”.

---

## 0) Decisões de Arquitetura (Baseline)

- Fonte da Verdade: PostgreSQL  
- ORM: **Drizzle ORM** (migrations com `drizzle-kit`)  
- Borda estável de API: DTOs com **Zod** (ou Valibot) + versionamento de rotas (`/v1`, `/v2`)  
- Campos dinâmicos: **JSONB** com **CHECKs** contextuais  
- IA: **pgvector** para embeddings + índices HNSW/IVFFlat  
- Auditoria & Soft-delete: colunas padrão (`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`)  
- Controle de Acesso: tabelas de papéis, permissões e vínculos por tenant (multi-tenant nativo)  
- Observabilidade: métricas (Prometheus), logs estruturados (pino/winston), tracing (OTel)

---

## 1) Inventário & Mapeamento

- Levantar coleções Mongo: nome, volume, índices, TTL, referências, agregações usadas  
- Classificar dados: Core, Config, Eventos, IA  
- Mapear tipos (Mongo → Postgres):

| MongoDB            | PostgreSQL                     | Observações |
|--------------------|--------------------------------|-------------|
| `_id` (ObjectId)   | `uuid`                         | Gerar/guardar “mapa de IDs” para rastreabilidade |
| `string`           | `text`/`varchar(n)`            | Preferir `text` salvo necessidade de restrição |
| `number`           | `integer`/`bigint`/`numeric`   | `numeric` p/ dinheiro/precisão |
| `bool`             | `boolean`                      | — |
| `date`             | `timestamptz`                  | Sempre com timezone |
| `array`            | `jsonb` ou arrays nativos      | Em geral `jsonb` p/ flexibilidade |
| `object`           | `jsonb`                        | Crie **CHECKs** p/ validar chaves obrigatórias |
| `binary`           | `bytea`                        | — |
| `geo`              | `PostGIS geometry/geography`   | Se houver geodados |
| embeddings         | `vector(n)` (pgvector)         | Defina `n` conforme modelo |

---

## 2) Modelo Relacional Alvo

### 2.1 Tabelas base (exemplo)
- `tenants` (multi-empresa)  
- `users`, `roles`, `permissions`, `user_roles`, `role_permissions`  
- `clients` (ou `companies`)  
- `contracts` (Base de Verdade)  
- `documents` (metadados; conteúdo no storage S3/MinIO)  
- `document_versions`  
- `risks` (achados de análise)  
- `embeddings` (pgvector + metadados de chunk)  
- `events_audit` (auditoria e trilhas)

### 2.2 Padrões de coluna
- `id uuid pk`, `tenant_id uuid`, `created_at timestamptz default now()`, `updated_at`, `deleted_at null`, `created_by`, `updated_by`  
- Índices por `tenant_id` + campos de busca  
- **Constraints**: FK com `ON UPDATE CASCADE` e `ON DELETE RESTRICT`  

### 2.3 Exemplo de schema (Drizzle)
```ts
// drizzle/schema/contracts.ts
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const contracts = pgTable("contracts", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
```

---

## 3) Migrações & Infra

1. Instalar extensões: `uuid-ossp` e `vector` (pgvector)  
2. `drizzle-kit`: gerar migrações versionadas  
3. Índices de vetor: `CREATE INDEX ON embeddings USING hnsw (embedding vector_l2_ops);`  
4. Políticas de segurança: habilitar **RLS** e policies por tenant  
5. Backups: `pg_dump` diário + retenção 7/30/90 dias

---

## 4) Estratégia de Transição (Zero/Low Downtime)

### Opção A — Greenfield + Reidratação
- Subir Postgres/Drizzle paralelo ao Mongo  
- Criar ETL incremental por tenant  
- Dual-read por curto período  
- Switch de leitura padrão para Postgres  
- Dual-write por janela controlada; desligar Mongo ao final

### Opção B — Big-bang
- Parar sistema, migrar tudo, subir novo  
- Apenas se volume pequeno e janela aceita

---

## 5) ETL/ELT

- Tabela `legacy_id_map(legacy_id text, new_id uuid, entity text, tenant_id uuid, created_at)`  
- Ordem de carga: Tenants → Users/RBAC → Clients → Contracts → Documents → Versions → Risks → Embeddings → Audit  
- Conversões: datas, dinheiro, estruturas aninhadas, embeddings  
- Validações por lote: contagem, FKs, difs de hash/ETag  
- Desempenho: desabilitar triggers durante carga pesada; reindex ao final  
- Log de ETL: tabela `etl_runs`, `etl_errors`

---

## 6) Camada de Aplicação

- DAO/Repository com Drizzle, 1 arquivo por agregado  
- Query avançada: CTEs e SQL cru quando necessário  
- Validação de I/O: **Zod** p/ cada rota; versionar DTOs  
- Feature Flags de Esquema: add → migrar → switch → drop  
- Upload & Storage: metadados no Postgres, binário em S3/MinIO  
- RLS e Multitenancy: todas consultas filtram por `tenant_id`

---

## 7) IA & Busca Semântica

### Schema `embeddings` (exemplo)
```sql
CREATE TABLE embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  source_table text NOT NULL,
  source_id uuid NOT NULL,
  model text NOT NULL,
  dim int NOT NULL,
  embedding vector(1536) NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON embeddings USING hnsw (embedding vector_l2_ops);
CREATE INDEX ON embeddings (tenant_id, source_table, source_id);
```

- Pipelines: Ingestão → normalização → chunking → embedding → upsert  
- Re-rank no app (fallback para SQL cru/CTE)  
- Avaliação: tabela `search_feedback`  

---

## 8) Testes & Qualidade

- Unitários: repositórios Drizzle (mock de conexão)  
- Integração: test DB (docker-compose), migrações no CI  
- Contratos: tests de schema (zod) e snapshot de migração  
- Carga: cenários com 10x do pico esperado (JMeter/k6)  
- Planos de rollback: cada migração com script reverso  

---

## 9) Segurança & Compliance

- RLS + políticas por papel  
- Criptografia em repouso e em trânsito  
- Masking em ambientes de teste  
- Auditoria: `events_audit` com INSERT/UPDATE/DELETE lógicos  
- Retenção: políticas por tipo de dado  

---

## 10) Cutover & Pós-Go-Live

- Janela de corte por tenant  
- Ativar RLS e revogar acessos administrativos não necessários  
- Monitoramento intensivo (erro, latência, locks, deadlocks)  
- Plano de contingência: rollback para Mongo (janela curta) ou restaurar snapshot  
- Playbooks: scripts prontos para reindex, vacuum, failover  

---

## 11) Cronograma sugerido (macro)

- **S1 (D0–D7):** Inventário, modelagem alvo, POCs  
- **S2 (D8–D14):** ETL v1, RLS inicial, testes integração  
- **S3 (D15–D24):** Dual-read/dual-write, migração incremental  
- **S4 (D25–D30):** Cutover, segurança, observabilidade  
- **S5 (D31–D35):** Pós-go-live, limpeza legada, documentação  

---

## 12) Checklists Operacionais

**Pré-migração**  
- [ ] Backups completos Mongo e snapshot infra  
- [ ] Banco Postgres provisionado  
- [ ] Extensões `uuid-ossp`, `vector`  
- [ ] RLS plano e policies  
- [ ] `drizzle-kit` configurado no CI  

**ETL**  
- [ ] Scripts idempotentes  
- [ ] Tabelas de log e erro  
- [ ] Validadores por lote  
- [ ] Reprocessamento de embeddings  

**Cutover**  
- [ ] Alternar leitura para Postgres (feature flag)  
- [ ] Dual-write por N dias; desligar após validação  
- [ ] Plano de rollback testado  

**Pós**  
- [ ] Revisar índices/ANALYZE/VACUUM  
- [ ] Harden de permissões  
- [ ] Documentação final (ERD, dicionário de dados, runbooks)  

---

## 13) Snippets úteis

### Config `drizzle-kit` (exemplo)
```ts
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/**/*.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### Validação de DTO com Zod
```ts
import { z } from "zod";

export const ContractUpsertDTO = z.object({
  tenantId: z.string().uuid(),
  code: z.string().min(1),
  title: z.string().min(1),
  meta: z.record(z.any()).default({}),
});
export type ContractUpsertDTO = z.infer<typeof ContractUpsertDTO>;
```

### Busca Vetorial (pseudo)
```sql
SELECT id, source_id, 1 - (embedding <=> $1::vector) AS score
FROM embeddings
WHERE tenant_id = $tenant
ORDER BY embedding <-> $1::vector
LIMIT 20;
```

---

## 14) Riscos & Mitigações

- Divergência de contratos de API → DTOs versionados + testes  
- Quebra por mudança de schema → migrações compatíveis  
- Performance em lote → COPY, desabilitar triggers temporariamente, reindex ao final  
- Vazamento multi-tenant → RLS + testes de isolamento  
- Embeddings “furos” → filas idempotentes, `status` por item, reprocessamento  

---

## 15) Entregáveis

- [ ] **ERD** e **dicionário de dados** em Markdown  
- [ ] Diretório `drizzle/` com migrações revisadas  
- [ ] Repositórios/DAOs com testes  
- [ ] Scripts ETL + documentação de execução/rollback  
- [ ] Playbooks de operação (backup/restore, reindex, rotinas pgvector)  
- [ ] Guia de contribuição (como criar nova migração sem quebrar produção)

---

### Conclusão

- Se vindo de Mongo: aplicar **Greenfield + ETL incremental + dual-write**  
- Se do zero: iniciar diretamente no **Postgres + Drizzle + pgvector**  
- Esse plano reduz atrito, evita que mudanças de schema quebrem o app, e prepara o terreno para IA com busca semântica, auditoria forte e multitenancy seguro.
