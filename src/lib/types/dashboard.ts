import { ActionStatus } from './action'

/**
 * Métricas de um membro da equipe
 */
export interface TeamMemberMetrics {
  userId: string
  name: string
  avatar?: string

  totalDeliveries: number
  completionRate: number
  inProgress: number
  late: number
  totalActions: number

  deliveriesChange: number
  deliveriesChangePercent: number
  completionRateChange: number
}

/**
 * Métricas agregadas da equipe
 */
export interface TeamMetrics {
  totalDeliveries: number
  avgCompletionRate: number
  velocity: number
  totalLate: number
  totalMembers: number
  totalActions: number

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
  date: string
  deliveries: number
  label: string
}

/**
 * Dados de comparação de métricas
 */
export interface MetricComparison {
  absolute: number
  percent: number
  isImprovement: boolean
  isInverted?: boolean
}
