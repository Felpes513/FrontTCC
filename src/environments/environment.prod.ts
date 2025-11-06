export const environment = {
  production: true,

  // O Nginx do container faz o proxy de /api → backend (host.docker.internal:8001)
  apiBaseUrl: '/api',

  // Mesma rota do SSO passando pelo Nginx
  ssoRedirectUrl: '/api/sso/redirect?provider=empresa',

  // Serviço de e-mail/certificados atrás do mesmo proxy
  emailApiBaseUrl: '/api/email-service',

  // Em produção, habilite coleta de erros
  enableErrorLogging: true,

  // Se tiver um coletor (Sentry/Logstash via proxy), informe aqui. Caso contrário, deixe vazio.
  errorLoggingUrl: '',
};
