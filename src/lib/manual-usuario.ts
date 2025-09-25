
export const MANUAL_USUARIO = `
# Manual do Usuário - DocFlow 🚀

## Bem-vindo ao Futuro da Gestão de Documentos!

Este manual é seu guia completo e detalhado para utilizar todas as funcionalidades poderosas e inteligentes do **DocFlow**. Desde o gerenciamento básico de documentos até a automação com Inteligência Artificial, você encontrará tudo o que precisa para otimizar seus processos. O DocFlow foi projetado para ser mais do que um repositório; é uma plataforma de inteligência de processos documentais.

---

### **Sumário**

1.  [Visão Geral: O Painel (Dashboard)](#1-visão-geral-o-painel-dashboard)
2.  [Gestão de Documentos no Dia a Dia](#2-gestão-de-documentos-no-dia-a-dia)
    *   [2.1 Carregando um Novo Documento](#21-carregando-um-novo-documento)
    *   [2.2 Importando Múltiplos Documentos (em Lote)](#22-importando-múltiplos-documentos-em-lote)
    *   [2.3 Visualizando e Editando um Documento](#23-visualizando-e-editando-um-documento)
    *   [2.4 Clonando um Documento (Carregar Semelhante)](#24-clonando-um-documento-carregar-semelhante)
    *   [2.5 Navegando com a Visão em Árvore](#25-navegando-com-a-visão-em-árvore)
    *   [2.6 A Lixeira: Restaurando e Excluindo](#26-a-lixeira-restaurando-e-excluindo)
3.  [Reuniões e Atas](#3-reuniões-e-atas)
    *   [3.1 Gerando uma Nova Ata com IA](#31-gerando-uma-nova-ata-com-ia)
    *   [3.2 Gerenciando e Editando Atas](#32-gerenciando-e-editando-atas)
4.  [Central de Análise de Riscos (IA)](#4-central-de-análise-de-riscos-ia)
    *   [4.1 Configurando um Contrato Inteligente](#41-configurando-um-contrato-inteligente)
    *   [4.2 Executando a Análise de Risco](#42-executando-a-análise-de-risco)
    *   [4.3 Editando e Salvando o Relatório de Análise](#43-editando-e-salvando-o-relatório-de-análise)
5.  [Cadastros e Configurações (Admin)](#5-cadastros-e-configurações-admin)
    *   [5.1 Cadastros Auxiliares](#51-cadastros-auxiliares)
    *   [5.2 Regras de Distribuição](#52-regras-de-distribuição)
6.  [Módulos de Qualidade](#6-módulos-de-qualidade)
    *   [6.1 Requisitos Específicos por Produto/Serviço](#61-requisitos-específicos-por-produtoserviço)
7.  [Ajuda e Treinamento: Seu Suporte Integrado](#7-ajuda-e-treinamento-seu-suporte-integrado)
    *   [7.1 Treinamento e Aprendizado](#71-treinamento-e-aprendizado)
    *   [7.2 Assistente de IA (Ajuda)](#72-assistente-de-ia-ajuda)
    *   [7.3 Sugestões e Melhorias](#73-sugestões-e-melhorias)
    *   [7.4 (Admin) Gerenciar Base de Conhecimento IA](#74-admin-gerenciar-base-de-conhecimento-ia)
8.  [Relatórios e Auditoria (Admin)](#8-relatórios-e-auditoria-admin)
    *   [8.1 Dashboards de Relatório](#81-dashboards-de-relatório)
    *   [8.2 Lista Mestra](#82-lista-mestra)
    *   [8.3 Logs de Auditoria](#83-logs-de-auditoria)
9.  [Minha Conta (Admin)](#9-minha-conta-admin)
10. [Apêndices Técnicos](#10-apêndices-técnicos)
    *   [10.1 Usando Markdown na Base de Conhecimento](#101-usando-markdown-na-base-de-conhecimento)
    *   [10.2 Convertendo o Manual para PDF](#102-convertendo-o-manual-para-pdf)

---

### **1. Visão Geral: O Painel (Dashboard)**

O **Painel**, acessado pelo menu **Painel**, é sua central de comando. Ao fazer login, você terá uma visão instantânea e consolidada do status de todos os documentos e contratos aos quais você tem acesso.

*   **Indicadores de Resumo (Cards Superiores):** No topo, você encontra cartões que mostram métricas vitais em tempo real:
    *   **Total de Documentos Acessíveis:** A quantidade total de documentos (não excluídos) que suas permissões permitem visualizar.
    *   **Contratos Ativos Acessíveis:** O número de contratos com status "Ativo" que você pode acessar.
    *   **Rascunhos, Aprovados, Pendentes, Reprovados:** Contadores específicos para cada status de documento, permitindo uma rápida avaliação da carga de trabalho e do fluxo documental.
*   **Grid de Documentos:** A tabela principal exibe todos os seus documentos ativos. É uma ferramenta poderosa e interativa:
    *   **Busca, Filtro e Ordenação:** Cada coluna possui filtros individuais e capacidade de ordenação. Você também pode usar a busca global para encontrar informações rapidamente.
    *   **Agrupamento e Visualização em Árvore:** Utilize os controles acima da grid para agrupar documentos por Contrato, Tipo, Área, ou Status, criando uma visão hierárquica e organizada diretamente na tabela.
    *   **Ações Rápidas:** O menu de ações (\`...\`) em cada linha permite visualizar detalhes, editar, baixar ou excluir um documento sem sair da tela.
*   **Filtros Avançados:** A seção de filtros acima da grid permite refinar sua busca por contrato, tipo de documento, área ou status de forma combinada.

![Visão Geral do Dashboard DocFlow](https://placehold.co/1200x600.png)
*<p align="center" data-ai-hint="dashboard overview">Imagem 1: Tela principal do Dashboard com indicadores, filtros e a grid de documentos.</p>*

---

### **2. Gestão de Documentos no Dia a Dia**

Esta seção cobre as operações centrais do DocFlow.

#### **2.1 Carregando um Novo Documento**

Acesse o menu **Carregar Documento** para adicionar um novo arquivo ao sistema.

1.  **Preencha os Metadados:** Informe dados essenciais como Contrato, Tipo de Documento, Código, Revisão, etc. Campos marcados com \`*\` são obrigatórios. Use os botões \`+\` ao lado dos campos de seleção para adicionar novos itens (Contratos, Tipos, etc.) sem sair da tela.
2.  **Anexe o Arquivo:** Utilize a área de upload destacada para arrastar e soltar ou selecionar o arquivo do seu computador. O nome do arquivo selecionado aparecerá para sua confirmação.
3.  **Melhoria Contínua:** Marque a opção "Requer Melhoria Contínua?" se o documento precisar de revisões periódicas. Isso habilitará campos para definir um prazo de validade (em dias) ou uma data de próxima revisão manual.
4.  **Sugestões da IA (Opcional):**
    *   **Análise de Texto:** Cole um trecho do documento no campo "Sugestor de Tags com IA" e clique em **Sugerir Tags**.
    *   **Análise de Imagem:** Se o arquivo anexado for uma imagem, a IA também a analisará para extrair contexto.
    *   **Resultado:** A IA preencherá automaticamente campos como "Tipo de Documento" e "Área/Disciplina", economizando seu tempo e padronizando a classificação.
5.  **Salve:** Após preencher, clique em "Enviar Documento". Ele será salvo como rascunho, pronto para ser editado ou submetido ao fluxo de aprovação.

![Tela de Upload de Documento](https://placehold.co/1200x800.png)
*<p align="center" data-ai-hint="document upload">Imagem 2: Formulário de upload, com destaque para a área de anexo e o Sugestor de Tags com IA.</p>*

#### **2.2 Importando Múltiplos Documentos (em Lote)**

Para migrar projetos ou cadastrar muitos documentos de uma vez, acesse **Importar por Planilha**.

1.  **Baixe o Modelo:** Clique em "Baixar Planilha Modelo" para obter o arquivo CSV com as colunas corretas e um exemplo de preenchimento.
2.  **Preencha a Planilha:** Adicione os dados dos seus documentos no modelo. Use ponto e vírgula (\`;\`) como delimitador.
3.  **Selecione o Contrato e o Arquivo:** Na tela, escolha o contrato ao qual os documentos pertencem e faça o upload da sua planilha preenchida.
4.  **Pré-visualize e Importe:** O sistema mostrará uma prévia dos dados para validação. Se tudo estiver correto, confirme a importação. O sistema registrará os resultados (sucessos e falhas) para auditoria.

![Tela de Importação em Lote](https://placehold.co/1200x700.png)
*<p align="center" data-ai-hint="batch import">Imagem 3: Tela de importação, mostrando a seleção de contrato e a área de upload da planilha.</p>*

#### **2.3 Visualizando e Editando um Documento**

*   **Visualização:** Clicar em um documento na grid do **Painel** leva à sua página de detalhes (\`/documentos/[id]\`). Lá você encontra todas as informações, o histórico de revisões e o visualizador de arquivos. Se você for o aprovador, o painel de aprovação/reprovação aparecerá aqui.
*   **Edição:** Na página de detalhes, clique em "Editar Documento" para ir à tela de edição (\`/documentos/[id]/editar\`). Você poderá alterar metadados, substituir o arquivo da revisão atual ou criar uma nova revisão.

#### **2.4 Clonando um Documento (Carregar Semelhante)**

Para agilizar a criação de documentos que compartilham muitos metadados com um já existente, utilize a função "Clonar (Carregar Semelhante)".

1.  **Localize o Documento Base:** No **Painel**, encontre o documento que deseja usar como modelo.
2.  **Acesse as Ações:** Clique no menu de ações (\`...\`) na linha do documento desejado.
3.  **Selecione a Opção:** Escolha **Clonar (Carregar Semelhante)**.
4.  **Preenchimento Automático:** Você será redirecionado para a tela **Carregar Documento**, mas o formulário já virá preenchido com as informações do documento original (contrato, tipo, área, etc.).
5.  **Ajuste e Anexe:**
    *   **Importante:** Modifique os campos que devem ser únicos, como o **Código do Documento** e a **Descrição**. A revisão geralmente começa em "R00" para um novo documento.
    *   Anexe o **novo arquivo** correspondente a este novo documento. O arquivo do documento original não é copiado.
    *   Revise os demais campos e salve.

Essa funcionalidade economiza tempo e reduz erros de digitação, mantendo a consistência dos seus cadastros.

#### **2.5 Navegando com a Visão em Árvore**

Acesse a **Visão em Árvore** no menu para uma navegação hierárquica e intuitiva. É a maneira mais fácil de visualizar como os documentos estão organizados dentro de cada contrato e área, expandindo os nós para detalhar o conteúdo.

![Visão em Árvore dos Documentos](https://placehold.co/1200x750.png)
*<p align="center" data-ai-hint="tree view">Imagem 4: Estrutura hierárquica dos documentos, facilitando a navegação.</p>*

#### **2.6 A Lixeira: Restaurando e Excluindo**

Documentos excluídos do painel principal vão para a **Lixeira** (acessível pelo menu).

*   **Restaurar:** Ao lado de um documento, clique no ícone de restauração para movê-lo de volta à lista de documentos ativos.
*   **Excluir Permanentemente:** Use esta opção com cuidado. Ao clicar no ícone de exclusão permanente, o documento e todo o seu histórico serão removidos definitivamente.

---

### **3. Reuniões e Atas**

Este módulo centraliza o registro e o acompanhamento das reuniões da sua organização.

#### **3.1 Gerando uma Nova Ata com IA**

Acesse **Reuniões e Atas -> Gerar Nova Ata (IA)**.

1.  **Faça o Upload do Áudio:** Selecione um arquivo de áudio (MP3, WAV, etc.) da gravação da sua reunião.
2.  **Inicie a Geração:** Clique em "Gerar e Salvar Rascunho da Ata". A IA irá:
    *   **Transcrever** todo o áudio.
    *   **Analisar** o conteúdo para identificar tópicos, decisões, responsáveis e prazos.
    *   **Estruturar** as informações em uma Ata de Reunião formal.
3.  **Redirecionamento para Edição:** Após a geração, o sistema salva automaticamente uma nova ata com o status "Em Andamento" e redireciona você para a tela de edição, onde você pode refinar o conteúdo.

#### **3.2 Gerenciando e Editando Atas**

Acesse **Reuniões e Atas -> Listar Atas** para ver todas as atas salvas.

*   **Edição Completa:** Clique para editar uma ata. Na tela de edição, você pode:
    *   Alterar qualquer parte do texto gerado pela IA.
    *   **Anexar arquivos de evidência** (fotos, planilhas, outros documentos) para compor um "book" completo da reunião.
    *   Gerenciar o **status da ata** (Em Andamento, Concluída, Arquivada) para acompanhar a resolução das pendências.
    *   Gerar uma versão em **PDF** da ata e de sua lista de anexos a qualquer momento.

---

### **4. Central de Análise de Riscos (IA)**

Esta funcionalidade poderosa está integrada diretamente na gestão de cada contrato.

#### **4.1 Configurando um Contrato Inteligente**

1.  **Acesse a Tela:** Vá para o menu **Configurações -> Contratos**.
2.  **Abra o Gerenciador:** Encontre o contrato desejado e, no menu de ações (\`...\`), clique em **Gerenciar Contrato**.
3.  **Defina os Parâmetros:** Dentro do modal, navegue pelas abas para ensinar a IA:
    *   **Dados do Contrato:** Preencha os campos **Riscos Comuns** (um por linha) e **Palavras-Chave de Alerta** (um por linha). Estes termos serão procurados pela IA nos documentos de evidência.
    *   **Documentos Base:** Anexe os ficheiros que representam a "fonte da verdade" (ex: o contrato assinado, normas técnicas, planos de projeto). A IA usará estes documentos como referência para as suas comparações.
    *   **Documentos de Evidência:** Marque os tipos de documento que devem ser cruzados com os Documentos Base (ex: RDOs, Relatórios Fotográficos). A IA irá procurar por conflitos e inconsistências entre o contrato e os documentos destes tipos.
4.  **Salve as Configurações:** Clique em "Salvar Todas as Alterações".

![Tela de Gerenciamento de Contrato Inteligente](https://placehold.co/1200x800.png)
*<p align="center" data-ai-hint="intelligent contract management">Imagem 6: Modal de gerenciamento do contrato, mostrando as abas para configuração da análise de IA.</p>*

#### **4.2 Executando a Análise de Risco**

1.  **Abra a Aba de Análise:** No mesmo modal de "Gerenciar Contrato", vá para a aba **Análise de IA**.
2.  **Defina o Período:** Use os campos de data ("De" e "Até") e o seletor ("Data de Elaboração" ou "Data de Aprovação") para definir o período que você deseja analisar.
3.  **Inicie a Análise:** Clique no botão **Analisar**. A IA irá:
    *   Ler as regras que você definiu nas outras abas.
    *   Buscar, no banco de dados, todos os documentos de evidência que correspondem aos tipos selecionados e que estão dentro do período de tempo especificado.
    *   Realizar uma análise cruzada entre os documentos base e os documentos de evidência.
4.  **Visualize o Histórico:** Cada análise executada fica registrada no painel de "Histórico de Análises".

#### **4.3 Editando e Salvando o Relatório de Análise**

1.  **Selecione uma Análise:** Clique em um item no "Histórico de Análises" para carregar seus resultados.
2.  **Revise e Edite:** Os resultados gerados pela IA (Sumário, Pontos de Conformidade, Desvios, Alertas) aparecerão em campos de texto. **Você pode e deve editar estes campos** para complementar, corrigir ou refinar a análise da IA com seu conhecimento humano.
3.  **Salve o Relatório Final:** Após fazer suas edições, clique em **Salvar Todas as Alterações**. Isto irá atualizar o registro da análise no banco de dados, preservando tanto a sugestão original da IA quanto as suas valiosas contribuições.

---

### **5. Cadastros e Configurações (Admin)**

Estas seções são destinadas a administradores do sistema.

#### **5.1 Cadastros Auxiliares**

No menu lateral, em **Configurações**, você pode gerenciar todas as entidades que formam a base do seu sistema:
*   **Contratos:** Adicione, edite e gerencie os contratos.
*   **Tipos de Documento:** Padronize a classificação dos seus arquivos.
*   **Disciplinas (Áreas):** Crie as áreas ou departamentos da sua organização.
*   **Localização e Sub Localização:** Defina locais físicos para associar aos documentos.
*   **Usuários:** Gerencie usuários, seus papéis (roles) e permissões granulares de acesso.
*   **Enviar Notificações:** Crie e dispare mensagens manuais para os usuários.

#### **5.2 Regras de Distribuição**

Na tela **Regras de Distribuição**, você define a automação das notificações.

1.  **Escolha a Visualização:** Configure as regras por usuário, por área do documento ou pela área principal do usuário.
2.  **Atribua as Áreas:** Para cada usuário (ou grupo), marque as checkboxes correspondentes às áreas de documento que ele deve receber notificações.
3.  **Salve:** Ao salvar, sempre que um documento de uma área marcada for **aprovado**, os usuários vinculados serão notificados automaticamente.

![Tela de Regras de Distribuição](https://placehold.co/1200x700.png)
*<p align="center" data-ai-hint="distribution rules">Imagem 5: Configurando a distribuição automática de documentos para os usuários.</p>*

---

### **6. Módulos de Qualidade**

#### **6.1 Requisitos Específicos por Produto/Serviço**

Esta funcionalidade avançada permite configurar requisitos de documentação personalizados para cada produto ou serviço que sua empresa adquire, garantindo um controle de qualidade muito mais granular.

**Objetivo:** Permitir que a empresa contratante configure, de forma autônoma, requisitos específicos por tipo de produto ou serviço fornecido por um fornecedor, adicionando campos com lógica de Upload e avaliação opcional por IA.

**Como Funciona:**

1.  **Configuração pelo Administrador (Cliente Contratante):**
    *   Acesse a seção **"Requisitos específicos por produto/serviço"** (em Módulos de Qualidade).
    *   Selecione um produto ou serviço do seu cadastro (ex: "Tubo de PVC 100mm").
    *   Clique em "Adicionar Requisito".
    *   **Descrição do Requisito:** Escreva o que deve ser verificado (ex: “O certificado de qualidade do tubo está dentro da validade?”).
    *   **Tipo de Campo:** Escolha entre "Texto", "Upload Obrigatório", etc.
    *   **Validação por IA (Opcional):** Se o requisito envolver a análise de um documento, você pode ativar a IA.
        *   **Instruções para a IA:** Em um campo de texto, ensine a IA o que ela deve procurar no documento enviado. Por exemplo: *"Verifique neste certificado de qualidade a data de validade. Compare-a com a data atual. Se a data de validade for anterior à data de hoje, considere 'Reprovado'. Verifique também se o material descrito é 'PVC'. Se não for, considere 'Reprovado'."*
    *   Salve o requisito. Ele agora será solicitado a todos os fornecedores que fornecerem este item.

2.  **Visão do Fornecedor (Durante a Homologação):**
    *   Na etapa 4 do Wizard de Homologação, "Requisitos Específicos", o fornecedor verá os requisitos que você criou, agrupados por produto/serviço.
    *   Para cada requisito, o fornecedor deverá:
        *   Ler a descrição.
        *   Fazer o upload do documento solicitado (ex: o certificado de qualidade).
        *   Aguardar a análise. O status será exibido como "Pendente", "Em Análise pela IA", "Aprovado" ou "Reprovado".

**Benefícios:**
*   **Hiper-personalização:** Adapte a homologação às necessidades técnicas e de qualidade de cada item.
*   **Automação de Análises Críticas:** Deixe a IA cuidar da verificação de detalhes técnicos, como datas de validade, conformidade com normas e presença de palavras-chave, reduzindo o risco de erro humano.
*   **Produtividade:** Libere sua equipe de análises repetitivas, permitindo que foquem em casos que realmente exigem atenção humana.

---

### **7. Ajuda e Treinamento: Seu Suporte Integrado**

#### **7.1 Treinamento e Aprendizado**

Em **Ajuda e Treinamento -> Instrutor Virtual**, encontre aulas em vídeo para aprender a usar o sistema. Marque as aulas como concluídas e acompanhe seu progresso. Ao completar 100%, você pode gerar um certificado em PDF.

#### **7.2 Assistente de IA (Ajuda)**

No canto inferior direito de sua tela, você encontrará um **botão de ajuda flutuante**. Clique nele para abrir um chat com o assistente de IA.
*   **Assistente Virtual:** Um chat inteligente que responde a perguntas sobre como usar o DocFlow, com base neste manual e nos requisitos da ISO 9001.
*   **Contextual:** Ele sabe em qual página você está, tornando a ajuda mais precisa.
*   **Feedback:** Avalie as respostas da IA para que ela aprenda e melhore.

![Assistente de IA Flutuante](https://placehold.co/800x600.png)
*<p align="center" data-ai-hint="help center chat">Imagem 6: Chat com o assistente de IA para tirar dúvidas sobre o sistema.</p>*

#### **7.3 Sugestões e Melhorias**

Em **Ajuda e Treinamento -> Sugestões e Melhorias**, envie feedbacks, ideias de novas funcionalidades ou reporte bugs, anexando capturas de tela para ilustrar.

#### **7.4 (Admin) Gerenciar Base de Conhecimento IA**

Acessível em **Ajuda e Treinamento -> Gerenciar Base de Conhecimento IA**, esta tela permite que administradores editem diretamente este manual, ensinando à IA sobre novas funcionalidades ou refinando respostas existentes.

---

### **8. Relatórios e Auditoria (Admin)**

Acesse este grupo de funcionalidades no menu **Relatórios e Logs**.

#### **8.1 Dashboards de Relatório**

Visualize dados consolidados em gráficos, como "Distribuição por Área" e "Previstos vs. Realizados".

#### **8.2 Lista Mestra**

Gere um relatório completo e imprimível de todos os documentos com base em filtros avançados.

#### **8.3 Logs de Auditoria**

Acesse a rastreabilidade completa do sistema:
*   **Logs de Distribuição:** Veja quem recebeu qual documento e quando.
*   **Log de Mensagens Enviadas:** Histórico das notificações manuais.
*   **Log Geral do Sistema:** A fonte da verdade, registrando todas as ações críticas (criação, edição, exclusão, logins) com usuário, data e hora.

---

### **9. Minha Conta (Admin)**

Na seção **Minha Conta**, administradores podem visualizar e editar as informações cadastrais da sua empresa (inquilino), como nome, CNPJ e endereço.

---

### **10. Apêndices Técnicos**

#### **10.1 Usando Markdown na Base de Conhecimento**

Para enriquecer o manual na tela "Gerenciar Base de Conhecimento IA", use a sintaxe Markdown:
*   **Imagens:** \`![Descrição da Imagem](URL_DA_IMAGEM)\`
*   **Links:** \`[Texto do Link](URL_DO_LINK)\`
*   **Negrito:** \`**Texto em Negrito**\`
*   **Itálico:** \`*Texto em Itálico*\`
*   **Listas:** Comece a linha com \`*\`, \`-\`, ou \`1.\`

#### **10.2 Convertendo o Manual para PDF**

Você pode facilmente converter este arquivo (\`MANUAL_USUARIO.md\`) para PDF:
*   **Usando o VS Code:** Instale a extensão "Markdown PDF" e, com o arquivo aberto, clique com o botão direito e escolha "Markdown PDF: Export (pdf)".
*   **Usando Ferramentas Online:** Procure por "Markdown to PDF converter".

---

**DocFlow** - Inteligência que organiza, Automação que acelera, Segurança que protege.
`;
