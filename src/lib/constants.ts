
export const APP_NAME = "DocFlow";

// Definição para o terceiro nível de navegação
export type NavLinkGrandChild = {
  href?: string; // Tornar href opcional para ações
  label: string;
  icon: string;
  roles?: UserRole[];
  accordionKey?: string;
  disabledMessage?: string; // Nova propriedade para mensagens de desabilitado
};

export type NavLinkChild = {
  href?: string; // Opcional se tiver children ou for uma ação
  label: string;
  icon: string;
  children?: NavLinkGrandChild[];
  roles?: UserRole[];
  accordionKey?: string;
  disabledMessage?: string; // Nova propriedade
};

export type NavLinkParent = {
  label:string;
  icon: string;
  href?: string; // Opcional se tiver children ou for uma ação
  children?: (NavLinkChild | NavLinkGrandChild)[];
  accordionKey?: string;
  roles?: UserRole[];
  disabledMessage?: string; // Nova propriedade
};

export type NavLink = NavLinkParent;

const ADMIN_ROLES: UserRole[] = ['Admin', 'SuperAdmin'];
const ALL_USER_ROLES: UserRole[] = ['Viewer', 'Editor', 'Approver', 'Admin', 'SuperAdmin'];

export const NAV_LINKS: NavLink[] = [
  { href: "/dashboard", label: "Painel", icon: "LayoutDashboard", roles: ALL_USER_ROLES },
  {
    label: "Gestão de Documentos",
    icon: "FolderKanban",
    accordionKey: "gestao-docs",
    roles: ALL_USER_ROLES,
    children: [
        { href: "/upload", label: "Carregar Documento", icon: "UploadCloud", roles: ['Editor', 'Approver', ...ADMIN_ROLES] },
        { href: "/dashboard", label: "Lista Mestra", icon: "ListChecks", roles: ALL_USER_ROLES },
        { href: "/import-documents", label: "Importar por Planilha", icon: "FileSpreadsheet", roles: ADMIN_ROLES },
        { href: "/documentos/treeview", label: "Visão em Árvore", icon: "Network", roles: ALL_USER_ROLES },
        { href: "/lixeira", label: "Lixeira", icon: "Trash2", roles: ALL_USER_ROLES, accordionKey:"nav-lixeira" },
    ]
  },
  {
    label: "Reuniões e Atas",
    icon: "Briefcase",
    accordionKey: "reunioes-atas",
    roles: ALL_USER_ROLES,
    children: [
      { href: "/meeting-minutes", label: "Listar Atas", icon: "List", roles: ALL_USER_ROLES },
      { href: "/audio-memo", label: "Gerar Nova Ata (IA)", icon: "AudioLines", roles: ALL_USER_ROLES },
    ]
  },
  {
    label: "Configurações",
    icon: "Settings2",
    accordionKey: "cadastros",
    roles: ADMIN_ROLES,
    children: [
      { href: "/contracts", label: "Contratos", icon: "FileText", accordionKey:"nav-contracts", roles: ADMIN_ROLES },
      { href: "/document-types", label: "Tipos de Documento", icon: "FileType2", accordionKey:"nav-doctypes", roles: ADMIN_ROLES },
      { href: "/disciplines", label: "Disciplinas (Áreas)", icon: "Tags", accordionKey:"nav-disciplines", roles: ADMIN_ROLES },
      { href: "/location-areas", label: "Localização", icon: "Map", accordionKey:"nav-locareas", roles: ADMIN_ROLES },
      { href: "/location-sub-areas", label: "Sub Localização", icon: "Waypoints", accordionKey:"nav-locsubareas", roles: ADMIN_ROLES },
      { href: "/users", label: "Usuários", icon: "Users", accordionKey:"nav-users", roles: ADMIN_ROLES },
      { href: "/cadastro-empresa", label: "Cadastrar Nova Empresa", icon: "UserPlus", accordionKey:"nav-signup", roles: ADMIN_ROLES },
      { href: "/distribution-rules", label: "Regras de Distribuição", icon: "Network", roles: ADMIN_ROLES },
      { href: "/notifications", label: "Enviar Notificações", icon: "Send", roles: ADMIN_ROLES, accordionKey:"nav-notificationsadmin" },
    ]
  },
  {
    label: "Relatórios e Auditoria",
    icon: "BarChart3",
    accordionKey: "relatorios",
    roles: ADMIN_ROLES,
    children: [
      {
        label: "Dashboards de Relatório",
        icon: "PieChart",
        accordionKey: "dashboards-relatorio",
        roles: ADMIN_ROLES,
        children: [
          { href: "/reports/dashboards/distribution-by-area", label: "Distribuição por Área", icon: "BarChartHorizontalBig", accordionKey:"dist-area", roles: ADMIN_ROLES },
          { href: "/reports/dashboards/planned-vs-actual-by-area", label: "Previstos x Realizados (Área)", icon: "ClipboardCheck", accordionKey:"planned-actual-area", roles: ADMIN_ROLES },
        ]
      },
      { href: "/reports/master-list", label: "Gerar Lista Mestra (PDF)", icon: "FileText", accordionKey:"master-list-report", roles: ADMIN_ROLES },
      { href: "/reports/distribution-logs", label: "Logs de Distribuição", icon: "ClipboardList", accordionKey:"dist-logs", roles: ADMIN_ROLES },
      { href: "/reports/message-logs", label: "Log de Mensagens Enviadas", icon: "MailCheck", accordionKey:"msg-logs", roles: ADMIN_ROLES },
      { href: "/reports/system-events", label: "Log Geral do Sistema", icon: "History", accordionKey:"sys-logs", roles: ADMIN_ROLES },
    ]
  },
   {
    label: "Ajuda e Treinamento",
    icon: "BookOpen",
    accordionKey: "ajuda-treinamento",
    roles: ALL_USER_ROLES,
    children: [
      { href: "/training", label: "Instrutor Virtual", icon: "Rocket", roles: ALL_USER_ROLES, accordionKey: "nav-training" },
      { href: "/training/manage", label: "Gerenciar Treinamentos", icon: "Settings", roles: ADMIN_ROLES, accordionKey: "nav-training-manage" },
      { href: "/ai-knowledge-base", label: "Gerenciar Base de Conhecimento IA", icon: "DatabaseZap", roles: ADMIN_ROLES, accordionKey: "nav-ai-knowledge" },
      { href: "/suggestions", label: "Sugestões e Melhorias", icon: "Lightbulb", roles: ALL_USER_ROLES, accordionKey: "nav-suggestions" },
    ]
  },
  {
    label: "Minha Conta",
    icon: "Building",
    accordionKey: "minha-conta",
    roles: ADMIN_ROLES,
    children: [
      { href: "/minha-empresa", label: "Dados da Empresa", icon: "Building2", roles: ADMIN_ROLES, accordionKey: "nav-minha-empresa-dados" },
    ]
  },
  { href: "/dev/switch-user", label: "Trocar Usuário (Dev)", icon: "Users2", roles: ALL_USER_ROLES },
  { href: "/laboratorio", label: "Laboratório (Debug)", icon: "FlaskConical", roles: ADMIN_ROLES },
];

