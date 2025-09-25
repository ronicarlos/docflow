# PLANNING.md

## Estrutura de Código & Modularidade
1. Utilizar boas práticas para projetos **Next.js**  
2. Utilizar boas práticas para utilização do **Prisma com PostgreSQL**  
3. Nunca ultrapasse **500 linhas por arquivo**.  
4. Separe funcionalidades em **módulos claros e coesos**.  
5. Use **imports relativos consistentes** conforme a linguagem e ambiente.  
6. **Separação de Responsabilidades**: **Actions** isolam a lógica de negócios.  
7. **Separação de Responsabilidades**: **Services** isolam a lógica de acesso aos dados.  
8. **Reutilização**: Services podem ser usados em outras páginas.  
9. **Manutenibilidade**: Mudanças no banco de dados ficam isoladas nos services.  
10. **Performance**: Queries otimizadas com **select/include** e **índices**.  
11. **Tratamento de Erros**: Gestão robusta de erros em cada camada.  
12. **Database**: usar os **types e models gerados pelo Prisma** para acessar o PostgreSQL.  

**Integrações obrigatórias:**
- **E-mail (SMTP Brevo)** — service: `src/services/email/brevoEmail.service.ts`  
- **Storage (Wasabi S3-compatível)** — service: `src/services/storage/wasabiStorage.service.ts`

---

## Componentes UX/UI
- Estados de **loading** e **error** bem definidos.  
- Componente reutilizável de **Loading** que bloqueie o background e aplique overlay esmaecido para chamadas ao backend.  
- Componente reutilizável de **Loading** para carregamento de páginas.  
- Componente reutilizável **Alert** para avisos dinâmicos de erro e sucesso.

### Decisão de UX: Páginas ao invés de Modais
**IMPORTANTE**: Não utilizar modais para formulários de detalhe ou visualização de dados.
- Modais são inadequados para interfaces complexas e prejudicam a experiência do usuário.  
- Preferir sempre **páginas dedicadas** para:
  - Detalhes de contratos  
  - Formulários de edição  
  - Visualização de dados complexos  
  - Qualquer interface que requeira mais espaço ou navegação  
- Modais devem ser reservados apenas para **confirmações simples e alertas**.

---

## Estado Desejado
* **Páginas e Componentes**: Server Components por padrão. Usar `"use client"` apenas quando estritamente necessário (ex.: `useState`, `useEffect`, manipuladores de eventos).  
* **Busca de Dados (Read)**: Server Components buscam dados diretamente (**await**) via **camada de Serviço**.  
* **Mutações de Dados (Create, Update, Delete)**: Client Components (ex.: formulários) invocam **Server Actions** para modificar dados.  

* **Estrutura de Código (pastas):**
1. `src/components/` ou `src/app/`: Componentes React (Server e Client).  
2. `src/actions/`: Server Actions que orquestram a lógica de negócio reutilizável (ex.: `user.actions.ts`).  
3. Manter actions usadas por uma única página **próximas à página** (ex.: `src/services/dashboard/actions/`) para lógica de negócio usada apenas no dashboard.  
4. `src/services/` ou `src/lib/services/`: Camada de Serviço com a lógica de acesso ao banco (ex.: `user.service.ts`).  
5. `prisma/schema.prisma`: Schemas de dados do Prisma.  
6. `src/lib/prisma.ts`: Lógica de conexão com o banco.  
7. `src/lib`: Utilities e Helpers.  
8. `src/types`: Types e Interfaces.  

---

## Testes & Confiabilidade
* **Testabilidade**: Cada camada pode ser testada independentemente.  
* **TypeScript**: Utilize **Jest**.  
* **Casos essenciais**: ao menos **uso esperado**, **casos de borda** e **casos de falha**.  
* **Teste a Camada de Serviço**: Crie testes unitários para os services. Use **pg-mem** ou **Testcontainers** (PostgreSQL) para testar a lógica CRUD de forma isolada.  
* **Teste a Camada de Actions**: Crie testes de integração para as actions. Faça mock das funções da camada de serviço (ex.: `jest.mock('@/services/userService')`) para verificar se as actions chamam os serviços corretos.

---

## Estilo & Convenções
* **Formatação**: ESLint, Prettier e uso de **tipos estáticos**.  
* **Validação**: **Zod**.  

