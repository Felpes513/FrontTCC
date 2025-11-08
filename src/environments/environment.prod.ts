function resolveUrl(path: string): string {
  if (!path) {
    return '';
  }

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
  production: true,

  // O Nginx do container faz o proxy de /api → backend (host.docker.internal:8001)
  apiBaseUrl: resolveUrl('/api'),

  // Mesma rota do SSO passando pelo Nginx
  ssoRedirectUrl: resolveUrl('/api/sso/redirect?provider=empresa'),

  // Serviço de e-mail/certificados atrás do mesmo proxy
  emailApiBaseUrl: resolveUrl('/api/email-service'),

  // Em produção, habilite coleta de erros
  enableErrorLogging: true,

  // Se tiver um coletor (Sentry/Logstash via proxy), informe aqui. Caso contrário, deixe vazio.
  errorLoggingUrl: '',
};
