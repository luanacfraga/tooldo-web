import { ActionStatus } from './action'

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

export interface DeliveryTrendDataPoint {
  date: string
  deliveries: number
  label: string
}

export interface MetricComparison {
  absolute: number
  percent: number
  isImprovement: boolean
  isInverted?: boolean
}