---

## Documentação de Schema (LLM-Friendly)
* **Arquivo único:** `docs/SCHEMA.md` é a **fonte única de verdade** do desenho da base.  
* **Conteúdo mínimo obrigatório em `docs/SCHEMA.md`:**
  - **Visão geral:** propósito e escopo do schema.  
  - **Modelos (um por subseção):** campos (nome, tipo, nulabilidade, default), chaves primárias/estrangeiras, índices/uniques, regras e restrições de negócio.  
  - **Relações:** cardinalidades e diagramas textuais (ERD simplificado).  
  - **Migrações:** changelog versionado (data, autor, PR, descrição, impacto, passos de rollback).  
  - **Consultas críticas:** queries exemplares e rationale de índices.  
* **Regra obrigatória de processo:**
  - **Antes** de alterar qualquer modelo/tabela/campo/índice, **ler `docs/SCHEMA.md`**.  
  - **Após** a alteração (no mesmo PR), **atualizar `docs/SCHEMA.md`** mantendo o changelog coerente com as migrações Prisma (`prisma/migrations/`).  
  - O PR **não pode ser aprovado** se `docs/SCHEMA.md` não estiver sincronizado com o estado do schema.  

**Template sugerido de seção de modelo (copiar/colar):**
```
### <NomeDoModelo>
- Tabela: <nome_tabela>
- Descrição: <resumo>
- Campos:
  - <campo>: <tipo> [PK|FK -> <alvo>|UNIQUE|INDEX] [NOT NULL] [DEFAULT <valor>]
- Relações:
  - <this>.<fk> → <alvo>.<pk> (1:N | 1:1 | N:M)
- Índices:
  - <idx_nome>(<campos>) [UNIQUE?]
- Regras de negócio:
  - <lista>
- Histórico:
  - <AAAA-MM-DD> <PR #> — <descrição da mudança e rationale>
```

---

## Observações
* Não crie nada novo, apenas refatore o que já existe, siga o planejamento.  
* Nos `schema.prisma`, não altere as chaves **IDs** de `type: String` quando já usadas externamente (mantém compatibilidade de IDs).  
* Não remova referências de domínio (ex.: `'Tenant'` como conceito), apenas modele relações no Prisma de forma explícita.  
* Se o arquivo `src/types/index.ts` existir, **delete**. **Não use** esse agregador — as interfaces ficam separadas por domínio na pasta `types/`.  
* **Nunca excluir colunas, campos ou dados do PostgreSQL sem alinhamento prévio, em hipótese alguma.**  
* **Não definir mais de um tipo/interface por arquivo** — cada arquivo em `src/types/` deve conter **apenas um** tipo ou interface, com nome idêntico ao domínio que representa.  
* **Qualquer alteração de modelos de banco de dados deve ler e manter atualizado o `docs/SCHEMA.md`** (ver seção *Documentação de Schema*).  

---

## Configuração de Ambiente
**REGRA CRÍTICA**: Utilizar **APENAS** o arquivo `.env` para configurações de ambiente.
- **NUNCA** criar ou utilizar arquivos `.env.local`, `.env.example`, `.env.development`, etc.  
- Todos os arquivos de ambiente alternativos devem ser **removidos** para evitar conflitos.  
- O arquivo `.env` é o **único ponto de configuração** para banco de dados e outras variáveis.  
- Esta regra previne conflitos entre configurações e garante consistência no ambiente.  

**Variáveis obrigatórias (.env):**
```
# Banco de Dados / Prisma
DATABASE_URL="postgresql://postgres:admin@localhost:5432/sua_base?schema=public"
PRISMA_LOG_LEVEL=error

# E-mail (Brevo)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=SEU_USUARIO
BREVO_SMTP_PASS=SUA_SENHA
EMAIL_FROM=no-reply@seudominio.com
EMAIL_FROM_NAME=Seu Produto

# Storage (Wasabi S3-compatível)
WASABI_ACCESS_KEY_ID=...
WASABI_SECRET_ACCESS_KEY=...
WASABI_REGION=us-east-1
WASABI_ENDPOINT=https://s3.us-east-1.wasabisys.com
WASABI_BUCKET=nome-do-bucket
```
