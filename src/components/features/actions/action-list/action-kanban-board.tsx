'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { useKanbanActions } from '@/lib/hooks/use-kanban-actions'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionStatus, type Action, type ActionFilters } from '@/lib/types/action'
import { DndContext, DragOverlay, closestCenter, useDroppable, type DraggableSyntheticListeners } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { useMemo, useState, useCallback, memo } from 'react'
import { ActionDetailSheet } from '../action-detail-sheet'
import { PriorityBadge } from '../shared/priority-badge'
import { ActionListEmpty } from './action-list-empty'
import { ActionListSkeleton } from './action-list-skeleton'
import { CalendarIcon, AlertCircleIcon, Eye } from 'lucide-react'

// Helper to generate color from string - memoized for performance
const colorCache = new Map<string, string>();
const stringToColor = (str: string) => {
  if (colorCache.has(str)) {
    return colorCache.get(str)!;
  }

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  const color = '#' + '00000'.substring(0, 6 - c.length) + c;

  colorCache.set(str, color);
  return color;
}

const columns = [
  {
    id: ActionStatus.TODO,
    title: 'Pendentes',
    status: ActionStatus.TODO,
  },
  {
    id: ActionStatus.IN_PROGRESS,
    title: 'Em Andamento',
    status: ActionStatus.IN_PROGRESS,
  },
  {
    id: ActionStatus.DONE,
    title: 'Concluídas',
    status: ActionStatus.DONE,
  },
]

const columnStyles = {
  [ActionStatus.TODO]: {
    containerClass: "bg-warning/5 border-warning/10",
    barClass: "bg-warning",
    titleClass: "text-warning",
    countClass: "bg-warning/10 text-warning border border-warning/20",
  },
  [ActionStatus.IN_PROGRESS]: {
    containerClass: "bg-primary/5 border-primary/10",
    barClass: "bg-primary",
    titleClass: "text-primary",
    countClass: "bg-primary/10 text-primary border border-primary/20",
  },
  [ActionStatus.DONE]: {
    containerClass: "bg-success/5 border-success/10",
    barClass: "bg-success",
    titleClass: "text-success",
    countClass: "bg-success/10 text-success border border-success/20",
  },
}

const kanbanStyles = `
  .kanban-column-drag-over {
    background-color: hsl(var(--muted));
    opacity: 0.8;
    border-style: dashed;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    margin: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.15);
    border-radius: 10px;
    transition: background-color 0.2s ease;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.3);
  }

  .kanban-board-container {
    scroll-snap-type: x mandatory;
    scroll-padding: 0 1rem;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  .kanban-column {
    scroll-snap-align: center;
    scroll-snap-stop: always;
  }

  @media (min-width: 768px) {
    .kanban-board-container {
      scroll-snap-type: none;
    }
  }

  .kanban-card-hover {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .kanban-card-hover:hover {
    transform: translateY(-2px);
  }

  .kanban-card-dragging {
    transition: none;
  }
`

