import { ActionStatus } from '@/lib/types/action'

type StatusUI = {
  label: string
  dotClass: string
  badgeClass: string
  kanban: {
    containerClass: string
    barClass: string
    titleClass: string
    countClass: string
  }
}

export const actionStatusUI: Record<ActionStatus, StatusUI> = {
  [ActionStatus.TODO]: {
    label: 'Pendente',
    dotClass: 'bg-warning',
    badgeClass: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
    kanban: {
      containerClass: 'bg-warning/5 border-warning/10',
      barClass: 'bg-warning',
      titleClass: 'text-warning',
      countClass: 'bg-warning/10 text-warning border border-warning/20',
    },
  },
  [ActionStatus.IN_PROGRESS]: {
    label: 'Em Andamento',
    dotClass: 'bg-primary',
    badgeClass: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
    kanban: {
      containerClass: 'bg-primary/5 border-primary/10',
      barClass: 'bg-primary',
      titleClass: 'text-primary',
      countClass: 'bg-primary/10 text-primary border border-primary/20',
    },
  },
  [ActionStatus.DONE]: {
    label: 'Concluído',
    dotClass: 'bg-success',
    badgeClass: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
    kanban: {
      containerClass: 'bg-success/5 border-success/10',
      barClass: 'bg-success',
      titleClass: 'text-success',
      countClass: 'bg-success/10 text-success border border-success/20',
    },
  },
}

export function getActionStatusUI(status: ActionStatus): StatusUI {
  return actionStatusUI[status]
}


