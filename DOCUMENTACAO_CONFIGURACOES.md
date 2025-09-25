# Documentação - Menu Configurações

Este documento detalha todas as telas do menu **Configurações** do DocFlow, suas funcionalidades, requisitos ISO 9001 e status de integração com PostgreSQL.

## 📋 Visão Geral

O menu Configurações contém 9 telas principais para administração do sistema:

1. **Contratos** - Gerenciamento de contratos
2. **Tipos de Documento** - Classificação de documentos
3. **Disciplinas (Áreas)** - Estrutura organizacional
4. **Localização** - Locais físicos principais
5. **Sub Localização** - Detalhamento de localizações
6. **Usuários** - Gestão de usuários e permissões
7. **Cadastrar Nova Empresa** - Onboarding de empresas
8. **Regras de Distribuição** - Automação de notificações
9. **Enviar Notificações** - Comunicação manual

---

## 🏢 1. Contratos

### Funcionalidade
Gerenciamento completo dos contratos da organização, incluindo criação, edição, visualização e controle de status.

### Requisitos ISO 9001
- **Seção 7.5.3** - Controle de informação documentada
- **Seção 8.4** - Controle de processos, produtos e serviços providos externamente

### Como Usar
- Cadastre contratos com informações básicas (nome, código interno, descrição)
- Associe documentos aos contratos para rastreabilidade
- Controle status e vigência dos contratos

### Problema Resolvido
Centraliza o controle de contratos e permite rastreabilidade completa entre contratos e documentos associados.

### Status PostgreSQL
✅ **INTEGRADO** - Funciona com PostgreSQL via Prisma

---

## 📄 2. Tipos de Documento

### Funcionalidade
Padronização da classificação de documentos através de tipos pré-definidos, com associação a disciplinas e configuração de campos obrigatórios.

### Requisitos ISO 9001
- **Seção 7.5.3** - Controle de informação documentada (Identificação e descrição)
- **Seção 4.4** - Sistema de gestão da qualidade e seus processos

### Como Usar
- Defina tipos de documento (ex: "Manual", "Procedimento", "Instrução")
- Associe cada tipo a uma disciplina específica
- Configure campos obrigatórios e análise crítica
- Defina prazos para análise crítica quando necessário

### Problema Resolvido
Garante padronização na classificação de documentos e automatiza controles de qualidade específicos por tipo.

### Status PostgreSQL
❌ **PENDENTE** - Precisa implementar integração PostgreSQL

---

## 🏷️ 3. Disciplinas (Áreas)

### Funcionalidade
Estruturação das áreas funcionais ou departamentos da organização para categorização de documentos e atribuição de responsabilidades.

### Requisitos ISO 9001
- **Seção 7.1.6** - Conhecimento organizacional
- **Seção 5.3** - Papéis, responsabilidades e autoridades organizacionais

### Como Usar
- Cadastre as áreas da empresa (ex: "Engenharia", "Qualidade", "Jurídico")
- Defina códigos únicos para cada disciplina
- Use cores para identificação visual
- Associe usuários e documentos às disciplinas

### Problema Resolvido
Mapeia a estrutura organizacional no sistema, permitindo distribuição e controle de acesso baseados em áreas de conhecimento.

### Status PostgreSQL
✅ **PARCIALMENTE INTEGRADO** - Funciona com PostgreSQL, mas precisa verificar todas as funcionalidades

---

## 📍 4. Localização

### Funcionalidade
Cadastro dos locais físicos principais onde documentos são aplicáveis ou onde operações ocorrem.

### Requisitos ISO 9001
- **Seção 7.1.3** - Infraestrutura
- **Seção 7.1.4** - Ambiente para operação dos processos

### Como Usar
- Cadastre locais físicos (ex: "Fábrica A", "Escritório Central", "Filial Norte")
- Defina códigos únicos para cada localização
- Associe documentos aos locais onde são aplicáveis

### Problema Resolvido
Permite associar documentos a locais físicos, útil para controle de infraestrutura, segurança e operações de campo.

### Status PostgreSQL
❌ **PENDENTE** - Precisa implementar integração PostgreSQL

---

## 📌 5. Sub Localização

### Funcionalidade
Detalhamento das localizações principais em sub-áreas para controle granular de aplicabilidade de documentos.

### Requisitos ISO 9001
- **Seção 7.1.3** - Infraestrutura
- **Seção 7.1.4** - Ambiente para operação dos processos

### Como Usar
- Detalhe localizações em sub-áreas (ex: "Linha de Produção 2" dentro da "Fábrica A")
- Estabeleça hierarquia entre localização e sub-localização
- Associe documentos específicos a sub-áreas

