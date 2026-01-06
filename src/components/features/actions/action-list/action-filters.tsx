'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionPriority, ActionStatus } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { getActionStatusUI } from '../shared/action-status-ui'
import { getActionPriorityUI } from '../shared/action-priority-ui'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Filter,
  Flag,
  LayoutGrid,
  LayoutList,
  Search,
  UserCircle2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ActionFilters() {
  const filters = useActionFiltersStore()
  const router = useRouter()

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.priority !== 'all' ||
    filters.assignment !== 'all' ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.showBlockedOnly ||
    filters.showLateOnly

  const getButtonState = (isActive: boolean) => {
    return cn(
      'h-9 text-xs font-medium transition-all',
      'border-border/50 bg-background/80 hover:bg-accent/70 hover:border-border',
      'shadow-sm',
      isActive && 'border-primary/60 bg-primary/10 text-primary hover:bg-primary/15 shadow-primary/10'
    )
  }

  const getStatusPill = (status: ActionStatus) => {
    const ui = getActionStatusUI(status)
    return {
      dot: ui.dotClass,
      itemActive: ui.badgeClass,
    }
  }

  const getPriorityPill = (priority: ActionPriority) => {
    switch (priority) {
      case ActionPriority.LOW:
        return {
          flagClass: getActionPriorityUI(ActionPriority.LOW).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.LOW).itemActiveClass,
        }
      case ActionPriority.MEDIUM:
        return {
          flagClass: getActionPriorityUI(ActionPriority.MEDIUM).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.MEDIUM).itemActiveClass,
        }
      case ActionPriority.HIGH:
        return {
          flagClass: getActionPriorityUI(ActionPriority.HIGH).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.HIGH).itemActiveClass,
        }
      case ActionPriority.URGENT:
        return {
          flagClass: getActionPriorityUI(ActionPriority.URGENT).flagClass,
          itemActive: getActionPriorityUI(ActionPriority.URGENT).itemActiveClass,
        }
      default:
        return {
          flagClass: 'text-muted-foreground',
          itemActive: 'bg-primary/10 text-primary' as const,
        }
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/40 bg-gradient-to-br from-card to-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
          <Input
            placeholder="Buscar ações..."
            value={filters.searchQuery}
            onChange={(e) => filters.setFilter('searchQuery', e.target.value)}
            className="h-10 bg-background/80 pl-10 pr-4 border-border/50 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
          />
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/50 bg-background/60 p-0.5 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', 'list')}
              className={cn(
                'h-8 w-8 p-0 transition-all',
                filters.viewMode === 'list'
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'hover:bg-accent/50'
              )}
              title="Tabela"
              aria-label="Visualizar como tabela"
              aria-pressed={filters.viewMode === 'list'}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => filters.setFilter('viewMode', 'kanban')}
              className={cn(
                'h-8 w-8 p-0 transition-all',
                filters.viewMode === 'kanban'
                  ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
                  : 'hover:bg-accent/50'
              )}
              title="Kanban"
              aria-label="Visualizar como kanban"
              aria-pressed={filters.viewMode === 'kanban'}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wide pr-2">
          <Filter className="h-3.5 w-3.5" />
          <span>Filtros</span>
        </div>

        {/* Status Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.statuses.length > 0)}
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              <span>Status</span>
              {filters.statuses.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {filters.statuses.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs font-normal"
                  onClick={() => filters.setFilter('statuses', [])}
                >
                  Todos
                  {filters.statuses.length === 0 && (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </Button>
                <div className="my-1 h-px bg-muted" />
                {[
                  { label: 'Pendente', value: ActionStatus.TODO },
                  { label: 'Em Andamento', value: ActionStatus.IN_PROGRESS },
                  { label: 'Concluído', value: ActionStatus.DONE },
                ].map((option) => (
                  (() => {
                    const meta = getStatusPill(option.value)
                    const isActive = filters.statuses.includes(option.value)
                    return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start text-xs font-normal',
                      isActive && meta.itemActive
                    )}
                    onClick={() => {
                      const next = isActive
                        ? filters.statuses.filter((s) => s !== option.value)
                        : [...filters.statuses, option.value]
                      filters.setFilter('statuses', next)
                    }}
                  >
                    <span className={cn('mr-2 inline-block h-2 w-2 rounded-full', meta.dot)} />
                    <span>{option.label}</span>
                    {isActive && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
                  </Button>
                    )
                  })()
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Priority Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.priority !== 'all')}
            >
              <Flag className="mr-1.5 h-3.5 w-3.5" />
              <span>Prioridade</span>
              {filters.priority !== 'all' && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs font-normal"
                  onClick={() => filters.setFilter('priority', 'all')}
                >
                  Todas
                  {filters.priority === 'all' && (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </Button>
                <div className="my-1 h-px bg-muted" />
                {[
                  { label: 'Baixa', value: ActionPriority.LOW },
                  { label: 'Média', value: ActionPriority.MEDIUM },
                  { label: 'Alta', value: ActionPriority.HIGH },
                  { label: 'Urgente', value: ActionPriority.URGENT },
                ].map((option) => (
                  (() => {
                    const meta = getPriorityPill(option.value)
                    const isActive = filters.priority === option.value
                    return (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start text-xs font-normal',
                      isActive && meta.itemActive
                    )}
                    onClick={() => filters.setFilter('priority', option.value as ActionPriority)}
                  >
                    <Flag className={cn('mr-2 h-3.5 w-3.5', meta.flagClass)} />
                    <span>{option.label}</span>
                    {isActive && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
                  </Button>
                    )
                  })()
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Assignment Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.assignment !== 'all')}
            >
              <UserCircle2 className="mr-1.5 h-3.5 w-3.5" />
              <span>Atribuição</span>
              {filters.assignment !== 'all' && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <div className="p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs font-normal"
                  onClick={() => filters.setFilter('assignment', 'all')}
                >
                  Todas
                  {filters.assignment === 'all' && (
                    <CheckCircle2 className="ml-auto h-3.5 w-3.5 opacity-50" />
                  )}
                </Button>
                <div className="my-1 h-px bg-muted" />
                {[
                  { label: 'Atribuídas a Mim', value: 'assigned-to-me' as const },
                  { label: 'Criadas por Mim', value: 'created-by-me' as const },
                  { label: 'Minhas Equipes', value: 'my-teams' as const },
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start text-xs font-normal',
                      filters.assignment === option.value && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => filters.setFilter('assignment', option.value)}
                  >
                    {option.label}
                    {filters.assignment === option.value && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(!!filters.dateFrom || !!filters.dateTo)}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              <span>Data</span>
              {(filters.dateFrom || filters.dateTo) && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <div className="p-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Filtrar por
                </label>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start text-xs font-normal',
                      filters.dateFilterType === 'createdAt' && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', 'createdAt')}
                  >
                    Data de Criação
                    {filters.dateFilterType === 'createdAt' && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'w-full justify-start text-xs font-normal',
                      filters.dateFilterType === 'startDate' && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', 'startDate')}
                  >
                    Data de Início
                    {filters.dateFilterType === 'startDate' && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="h-px bg-muted" />

              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Período
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">De</label>
                    <Input
                      type="date"
                      value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null
                        filters.setFilter('dateFrom', date)
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Até</label>
                    <Input
                      type="date"
                      value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : null
                        filters.setFilter('dateTo', date)
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {(filters.dateFrom || filters.dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    filters.setFilter('dateFrom', null)
                    filters.setFilter('dateTo', null)
                  }}
                  className="w-full h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="mr-1.5 h-3 w-3" />
                  Limpar datas
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="mx-0.5 h-5 w-px bg-border/40" />

        {/* Quick Toggles */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => filters.setFilter('showBlockedOnly', !filters.showBlockedOnly)}
          className={getButtonState(filters.showBlockedOnly)}
        >
          <span>Bloqueadas</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => filters.setFilter('showLateOnly', !filters.showLateOnly)}
          className={getButtonState(filters.showLateOnly)}
        >
          <span>Atrasadas</span>
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <div className="mx-0.5 h-5 w-px bg-border/40" />
            <Button
              variant="ghost"
              size="sm"
              onClick={filters.resetFilters}
              className="h-9 px-3 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <span>Limpar</span>
              <X className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