export function ActionKanbanBoard() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const filtersState = useActionFiltersStore()
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  // Build API filters from store
  const apiFilters: ActionFilters = useMemo(() => {
    const filters: ActionFilters = {}

    if (filtersState.status !== 'all') filters.status = filtersState.status
    if (filtersState.priority !== 'all') filters.priority = filtersState.priority
    if (filtersState.showBlockedOnly) filters.isBlocked = true
    if (filtersState.showLateOnly) filters.isLate = true

    // Assignment filters
    if (filtersState.assignment === 'assigned-to-me') {
      filters.responsibleId = user?.id
    }

    // Company/Team filters
    if (filtersState.companyId) {
      filters.companyId = filtersState.companyId
    } else if (selectedCompany?.id) {
      filters.companyId = selectedCompany.id
    }

    if (filtersState.teamId) filters.teamId = filtersState.teamId

    return filters
  }, [filtersState, user, selectedCompany])

  const {
    actions,
    isLoading,
    error,
    getColumnActions,
    sensors,
    handleDragStart: originalHandleDragStart,
    handleDragEnd: originalHandleDragEnd,
    activeAction,
  } = useKanbanActions(apiFilters)

  const handleDragStart = (event: any) => {
    originalHandleDragStart(event)
    const action = event.active?.data?.current?.action
    if (action) {
      setAnnouncement(`Movendo ação: ${action.title}`)
    }
  }

  const handleDragEnd = (event: any) => {
    originalHandleDragEnd(event)
    const action = event.active?.data?.current?.action
    const overColumn = event.over?.id
    if (action && overColumn) {
      const columnNames = {
        [ActionStatus.TODO]: 'Pendentes',
        [ActionStatus.IN_PROGRESS]: 'Em Andamento',
        [ActionStatus.DONE]: 'Concluídas',
      }
      setAnnouncement(`Ação ${action.title} movida para ${columnNames[overColumn as ActionStatus]}`)
    } else {
      setAnnouncement('')
    }
  }

  // Apply client-side filters
  const getFilteredColumnActions = useMemo(() => {
    return (status: ActionStatus) => {
      let result = getColumnActions(status)

      if (filtersState.assignment === 'created-by-me' && user?.id) {
        result = result.filter((a) => a.creatorId === user.id)
      }

      const q = filtersState.searchQuery?.trim().toLowerCase()
      if (q) {
        result = result.filter((a) => {
          const haystack = `${a.title} ${a.description}`.toLowerCase()
          return haystack.includes(q)
        })
      }

      return result
    }
  }, [getColumnActions, filtersState.assignment, filtersState.searchQuery, user?.id])

  const canCreate = user?.role === 'admin' || user?.role === 'manager'
  const hasFilters =
    filtersState.status !== 'all' ||
    filtersState.priority !== 'all' ||
    filtersState.assignment !== 'all' ||
    filtersState.showBlockedOnly ||
    filtersState.showLateOnly ||
    !!filtersState.searchQuery

  if (isLoading) return <ActionListSkeleton />

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Erro ao carregar ações. Tente novamente.</p>
      </div>
    )
  }

  if (actions.length === 0) {
    return (
      <ActionListEmpty
        hasFilters={hasFilters}
        canCreate={canCreate}
        onClearFilters={filtersState.resetFilters}
      />
    )
  }

  const handleActionClick = useCallback((actionId: string) => {
    setSelectedActionId(actionId)
    setSheetOpen(true)
  }, [])

  return (
    <>
      <style jsx global>{kanbanStyles}</style>
      {/* ARIA live region for screen reader announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className="kanban-board-container custom-scrollbar flex gap-4 overflow-x-auto px-4 pb-4 md:grid md:grid-cols-3 md:gap-6 md:overflow-x-visible md:px-0"
          role="region"
          aria-label="Quadro Kanban de ações"
        >
          {columns.map((column) => {
            const columnActions = getFilteredColumnActions(column.status)

            return (
              <KanbanColumn
                key={column.id}
                column={column}
                actions={columnActions}
                onActionClick={handleActionClick}
              />
            )
          })}
        </div>

        <DragOverlay>
          {activeAction && <ActionKanbanCard action={activeAction} isDragging />}
        </DragOverlay>
      </DndContext>

      <ActionDetailSheet actionId={selectedActionId} open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  )
}

interface KanbanColumnProps {
  column: { id: ActionStatus; title: string; status: ActionStatus }
  actions: Action[]
  onActionClick: (actionId: string) => void
}

function KanbanColumn({ column, actions, onActionClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const { containerClass, barClass, titleClass, countClass } = columnStyles[column.status];

  return (
    <SortableContext
      id={column.id}
      items={actions.map((a) => a.id)}
      strategy={verticalListSortingStrategy}
    >
      <div
        ref={setNodeRef}
        data-id={column.id}
        className={`kanban-column flex w-[calc(100vw-3rem)] flex-shrink-0 flex-col rounded-2xl border shadow-sm backdrop-blur-sm transition-all duration-300 sm:w-[calc(50vw-2rem)] md:w-full md:flex-shrink ${containerClass} ${isOver ? 'kanban-column-drag-over' : ''}`}
        style={{ minHeight: '500px', maxHeight: 'calc(100vh - 220px)' }}
      >
        {/* Column Header */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-4">
          <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${barClass}`} />
          <h3 className={`text-sm font-semibold tracking-tight ${titleClass}`}>
            {column.title}
          </h3>
          <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${countClass}`}>
            {actions.length}
          </span>
        </div>

        {/* Column Body */}
        <div
          className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 custom-scrollbar"
          role="list"
          aria-label={`Ações ${column.title.toLowerCase()}`}
        >
          {actions.map((action) => (
            <SortableActionCard
              key={action.id}
              action={action}
              onClick={() => onActionClick(action.id)}
            />
          ))}
          {isOver && <div className="h-1 bg-primary/20 rounded mx-2 animate-pulse" />}
        </div>
      </div>
    </SortableContext>
  )
}

