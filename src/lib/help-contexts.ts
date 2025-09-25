
import type { HelpContent } from '@/types';

export const helpContexts: Record<string, HelpContent> = {
  // General
  'dashboard.main': {
    isoRequirement: 'Seção 4.4 — Sistema de gestão da qualidade e seus processos.',
    howToUse: 'Use o painel para uma visão geral rápida do status de todos os documentos. Filtre, ordene e agrupe a lista para encontrar rapidamente o que você precisa. As ações rápidas no menu (...) permitem gerenciar documentos sem sair da tela.',
    problemSolved: 'Fornece uma visão centralizada e em tempo real do fluxo de trabalho documental, permitindo identificar gargalos e tomar ações rápidas.',
    auditTip: 'Demonstre ao auditor como o dashboard oferece controle e visibilidade sobre todo o processo documental, desde a criação até a aprovação.'
  },
  'trash.main': {
    isoRequirement: 'Seção 7.5.3 — Controle de informação documentada.',
    howToUse: 'Documentos excluídos são movidos para a lixeira. A partir daqui, você pode restaurá-los para a lista ativa ou excluí-los permanentemente. A exclusão permanente não pode ser desfeita.',
    problemSolved: 'Previne a perda acidental de documentos, funcionando como uma segunda chance antes da remoção definitiva. Também ajuda a manter a lista de documentos ativos limpa.',
    auditTip: 'A lixeira evidencia um processo de descarte controlado, mostrando que a remoção de documentos não é arbitrária e que há um mecanismo de recuperação.'
  },

  // Upload & Import
  'upload.main': {
    isoRequirement: 'Seção 7.5.2 — Criação e atualização de informação documentada.',
    howToUse: 'Preencha todos os metadados do documento e anexe o arquivo correspondente. A IA pode sugerir tags para padronizar a classificação. Documentos novos são salvos como rascunho.',
    problemSolved: 'Garante que todos os documentos novos entrem no sistema com as informações necessárias para rastreabilidade, controle e distribuição adequados.',
    auditTip: 'Este formulário é a porta de entrada para a informação documentada. Mostre como ele garante que todos os requisitos de identificação, como código e revisão, sejam atendidos desde o início.'
  },
  'import.main': {
    isoRequirement: 'Seção 7.5.2 — Criação e atualização de informação documentada.',
    howToUse: 'Use esta tela para cadastrar múltiplos documentos de uma vez. Baixe a planilha modelo, preencha os dados e faça o upload. O sistema validará as informações antes de importar.',
    problemSolved: 'Agiliza a migração de projetos existentes e o cadastro de grandes volumes de documentos, economizando tempo e reduzindo erros manuais.',
    auditTip: 'Demonstra a capacidade do sistema de lidar com grandes volumes de dados de forma controlada e padronizada, essencial para a implementação inicial ou migração de projetos.'
  },
  'treeview.main': {
    isoRequirement: 'Seção 7.5.3 — Controle de informação documentada (Acesso, recuperação).',
    howToUse: 'Navegue pelos documentos de forma hierárquica e intuitiva. Expanda os nós de contrato, área e tipo para encontrar o documento desejado. Use a busca para filtrar a árvore.',
    problemSolved: 'Oferece uma forma visual de entender a estrutura organizacional dos documentos, sendo mais intuitiva para encontrar arquivos quando você conhece o contexto, mas não o código exato.',
    auditTip: 'A visão em árvore é uma excelente forma de mostrar a um auditor como a documentação está organizada e como é fácil localizar informações pertinentes dentro de um contexto específico (contrato/área).'
  },

  // IA
  'intelligent_templates.list': {
    isoRequirement: 'Seção 8.1 — Planejamento e controle operacionais.',
    howToUse: 'Gerencie os modelos que a IA usará para analisar documentos. A partir daqui, você pode criar, editar ou excluir templates de análise.',
    problemSolved: 'Permite padronizar a análise de documentos críticos, ensinando a IA o que procurar e garantindo que as mesmas regras de verificação sejam aplicadas consistentemente.',
    auditTip: 'Mostre como os templates são usados para planejar e controlar a verificação de documentos importantes, garantindo que os critérios de aceitação (cláusulas, riscos) sejam sempre verificados.'
  },
  'intelligent_templates.form': {
    isoRequirement: 'Seção 8.2.2 — Determinação de requisitos relativos a produtos e serviços.',
    howToUse: 'Defina os parâmetros do template, como nome, área de aplicação e tipos de documentos que ele deve analisar. Informe as cláusulas-chave que a IA deve procurar, os riscos a monitorar e crie alertas personalizados para verificações automáticas.',
    problemSolved: 'Traduz o conhecimento humano sobre um contrato ou processo em regras automatizadas para a IA, capturando requisitos críticos e transformando-os em verificações ativas e consistentes, o que reduz o risco de erro humano.',
    auditTip: 'Este formulário é a evidência de como os "requisitos do cliente" ou "requisitos normativos" são determinados e inseridos no sistema para controle e verificação automatizada, garantindo conformidade.'
  },
  'audio_memo.main': {
    isoRequirement: 'Seção 7.5.1 — Generalidades (A informação documentada pode ser em qualquer formato e meio).',
    howToUse: 'Faça o upload de um arquivo de áudio (ex: memo de reunião) para que a IA o transcreva para texto. O texto pode ser usado para criar uma ata de reunião ou outro documento formal.',
    problemSolved: 'Transforma registros informais (áudio) em informação documentada e controlada (texto), garantindo que decisões e discussões importantes não se percam.',
    auditTip: 'Demonstra a flexibilidade do sistema em lidar com diferentes formatos de informação, conforme permitido pela ISO 9001, e transformá-los em registros controlados.'
  },

  // Cadastros
  'contracts.list': {
    isoRequirement: 'Seção 8.2 — Requisitos para produtos e serviços.',
    howToUse: 'Gerencie todos os contratos da sua empresa. Um contrato funciona como um contêiner principal para agrupar documentos e definir o escopo de um projeto ou serviço.',
    problemSolved: 'Organiza a documentação por projeto ou cliente, facilitando a gestão e o controle de todos os documentos relacionados a um escopo específico.',
    auditTip: 'Uma lista de contratos bem gerenciada é a base para demonstrar o controle sobre os requisitos do cliente e o escopo dos serviços prestados.'
  },
  'document_types.list': {
    isoRequirement: 'Seção 7.5.2 — Criação e atualização (Identificação e descrição).',
    howToUse: 'Padronize a classificação dos seus arquivos. Criar tipos de documento (ex: "Relatório Técnico", "Procedimento Operacional") garante que documentos semelhantes sejam categorizados da mesma forma.',
    problemSolved: 'Evita a ambiguidade na classificação de documentos, facilitando a busca, a aplicação de regras e a organização geral do sistema.',
    auditTip: 'Demonstre que a organização possui um método padronizado para identificar e descrever seus diferentes tipos de informação documentada.'
  },
  'disciplines.list': {
    isoRequirement: 'Seção 7.1.6 — Conhecimento organizacional.',
    howToUse: 'Defina as áreas funcionais ou departamentos da sua empresa (ex: "Engenharia", "Qualidade", "Jurídico"). As disciplinas são usadas para categorizar documentos e atribuir responsabilidades.',
    problemSolved: 'Mapeia a estrutura organizacional da empresa para o sistema de gestão de documentos, permitindo a distribuição e o controle de acesso baseados em áreas de conhecimento.',
    auditTip: 'A estrutura de disciplinas mostra como o conhecimento organizacional é segmentado e gerenciado dentro do sistema de gestão.'
  },
  'location_areas.list': {
    isoRequirement: 'Seção 7.1.3 — Infraestrutura.',
    howToUse: 'Cadastre os locais físicos onde os documentos podem ser aplicáveis ou onde as operações ocorrem (ex: "Fábrica A", "Escritório Central").',
    problemSolved: 'Permite associar documentos a locais físicos, o que é útil para controle de infraestrutura, segurança e operações de campo.',
    auditTip: 'Evidencia o controle sobre a documentação pertinente à infraestrutura da organização.'
  },
  'location_sub_areas.list': {
    isoRequirement: 'Seção 7.1.3 — Infraestrutura.',
    howToUse: 'Detalhe as localizações principais em sub-áreas (ex: "Linha de Produção 2" dentro da "Fábrica A"). Isso permite um controle ainda mais granular.',
    problemSolved: 'Aumenta a granularidade da localização, permitindo que instruções de trabalho e procedimentos sejam associados a equipamentos ou áreas de trabalho específicas.',
    auditTip: 'Demonstra um controle detalhado da documentação no nível do processo e da estação de trabalho, o que é um sinal de um sistema de gestão maduro.'
  },
  'users.list': {
    isoRequirement: 'Seção 7.2 — Competência e 7.3 — Conscientização.',
    howToUse: 'Gerencie todos os usuários, defina seus papéis (roles), áreas principais e permissões específicas. Isso determina o que cada pessoa pode ver e fazer no sistema.',
    problemSolved: 'Garante a segurança e a integridade do sistema, assegurando que apenas pessoas com a competência e autoridade necessárias possam executar ações críticas.',
    auditTip: 'O controle de acesso baseado em papéis é um ponto fundamental em auditorias. Use esta tela para mostrar como as responsabilidades e autoridades são definidas e controladas.'
  },
  'notifications.send': {
    isoRequirement: 'Seção 7.4 — Comunicação.',
    howToUse: 'Use esta tela para enviar comunicados manuais para grupos de usuários específicos ou para todos no sistema. Útil para anúncios importantes, alertas ou instruções gerais.',
    problemSolved: 'Fornece um canal de comunicação formal e registrado dentro do sistema de gestão, garantindo que mensagens importantes sejam entregues e possam ser auditadas.',
    auditTip: 'Evidencia a existência de um processo de comunicação interna controlado, onde as mensagens importantes são registradas.'
  },
  'distribution_rules.main': {
    isoRequirement: 'Seção 7.5.3 — Controle de informação documentada (Distribuição, acesso).',
    howToUse: 'Automatize o fluxo de informações. Defina aqui quais usuários (ou grupos de usuários) devem ser notificados automaticamente sempre que um documento de uma determinada área for APROVADO.',
    problemSolved: 'Garante que as partes interessadas relevantes sejam notificadas imediatamente sobre a liberação de novos documentos ou revisões, eliminando atrasos e falhas na comunicação.',
    auditTip: 'Esta tela é a prova de um processo de distribuição de documentos automatizado e controlado, atendendo diretamente a um requisito chave da norma.'
  },
  
  // Relatórios
  'reports.master_list': {
    isoRequirement: 'Seção 7.5.3 — Controle de informação documentada.',
    howToUse: 'Gere uma lista completa e imprimível de todos os documentos do sistema. Utilize os filtros para refinar o relatório conforme necessário para auditorias ou análises internas.',
    problemSolved: 'Fornece a "Lista Mestra", um artefato de auditoria clássico que consolida o status e as informações de toda a documentação controlada.',
    auditTip: 'A Lista Mestra é frequentemente o primeiro documento solicitado por um auditor. Use esta tela para gerar rapidamente uma lista atualizada e abrangente.'
  },
  'reports.distribution_logs': {
    isoRequirement: 'Seção 7.5.3 — Controle de informação documentada (Distribuição).',
    howToUse: 'Consulte o histórico detalhado de todas as distribuições de documentos. Veja quem recebeu qual documento, quando e por qual método (notificação no sistema, e-mail).',
    problemSolved: 'Garante a rastreabilidade completa do processo de distribuição, provando que a informação documentada foi entregue às partes interessadas.',
    auditTip: 'Use estes logs para evidenciar ao auditor que o processo de distribuição de documentos é controlado, monitorado e rastreável.'
  },
  'reports.system_logs': {
    isoRequirement: 'Seção 7.5.3 — Controle de informação documentada e 9.1 — Monitoramento, medição, análise e avaliação.',
    howToUse: 'Acesse o log de auditoria completo do sistema. Este registro imutável mostra todas as ações críticas (criação, edição, exclusão, login) realizadas por cada usuário.',
    problemSolved: 'Fornece a fonte da verdade para qualquer auditoria ou investigação, garantindo total rastreabilidade e segurança sobre as ações realizadas no sistema.',
    auditTip: 'Este é um recurso poderoso para demonstrar controle e segurança da informação. Mostre como é possível rastrear qualquer alteração em um documento até o usuário e a data/hora exatos.'
  },
  'reports.message_logs': {
    isoRequirement: 'Seção 7.4 — Comunicação.',
    howToUse: 'Visualize o histórico de todas as notificações e mensagens manuais enviadas através do sistema, incluindo quem enviou, quem recebeu e quando.',
    problemSolved: 'Cria um registro auditável de todas as comunicações formais realizadas pela plataforma, garantindo que os comunicados possam ser rastreados.',
    auditTip: 'Evidencia que a comunicação interna e externa relevante para o SGQ é registrada e controlada.'
  },
  'dashboards.dist_by_area': {
    isoRequirement: 'Seção 9.1.1 — Generalidades (Análise e avaliação).',
    howToUse: 'Analise visualmente quais áreas da empresa possuem o maior volume de documentos distribuídos. O gráfico mostra o total de distribuições bem-sucedidas por área/disciplina.',
    problemSolved: 'Ajuda a identificar as áreas com maior atividade documental, o que pode indicar onde os processos são mais formalizados ou onde há maior necessidade de treinamento e suporte.',
    auditTip: 'Use este dashboard para mostrar como a organização analisa os dados do seu sistema de gestão para entender melhor seus próprios processos.'
  },
  'dashboards.planned_vs_actual': {
    isoRequirement: 'Seção 9.1.1 — Generalidades (Análise e avaliação).',
    howToUse: 'Compare a quantidade de documentos planejados (não aprovados) com os já realizados (aprovados) por cada área. O gráfico mostra o status do fluxo de trabalho em cada disciplina.',
    problemSolved: 'Identifica gargalos no processo de aprovação de documentos, mostrando quais áreas têm muitos documentos "presos" no fluxo e quais estão com as entregas em dia.',
    auditTip: 'Este é um excelente exemplo de como a organização monitora e analisa a eficácia de seus processos de documentação, um requisito chave da seção de avaliação de desempenho.'
  },

  // Módulos
  'rnc_control.main': {
    isoRequirement: 'Seção 10.2 — Não conformidade e ação corretiva.',
    howToUse: 'Este módulo, quando habilitado, permite registrar, tratar e monitorar todas as não conformidades identificadas na organização, desde a sua abertura até a verificação da eficácia da ação corretiva.',
    problemSolved: 'Centraliza e padroniza o tratamento de não conformidades, garantindo que nenhuma seja esquecida e que todo o ciclo de correção seja cumprido.',
    auditTip: 'O controle de RNCs é o coração do processo de melhoria contínua. Um sistema robusto para gerenciá-las é uma evidência poderosa de conformidade.'
  },
  
  // Ajuda e Conta
  'training.guide': {
    isoRequirement: 'Seção 7.2 — Competência e 7.3 — Conscientização.',
    howToUse: 'Siga as fases de aprendizado para se tornar um especialista no DocFlow. Marque as tarefas como concluídas e acompanhe seu progresso para obter seu certificado.',
    problemSolved: 'Oferece um caminho de aprendizado estruturado para garantir que todos os usuários estejam competentes e cientes de como usar o sistema de gestão corretamente.',
    auditTip: 'Demonstra que a organização fornece treinamento formal sobre as ferramentas do sistema de gestão, garantindo que os usuários sejam competentes para suas funções.'
  },
  'training.manage': {
    isoRequirement: 'Seção 7.2 — Competência.',
    howToUse: 'Administradores podem usar esta tela para criar e gerenciar os módulos e aulas do guia de treinamento, personalizando o conteúdo de aprendizado para a organização.',
    problemSolved: 'Permite que a empresa crie treinamentos personalizados, focados em seus processos e documentos específicos, indo além do uso genérico da ferramenta.',
    auditTip: 'Mostra que o treinamento não é genérico, mas sim gerenciado e adaptado às necessidades da organização, um sinal de um processo de desenvolvimento de competências maduro.'
  },
  'ai_knowledge_base.manage': {
    isoRequirement: 'Seção 7.1.6 — Conhecimento organizacional.',
    howToUse: 'Edite o manual técnico do sistema diretamente aqui. Todas as alterações são salvas e usadas imediatamente para treinar o assistente de IA, mantendo-o sempre atualizado.',
    problemSolved: 'Garante que o conhecimento sobre o sistema e seus processos esteja sempre atualizado e disponível para a IA, que por sua vez o dissemina para os usuários.',
    auditTip: 'Esta tela evidencia como o conhecimento organizacional sobre a ferramenta de gestão é mantido, atualizado e tornado disponível (através da IA), um requisito direto da norma.'
  },
  'suggestions.main': {
    isoRequirement: 'Seção 10.3 — Melhoria contínua.',
    howToUse: 'Envie suas ideias, sugestões de melhoria ou reporte problemas. Sua contribuição é uma entrada valiosa para a melhoria contínua do sistema.',
    problemSolved: 'Cria um canal formal para coletar feedback dos usuários, que é a principal fonte de insights para a melhoria contínua da ferramenta e dos processos.',
    auditTip: 'Demonstra um mecanismo ativo para coletar "oportunidades de melhoria" de todas as partes interessadas, um pilar da melhoria contínua.'
  },
  'my_company.view': {
    isoRequirement: 'Seção 4.1 — Entendendo a organização e seu contexto.',
    howToUse: 'Visualize os dados cadastrais e de assinatura da sua empresa. As informações podem ser editadas por um administrador na tela de edição.',
    problemSolved: 'Centraliza as informações básicas da organização, garantindo que todos os registros e relatórios gerados pelo sistema referenciem a entidade correta.',
    auditTip: 'Embora simples, esta tela ajuda a estabelecer o "contexto da organização" dentro do próprio sistema de gestão.'
  },
  
  // Existing ones - to be kept
  'upload.documentCode': {
    isoRequirement: 'Seção 7.5.2 — Criação e atualização: Identificação e descrição.',
    howToUse: 'Insira um código único que identifique este documento de forma inequívoca dentro do sistema e do seu escopo de contrato.',
    problemSolved: 'Evita documentos duplicados ou com identificação ambígua, garantindo que todos saibam exatamente a qual documento se referem.',
    auditTip: 'A falta de um sistema de codificação claro é uma não conformidade comum. Garante que cada documento seja unicamente rastreável.'
  },
  'upload.revision': {
    isoRequirement: 'Seção 7.5.3 — Controle de informação documentada: Controle de alterações.',
    howToUse: 'Indique a versão do documento (ex: R00, A, 1.0). Cada nova submissão para aprovação deve gerar uma nova revisão.',
    problemSolved: 'Impede o uso de versões obsoletas do documento e mantém um histórico claro das alterações realizadas.',
    auditTip: 'Auditores verificarão se o controle de revisão é consistente e se apenas a versão atual está em uso. Este campo é a base desse controle.'
  },
  'contracts.internalCode': {
    isoRequirement: 'Seção 8.2.2 — Determinação de requisitos relativos a produtos e serviços.',
    howToUse: 'Atribua um código único para este contrato, que será usado para agrupar todos os documentos e registros relacionados a ele.',
    problemSolved: 'Centraliza toda a documentação de um projeto ou cliente, facilitando a localização e a gestão de todos os artefatos relacionados.',
    auditTip: 'A capacidade de apresentar rapidamente todos os documentos de um contrato específico demonstra um sistema de gestão organizado e em conformidade.'
  },
  'users.role': {
    isoRequirement: 'Seção 7.2 — Competência e Seção 7.3 — Conscientização.',
    howToUse: 'Defina o nível de acesso e as permissões do usuário. Cada papel (Role) tem responsabilidades e poderes específicos no sistema.',
    problemSolved: 'Garante que apenas pessoal autorizado possa executar ações críticas, como aprovar ou excluir documentos, protegendo a integridade do sistema.',
    auditTip: 'O controle de acesso é crucial para a segurança da informação. Demonstrar que as permissões são gerenciadas por papéis é um ponto forte em auditorias de segurança e ISO 9001.'
  },
};
