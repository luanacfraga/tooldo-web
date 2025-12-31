'use client'

import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { useKanbanActions } from '@/lib/hooks/use-kanban-actions'
import { useActionFiltersStore } from '@/lib/stores/action-filters-store'
import { ActionStatus, type Action, type ActionFilters } from '@/lib/types/action'
import { DndContext, DragOverlay, closestCenter, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { ActionDetailSheet } from '../action-detail-sheet'
import { PriorityBadge } from '../shared/priority-badge'
import { ActionListEmpty } from './action-list-empty'
import { ActionListSkeleton } from './action-list-skeleton'
import { CalendarIcon, AlertCircleIcon, Eye } from 'lucide-react'

// Helper to generate color from string
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
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
    transition: all 0.2s ease-in-out;
  }

  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: hsl(var(--muted-foreground) / 0.3);
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: hsl(var(--muted-foreground) / 0.5);
  }

  .kanban-board-container {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .kanban-column {
    scroll-snap-align: start;
  }
`

export function ActionKanbanBoard() {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const filtersState = useActionFiltersStore()
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

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
    handleDragStart,
    handleDragEnd,
    activeAction,
  } = useKanbanActions(apiFilters)

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

  const handleActionClick = (actionId: string) => {
    setSelectedActionId(actionId)
    setSheetOpen(true)
  }

  return (
    <>
      <style jsx global>{kanbanStyles}</style>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board-container custom-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-x-visible">
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
        className={`kanban-column flex w-full min-w-[85vw] flex-col rounded-xl border shadow-sm transition-all duration-150 md:min-w-0 ${containerClass} ${isOver ? 'kanban-column-drag-over' : ''}`}
        style={{ minHeight: '400px', maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* Column Header */}
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <span className={`h-2 w-2 rounded-full ${barClass}`} />
          <h3 className={`text-sm font-semibold ${titleClass}`}>
            {column.title}
          </h3>
          <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${countClass}`}>
            {actions.length} {actions.length === 1 ? 'tarefa' : 'tarefas'}
          </span>
        </div>

        {/* Column Body */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 pb-2 custom-scrollbar">
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

function SortableActionCard({ action, onClick }: SortableActionCardProps) {
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
    <div ref={setNodeRef} style={style} {...attributes}>
      <ActionKanbanCard
        action={action}
        onClick={onClick}
        isDragging={isDragging}
        dragListeners={listeners}
      />
    </div>
  )
}

function ActionKanbanCard({
  action,
  onClick,
  isDragging = false,
  dragListeners,
}: {
  action: Action
  onClick?: () => void
  isDragging?: boolean
  dragListeners?: any
}) {
  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '0/0'

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && onClick) {
      e.preventDefault()
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <Card 
      className={`
        border border-border/60 shadow-sm transition-all duration-200 
        hover:border-border hover:shadow-md
        ${isDragging ? 'opacity-80 ring-2 ring-primary ring-offset-2' : 'bg-card'}
      `}
    >
      <CardContent className="p-3 space-y-2.5">
        {/* Clickable Header */}
        <div
          className="flex items-start justify-between gap-2 cursor-pointer group"
          onClick={handleClick}
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
        >
          <h4 className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors flex-1">
            {action.title}
          </h4>
          <button
            type="button"
            className="shrink-0 rounded-full p-1.5 hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
            onClick={handleClick}
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Draggable Content */}
        <div {...dragListeners} className="space-y-2 select-none">
          {action.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {action.description}
            </p>
          )}

          {/* Meta Information */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
               <CalendarIcon className="w-3.5 h-3.5" />
               <span className="text-[11px] font-medium">
                 {format(new Date(action.estimatedEndDate), 'dd/MM')}
               </span>
            </div>
            
            <PriorityBadge 
              priority={action.priority} 
              className="text-[10px] px-1.5 py-0.5 h-auto" 
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-1">
             <div className="flex items-center gap-1.5">
               {/* Avatar circle */}
               <div 
                 className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white shadow-sm"
                 style={{ background: stringToColor(action.responsibleId || 'U') }}
               >
                 {(action.responsibleId || 'U').charAt(0).toUpperCase()}
               </div>
               <span className="text-[10px] text-muted-foreground font-medium">
                  {action.responsibleId ? `#${action.responsibleId.slice(0, 4)}` : '—'}
               </span>
             </div>

             <div className="flex items-center gap-2">
                {action.isLate && (
                   <div className="flex items-center gap-1 text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                     <AlertCircleIcon className="w-3 h-3" />
                     <span className="text-[10px] font-medium">Atrasada</span>
                   </div>
                )}
                <div className="flex items-center gap-1 text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                  <span className="text-[10px] font-medium">☑ {checklistProgress}</span>
                </div>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
