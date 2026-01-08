import { ActionStatus } from './action'

/**
 * Métricas de um membro da equipe
 */
export interface TeamMemberMetrics {
  // Identificação
  userId: string
  name: string
  avatar?: string

  // Métricas do período atual
  totalDeliveries: number // Ações com status DONE
  completionRate: number // (DONE / TOTAL) * 100
  inProgress: number // Ações IN_PROGRESS
  late: number // Ações atrasadas (isLate = true)
  totalActions: number // Total de ações no período

  // Comparativos com período anterior
  deliveriesChange: number // +15 ou -3 (diferença absoluta)
  deliveriesChangePercent: number // +50% ou -20%
  completionRateChange: number // +5 ou -10 (pontos percentuais)
}

/**
 * Métricas agregadas da equipe
 */
export interface TeamMetrics {
  // Período atual
  totalDeliveries: number
  avgCompletionRate: number
  velocity: number // ações/semana ou ações/mês
  totalLate: number
  totalMembers: number
  totalActions: number

  // Comparativos
  deliveriesChange: number
  deliveriesChangePercent: number
  velocityChange: number
  lateChange: number
  completionRateChange: number
}

/**
 * Ponto de dados para gráfico de tendência
 */
export interface DeliveryTrendDataPoint {
  date: string // ISO date
  deliveries: number
  label: string // Label formatada para exibição
}

/**
 * Dados de comparação de métricas
 */
export interface MetricComparison {
  absolute: number // +15 ou -3
  percent: number // +50 ou -20
  isImprovement: boolean // true = verde, false = vermelho
  isInverted?: boolean // true = menos é melhor (para atrasadas)
}