interface SortableActionCardProps {
  action: Action
  onClick: () => void
}

const SortableActionCard = memo(function SortableActionCard({ action, onClick }: SortableActionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: action.id,
    data: { action },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} role="listitem">
      <ActionKanbanCard
        action={action}
        onClick={onClick}
        isDragging={isDragging}
        dragListeners={listeners}
      />
    </div>
  )
})

const ActionKanbanCard = memo(function ActionKanbanCard({
  action,
  onClick,
  isDragging = false,
  dragListeners,
}: {
  action: Action
  onClick?: () => void
  isDragging?: boolean
  dragListeners?: DraggableSyntheticListeners | undefined
}) {
  const checklistProgress = useMemo(() => {
    if (!action.checklistItems) return '0/0';
    const completed = action.checklistItems.filter((i) => i.isCompleted).length;
    return `${completed}/${action.checklistItems.length}`;
  }, [action.checklistItems])

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onClick) {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDragging && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <Card
      className={`
        kanban-card-hover group/card relative overflow-hidden
        border border-border/60 bg-card/95 shadow-sm backdrop-blur-sm
        ${!isDragging && 'hover:border-border/80 hover:shadow-md hover:bg-card'}
        ${isDragging ? 'kanban-card-dragging opacity-90 shadow-2xl ring-2 ring-primary/50 ring-offset-2 scale-105' : ''}
      `}
    >
      <CardContent className="p-4 space-y-3">
        {/* Clickable Header */}
        <div
          className="flex items-start justify-between gap-3 cursor-pointer group/header -mx-1 -mt-1 rounded-lg p-1 transition-colors hover:bg-muted/30 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          tabIndex={0}
          role="button"
          aria-label={`Visualizar detalhes: ${action.title}`}
        >
          <h4 className="line-clamp-2 flex-1 text-sm font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover/header:text-primary">
            {action.title}
          </h4>
          <button
            type="button"
            className="shrink-0 rounded-full p-1.5 transition-all hover:bg-background/80 hover:shadow-sm opacity-0 group-hover/header:opacity-100"
            onClick={handleClick}
            aria-label="Visualizar detalhes da ação"
          >
            <Eye className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
          </button>
        </div>

        {/* Draggable Content */}
        <div {...dragListeners} className="space-y-3 select-none cursor-grab active:cursor-grabbing">
          {action.description && (
            <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">
              {action.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-xs font-medium">
                {format(new Date(action.estimatedEndDate), 'dd/MM')}
              </span>
            </div>

            <PriorityBadge
              priority={action.priority}
              className="text-[11px] px-2 py-1 h-auto font-semibold shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-2">
              {/* Avatar circle */}
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ring-2 ring-background"
                style={{ background: stringToColor(action.responsibleId || 'U') }}
              >
                {(action.responsibleId || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground font-medium">
                {action.responsibleId ? `#${action.responsibleId.slice(0, 4)}` : '—'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {action.isLate && (
                <div className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-destructive shadow-sm">
                  <AlertCircleIcon className="h-3 w-3" />
                  <span className="text-[11px] font-semibold">Atrasada</span>
                </div>
              )}
              <div className="flex items-center gap-1 rounded-full bg-muted/80 px-2 py-1 text-muted-foreground shadow-sm">
                <span className="text-[11px] font-semibold">☑ {checklistProgress}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
