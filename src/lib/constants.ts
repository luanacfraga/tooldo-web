export const USER_ROLES = {
  MASTER: 'master',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EXECUTOR: 'executor',
  CONSULTANT: 'consultant',
} as const

export const USER_ROLES_LABELS = {
  [USER_ROLES.MASTER]: 'Master',
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.MANAGER]: 'Gestor',
  [USER_ROLES.EXECUTOR]: 'Executor',
  [USER_ROLES.CONSULTANT]: 'Consultor',
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PLANS: '/plans',
  COMPANIES: '/companies',
  USERS: '/users',
  TEAMS: '/teams',
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  PLANS: '/plans',
  COMPANIES: '/companies',
  USERS: '/users',
  TEAMS: '/teams',
} as const

export const QUERY_KEYS = {
  AUTH: ['auth'],
  PLANS: ['plans'],
  PLAN: (id: string) => ['plans', id],
  COMPANIES: ['companies'],
  COMPANY: (id: string) => ['companies', id],
  USERS: ['users'],
  USER: (id: string) => ['users', id],
  TEAMS: ['teams'],
  TEAM: (id: string) => ['teams', id],
} as const

export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Login realizado com sucesso!',
    LOGOUT: 'Logout realizado com sucesso!',
    CREATE: 'Criado com sucesso!',
    UPDATE: 'Atualizado com sucesso!',
    DELETE: 'Excluído com sucesso!',
  },
  ERROR: {
    GENERIC: 'Ocorreu um erro. Tente novamente.',
    LOGIN: 'Erro ao fazer login. Verifique suas credenciais.',
    UNAUTHORIZED: 'Você não tem permissão para acessar este recurso.',
    NOT_FOUND: 'Recurso não encontrado.',
    SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  },
} as const
