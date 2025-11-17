export { env, validateEnv } from './env'

/**
 * Configurações gerais da aplicação
 */
export const config = {
  // Pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
  },

  // Date formats
  dateFormats: {
    short: 'dd/MM/yyyy',
    long: 'dd/MM/yyyy HH:mm',
    full: "dd 'de' MMMM 'de' yyyy",
  },

  // Cookie settings
  cookies: {
    tokenName: 'weedu_token',
    maxAge: 7, // days
  },

  // API settings
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
  },

  // Table settings
  table: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  },
} as const
