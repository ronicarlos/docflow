# DocFlow - Sistema Inteligente de Gestão de Documentos

> **🚀 Início Rápido**: Para configurar o projeto rapidamente, consulte o [QUICK-START.md](QUICK-START.md)

DocFlow é uma plataforma moderna e inteligente para gestão de documentos, contratos e processos organizacionais, desenvolvida com Next.js, PostgreSQL e tecnologias de IA.

## ✨ Principais Funcionalidades

### 🎯 Gestão Inteligente de Documentos
- **Upload e Organização**: Interface drag-and-drop para upload de documentos
- **Categorização Automática**: IA classifica documentos por tipo e conteúdo
- **Busca Avançada**: Busca textual completa com filtros inteligentes
- **Controle de Versões**: Histórico completo de revisões e alterações
- **Tags Inteligentes**: Sistema de tags automático e manual

### 📋 Gestão de Contratos
- **Ciclo de Vida Completo**: Da criação à renovação automática
- **Análise de IA**: Extração automática de cláusulas e datas importantes
- **Alertas de Vencimento**: Notificações proativas de expiração
- **Dashboard de Status**: Visão consolidada de todos os contratos

### 🏢 Estrutura Organizacional
- **Multi-tenancy**: Suporte a múltiplas organizações
- **Disciplinas e Locais**: Organização por áreas e localizações
- **Controle de Acesso**: Permissões granulares por usuário
- **Auditoria Completa**: Log de todas as ações do sistema

### 🤖 Inteligência Artificial
- **Análise de Conteúdo**: Extração automática de informações
- **Classificação Inteligente**: Categorização automática de documentos
- **Insights e Relatórios**: Análises preditivas e dashboards
- **Processamento de Linguagem Natural**: Compreensão de texto avançada

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React com SSR/SSG
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Shadcn/ui** - Componentes UI modernos

### Backend
- **PostgreSQL** - Banco de dados relacional
- **Prisma** - ORM moderno e type-safe
- **Node.js** - Runtime JavaScript

### IA e Integração
- **Google AI (Gemini)** - Processamento de linguagem natural
- **Firebase** - Autenticação e storage
- **Docker** - Containerização

## 🚀 Início Rápido

### Setup Automático (Recomendado)

```bash
# Clone o repositório
git clone <repository-url>
cd DocFlow

# Execute o setup automático
npm run setup:project

# Inicie a aplicação
npm run dev
```

### Migração do MongoDB

Se você possui dados no MongoDB:

```bash
# Configure a URL do MongoDB no .env
MONGODB_URL="mongodb://localhost:27017/docflow_old"

# Execute a migração
npm run migrate:from-mongo

# Valide os dados migrados
npm run validate:migration
```

## 📖 Documentação

- **[QUICK-START.md](QUICK-START.md)** - Guia de início rápido (5 minutos)
- **[README-MIGRATION.md](README-MIGRATION.md)** - Guia completo de migração
- **[docs/PRD_DocFlow_PostgreSQL_Migration.md](docs/PRD_DocFlow_PostgreSQL_Migration.md)** - Especificações técnicas

## 🏗️ Arquitetura

```
DocFlow/
├── prisma/                   # Schema do banco e seeds
│   ├── schema.prisma        # Definição do banco
│   └── seed.ts              # Dados iniciais
├── src/
│   ├── lib/                 # Configurações e utilitários
│   │   └── prisma.ts        # Cliente Prisma
│   └── services/            # Camada de negócio
│       ├── document.service.ts
│       ├── contract.service.ts
│       └── meeting.service.ts
├── scripts/                 # Scripts de setup
│   └── setup-project.ps1
└── docs/                    # Documentação
```

## 🔧 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Linter
```

### Banco de Dados
```bash
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema (dev)
npm run db:migrate   # Criar migração
npm run db:studio    # Interface web do banco
npm run db:seed      # Popular dados iniciais
```

### Migração e Utilitários
```bash
npm run migrate:from-mongo    # Migrar do MongoDB
npm run validate:migration    # Validar migração
npm run setup:project         # Setup automático completo
```

## 🌐 Ambientes

### Desenvolvimento
- **Aplicação**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555
- **PgAdmin**: http://localhost:5050

### Produção
- Configurar variáveis de ambiente adequadas
- Usar `npm run build && npm run start`
- Configurar proxy reverso (Nginx/Apache)

## 🔒 Segurança

- **Autenticação**: NextAuth.js com múltiplos provedores
- **Autorização**: RBAC (Role-Based Access Control)
- **Multi-tenancy**: Isolamento completo de dados
- **Auditoria**: Log de todas as operações
- **Criptografia**: Dados sensíveis criptografados

## 📊 Monitoramento

- **Logs de Aplicação**: Winston/Pino
- **Métricas de Banco**: PostgreSQL stats
- **Health Checks**: Endpoints de saúde
- **Alertas**: Notificações automáticas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: Consulte os arquivos de documentação
- **Issues**: Reporte bugs e solicite features
- **Discussões**: Participe das discussões da comunidade

---

**Desenvolvido com ❤️ para revolucionar a gestão de documentos**

> Para começar rapidamente, execute `npm run setup:project` e siga o [QUICK-START.md](QUICK-START.md)
