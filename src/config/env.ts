/**
 * Configuração centralizada de variáveis de ambiente
 * Garante type-safety e validação em tempo de execução
 */

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value
}

export const env = {
  // API Configuration
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000'),

  // App Configuration
  appName: 'Weedu',
  appDescription: 'Plataforma de gestão para empresas, times e membros',

  // Environment
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

// Validate required environment variables on app start
export function validateEnv() {
  try {
    getEnvVar('NEXT_PUBLIC_API_URL')
    console.log('✅ Environment variables validated successfully')
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    if (env.isProduction) {
      throw error
    }
  }
}
