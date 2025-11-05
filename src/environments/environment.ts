export const environment = {
  production: false,
  /**
   * Base URL para chamadas da API principal. Utilize uma rota relativa quando
   * estiver usando o proxy local (`ng serve --proxy-config proxy.conf.json`).
   */
  apiBaseUrl: '/api',
  /** URL de redirecionamento do SSO corporativo utilizado pela secretaria. */
  ssoRedirectUrl: 'http://127.0.0.1:8001/sso/redirect?provider=empresa',
  /**
   * Endpoint do serviço responsável pelo envio de e-mails/certificados.
   * Ajuste para o endereço exposto na VPS.
   */
  emailApiBaseUrl: 'http://localhost:5000/api',
  /** Habilita logs adicionais enviados pelo GlobalErrorHandler. */
  enableErrorLogging: false,
  /** Endpoint opcional para envio de erros (ex.: Sentry proxy ou Logstash). */
  errorLoggingUrl: '',
};