### Problema Resolvido
Oferece controle ainda mais granular sobre onde documentos são aplicáveis, essencial para operações complexas.

### Status PostgreSQL
❌ **PENDENTE** - Precisa implementar integração PostgreSQL

---

## 👥 6. Usuários

### Funcionalidade
Gestão completa de usuários, incluindo criação, edição, definição de papéis (roles) e permissões granulares de acesso.

### Requisitos ISO 9001
- **Seção 5.3** - Papéis, responsabilidades e autoridades organizacionais
- **Seção 7.2** - Competência
- **Seção 7.5.3** - Controle de informação documentada (Acesso)

### Como Usar
- Cadastre usuários com informações básicas
- Defina papéis (Admin, Editor, Viewer)
- Configure permissões específicas (criar, editar, deletar, aprovar)
- Associe usuários a disciplinas/áreas
- Controle status ativo/inativo

### Problema Resolvido
Garante controle de acesso adequado e rastreabilidade de ações por usuário, essencial para auditoria e segurança.

### Status PostgreSQL
❌ **PENDENTE** - Precisa implementar integração PostgreSQL

---

## 🏢 7. Cadastrar Nova Empresa

### Funcionalidade
Processo de onboarding para cadastro de novas empresas no sistema multi-tenant.

### Requisitos ISO 9001
- **Seção 4.1** - Compreendendo a organização e seu contexto
- **Seção 4.2** - Compreendendo as necessidades e expectativas de partes interessadas

### Como Usar
- Redireciona para tela de cadastro de nova empresa
- Coleta informações básicas da organização
- Configura tenant inicial

### Problema Resolvido
Facilita expansão do sistema para múltiplas organizações mantendo isolamento de dados.

### Status PostgreSQL
✅ **INTEGRADO** - Funciona com sistema multi-tenant PostgreSQL

---

## 🔄 8. Regras de Distribuição

### Funcionalidade
Automação do fluxo de notificações, definindo quais usuários devem ser notificados automaticamente quando documentos de áreas específicas são aprovados.

### Requisitos ISO 9001
- **Seção 7.5.3** - Controle de informação documentada (Distribuição, acesso)
- **Seção 7.4** - Comunicação

### Como Usar
- Configure visualização por usuário, área do documento ou área principal do usuário
- Marque checkboxes das áreas que cada usuário deve receber notificações
- Salve configurações para ativação automática
- Sempre que um documento de área marcada for aprovado, usuários vinculados são notificados

### Problema Resolvido
Garante que partes interessadas sejam notificadas imediatamente sobre liberação de documentos, eliminando atrasos na comunicação.

### Status PostgreSQL
❌ **PENDENTE** - Precisa implementar integração PostgreSQL

---

## 📧 9. Enviar Notificações

### Funcionalidade
Criação e envio manual de notificações para usuários específicos ou grupos.

### Requisitos ISO 9001
- **Seção 7.4** - Comunicação
- **Seção 7.5.3** - Controle de informação documentada (Comunicação)

### Como Usar
- Selecione destinatários (usuários específicos ou grupos)
- Crie mensagem personalizada
- Envie notificação imediata
- Acompanhe status de entrega e leitura

### Problema Resolvido
Permite comunicação controlada e rastreável com usuários, essencial para comunicações importantes e urgentes.

### Status PostgreSQL
✅ **INTEGRADO** - Funciona com PostgreSQL

---

## 📊 Status Geral de Integração PostgreSQL

### ✅ Integradas (3/9)
- Contratos
- Cadastrar Nova Empresa  
- Enviar Notificações

### ❌ Pendentes (5/9)
- **Tipos de Documento** - Prioridade Alta
- **Localização** - Prioridade Alta
- **Sub Localização** - Prioridade Alta
- **Usuários** - Prioridade Alta
- **Regras de Distribuição** - Prioridade Alta

### 🔄 Parcialmente Integradas (1/9)
- **Disciplinas (Áreas)** - Precisa verificação completa

---

## 🎯 Próximos Passos

1. **Implementar integração PostgreSQL** para as 5 telas pendentes
2. **Verificar funcionalidades completas** da tela de Disciplinas
3. **Testar todas as integrações** implementadas
4. **Validar conformidade ISO 9001** de cada funcionalidade
5. **Documentar APIs e endpoints** criados

---

## 📞 Suporte Técnico

Para dúvidas sobre implementação ou funcionalidades:
- Consultar documentação do Prisma
- Verificar schema PostgreSQL em `prisma/schema.prisma`
- Revisar scripts de migração em `scripts/`
- Consultar PRD de migração em `docs/PRD_DocFlow_PostgreSQL_Migration.md`

---

**Documento**: Documentação Menu Configurações  
**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: Documentação Completa - Implementação em Andamento