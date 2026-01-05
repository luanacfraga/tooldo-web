import type { Action, ActionStatus } from '@/lib/types/action'
import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useMoveAction } from './use-actions'

export function useKanbanActions(actions: Action[]) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeAction, setActiveAction] = useState<Action | null>(null)
  const moveAction = useMoveAction()

  // Configure sensors with proper activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3, tolerance: 5, delay: 50 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(MouseSensor, {
      activationConstraint: { distance: 3 },
    })
  )

  // Sort actions by position within column
  const getColumnActions = useCallback(
    (status: ActionStatus) => {
      return actions
        .filter((action) => action.status === status)
        .sort((a, b) => {
          const aPos = a.kanbanOrder?.position ?? 0
          const bPos = b.kanbanOrder?.position ?? 0
          return aPos - bPos
        })
    },
    [actions]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      setActiveId(active.id as string)
      const draggedAction = actions.find((action) => action.id === active.id)
      if (draggedAction) {
        setActiveAction(draggedAction)
      }
    },
    [actions]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setActiveAction(null)

      if (!over) return

      const activeAction = actions.find((action) => action.id === active.id)
      if (!activeAction) return

      // Determine new status and position
      const isColumn = ['TODO', 'IN_PROGRESS', 'DONE'].includes(over.id as string)
      const newStatus = isColumn
        ? (over.id as ActionStatus)
        : actions.find((a) => a.id === over.id)?.status

      if (!newStatus) return

      const columnActions = actions.filter((a) => a.status === newStatus)
      let newPosition = columnActions.length

      if (!isColumn) {
        const overIndex = columnActions.findIndex((a) => a.id === over.id)
        if (overIndex !== -1) {
          newPosition = overIndex
        }
      }

      // No-op if same position
      if (activeAction.status === newStatus && activeAction.kanbanOrder?.position === newPosition) {
        return
      }

      try {
        await moveAction.mutateAsync({
          id: activeAction.id,
          data: { toStatus: newStatus, position: newPosition },
        })
        toast.success('Ação movida com sucesso')
      } catch (error) {
        toast.error('Erro ao mover ação')
      }
    },
    [actions, moveAction]
  )

  return {
    getColumnActions,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
    activeAction,
  }
}
