function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`)
  }

  return value
}

export const env = {
  apiUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:3000'),
  appName: 'Tooldo',
  appDescription: 'Plataforma de gestão para empresas, times e membros',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

export function validateEnv() {
  try {
    // Only validate if explicitly set (not using default)
    if (!process.env.NEXT_PUBLIC_API_URL) {
      if (env.isProduction) {
        console.warn(
          '⚠️  NEXT_PUBLIC_API_URL is not set in production. Using default value.'
        )
      }
      return
    }
    getEnvVar('NEXT_PUBLIC_API_URL')
  } catch (error) {
    if (env.isProduction) {
      throw error
    }
  }
}
