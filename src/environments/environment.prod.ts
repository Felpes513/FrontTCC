export const environment = {
  production: true,
  apiBaseUrl: '/api',
  ssoRedirectUrl: '/sso/redirect?provider=empresa',
  emailApiBaseUrl: '/api/email-service',
  enableErrorLogging: true,
  /**
   * Quando habilitado, o GlobalErrorHandler enviará erros para este endpoint.
   * Caso não exista um coletor de logs, mantenha como string vazia.
   */
  errorLoggingUrl: '',
};
