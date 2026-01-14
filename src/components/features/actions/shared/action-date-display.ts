import { Action, ActionStatus } from '@/lib/types/action'
import { format } from 'date-fns'

type ActionDateDisplay = {
  label: string
  tooltip: string
}

function formatSafe(dateString: string | null | undefined, pattern = 'dd/MM'): string | null {
  if (!dateString) return null
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return format(date, pattern)
}

export function getActionDateDisplay(action: Action): ActionDateDisplay {
  const estStart = formatSafe(action.estimatedStartDate)
  const estEnd = formatSafe(action.estimatedEndDate)
  const actualStart = formatSafe(action.actualStartDate)
  const actualEnd = formatSafe(action.actualEndDate)

  // Fallback genérico
  const fallbackLabel = estStart && estEnd ? `${estStart} - ${estEnd}` : estEnd || estStart || '—'

  if (action.status === ActionStatus.TODO) {
    if (estStart && estEnd) {
      return {
        label: `${estStart} - ${estEnd} (previsão)`,
        tooltip: 'Início previsto e fim previsto',
      }
    }
    return {
      label: `${fallbackLabel} (previsão)`,
      tooltip: 'Datas previstas',
    }
  }

  if (action.status === ActionStatus.IN_PROGRESS) {
    // Se já temos início real, mostramos ele + fim previsto
    if (actualStart && estEnd) {
      return {
        label: `${actualStart} (real) - ${estEnd} (previsão)`,
        tooltip: 'Início real e fim previsto',
      }
    }

    // Se ainda não temos início real, caímos para as previsões
    if (estStart && estEnd) {
      return {
        label: `${estStart} - ${estEnd} (previsão)`,
        tooltip: 'Início previsto e fim previsto',
      }
    }

    return {
      label: fallbackLabel,
      tooltip: 'Período da ação',
    }
  }

  // DONE
  if (actualStart && actualEnd) {
    return {
      label: `${actualStart} - ${actualEnd}`,
      tooltip: 'Início real e fim real',
    }
  }

  if (actualStart && !actualEnd) {
    return {
      label: `${actualStart} - —`,
      tooltip: 'Início real, fim ainda não informado',
    }
  }

  // Sem datas reais, usa previsões como fallback
  return {
    label: fallbackLabel,
    tooltip: 'Período da ação',
  }
}