export const USER_ROLES = ['Viewer', 'Editor', 'Approver', 'Admin', 'SuperAdmin'] as const;
export type UserRole = typeof USER_ROLES[number];


export const DOCUMENT_STATUSES = {
  draft: { label: 'Rascunho', color: 'bg-slate-500', textColor: 'text-slate-700', icon: 'FileEdit' },
  pending_approval: { label: 'Em Aprovação', color: 'bg-yellow-500', textColor: 'text-yellow-700', icon: 'CircleDot' },
  approved: { label: 'Aprovado', color: 'bg-green-500', textColor: 'text-green-700', icon: 'CheckCircle2' },
  rejected: { label: 'Reprovado', color: 'bg-red-500', textColor: 'text-red-700', icon: 'XCircle' },
} as const;


export const CONTRACT_STATUSES = {
  active: { label: 'Ativo', color: 'text-green-600' },
  inactive: { label: 'Inativo', color: 'text-red-600' },
};

export const MEETING_MINUTE_STATUSES = {
  'Em Andamento': { label: 'Em Andamento', color: 'text-yellow-600' },
  'Concluída': { label: 'Concluída', color: 'text-green-600' },
  'Arquivada': { label: 'Arquivada', color: 'text-slate-600' },
};

export const ANALYSIS_STATUSES = {
  processing: { label: 'Processando', color: 'text-blue-600', icon: 'Loader2' },
  completed: { label: 'Concluída', color: 'text-green-600', icon: 'CheckCircle' },
  failed: { label: 'Falhou', color: 'text-red-600', icon: 'XCircle' },
} as const;

export const SYSTEM_LOG_ACTION_TYPES = {
  create: "Criação",
  update: "Atualização",
  delete: "Exclusão",
  login: "Login",
  logout: "Sair",
  permission_change: "Alteração de Permissão",
  file_upload: "Upload de Arquivo",
  file_download: "Download de Arquivo",
  report_generated: "Relatório Gerado",
  import_batch: "Importação em Lote",
  system_config: "Configuração do Sistema",
  document_approved: "Documento Aprovado",
  document_rejected: "Documento Reprovado",
  document_status_changed: "Status do Documento Alterado",
  distribution_event: "Evento de Distribuição (Regras)",
  notifications_sent: "Notificações Enviadas (Distribuição)",
  tenant_data_update: "Atualização de Dados do Inquilino",
  payment_event: "Evento de Pagamento",
  intelligent_template_created: "Template Inteligente Criado",
  intelligent_template_updated: "Template Inteligente Atualizado",
  intelligent_template_deleted: "Template Inteligente Excluído",
  contract_analysis_started: "Análise de Contrato Iniciada",
} as const;

export const SYSTEM_LOG_ENTITY_TYPES = {
  document: "Documento",
  contract: "Contrato",
  user: "Usuário",
  revision: "Revisão",
  discipline: "Disciplina (Área)",
  location_area: "Localização",
  location_sub_area: "Sub Localização",
  document_type: "Tipo de Documento",
  distribution_rule: "Regra de Distribuição",
  system_log: "Log do Sistema",
  distribution_log: "Log de Distribuição",
  notification_message: "Mensagem de Notificação",
  user_notification: "Notificação de Usuário",
  tenant: "Inquilino (Empresa)",
  subscription: "Assinatura",
  intelligent_template: "Template Inteligente",
  analysis_result: "Resultado de Análise de Contrato",
  unknown: "Desconhecido/Sistema"
} as const;
