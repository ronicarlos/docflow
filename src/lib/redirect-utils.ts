/**
 * Utilitários para redirecionamento seguro
 */

// Lista de URLs seguras para redirecionamento
export const SAFE_REDIRECT_PATHS = [
  '/dashboard',
  '/documentos',
  '/contracts',
  '/users',
  '/disciplines',
  '/document-types',
  '/location-areas',
  '/location-sub-areas',
  '/distribution-rules',
  '/quality-modules',
  '/sgq-procedures',
  '/training',
  '/reports',
  '/notifications',
  '/profile',
  '/settings',
  '/minha-empresa',
  '/novo-projeto',
  '/importar-projeto',
  '/import-documents',
  '/upload',
  '/lixeira',
  '/meeting-minutes',
  '/suggestions',
  '/ai-knowledge-base',
  '/audio-memo'
];

/**
 * Valida se uma URL é segura para redirecionamento
 * @param url - URL para validar
 * @returns true se a URL é segura, false caso contrário
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Verificar se é uma URL relativa (não contém protocolo)
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return false;
  }

  // Verificar se começa com /
  if (!url.startsWith('/')) {
    return false;
  }

  // Verificar se está na lista de URLs seguras
  return SAFE_REDIRECT_PATHS.some(path => url.startsWith(path));
}

/**
 * Obtém uma URL de redirecionamento segura
 * @param requestedUrl - URL solicitada para redirecionamento
 * @param defaultUrl - URL padrão caso a solicitada não seja segura
 * @returns URL segura para redirecionamento
 */
export function getSafeRedirectUrl(requestedUrl?: string | null, defaultUrl: string = '/dashboard'): string {
  if (requestedUrl && isSafeRedirectUrl(requestedUrl)) {
    return requestedUrl;
  }
  
  return defaultUrl;
}

/**
 * Extrai o parâmetro redirect de uma URL de forma segura
 * @param searchParams - URLSearchParams ou string de query
 * @returns URL de redirecionamento segura ou null
 */
export function extractSafeRedirectParam(searchParams: URLSearchParams | string): string | null {
  let params: URLSearchParams;
  
  if (typeof searchParams === 'string') {
    params = new URLSearchParams(searchParams);
  } else {
    params = searchParams;
  }
  
  const redirectParam = params.get('redirect');
  
  if (redirectParam && isSafeRedirectUrl(redirectParam)) {
    return redirectParam;
  }
  
  return null;
}