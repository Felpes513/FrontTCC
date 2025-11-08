function resolveUrl(path: string): string {
  if (!path) {
    return '';
  }

  // Mantém URLs absolutas (http/https) intactas
  if (/^https?:/i.test(path)) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined' || !window.location?.origin) {
    return normalized;
  }

  const origin = window.location.origin.replace(/\/$/, '');
  return `${origin}${normalized}`;
}

export const environment = {
  production: false,

  // Todas as chamadas da app passam pelo proxy local
  apiBaseUrl: resolveUrl('/api'),

  // Mantemos o SSO também pelo proxy para evitar CORS
  ssoRedirectUrl: resolveUrl('/api/sso/redirect?provider=empresa'),

  // Serviço de e-mail/certificados também roteado pelo proxy
  // (mapeie /api/email-service no proxy.conf.json para a porta real)
  emailApiBaseUrl: resolveUrl('/api/email-service'),

  // Logs adicionais no dev? normalmente deixo false
  enableErrorLogging: false,

  // Se você tiver um coletor local, coloque aqui (ex.: '/api/logs')
  errorLoggingUrl: '',
};
