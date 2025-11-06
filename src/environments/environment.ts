export const environment = {
  production: false,

  // Todas as chamadas da app passam pelo proxy local
  apiBaseUrl: '/api',

  // Mantemos o SSO também pelo proxy para evitar CORS
  ssoRedirectUrl: '/api/sso/redirect?provider=empresa',

  // Serviço de e-mail/certificados também roteado pelo proxy
  // (mapeie /api/email-service no proxy.conf.json para a porta real)
  emailApiBaseUrl: '/api/email-service',

  // Logs adicionais no dev? normalmente deixo false
  enableErrorLogging: false,

  // Se você tiver um coletor local, coloque aqui (ex.: '/api/logs')
  errorLoggingUrl: '',
};
