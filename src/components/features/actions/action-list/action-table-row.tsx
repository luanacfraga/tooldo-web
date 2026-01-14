'use client'

import { ActionButton } from '@/components/ui/action-button'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { StatusBadge } from '@/components/ui/status-badge'
import { TableCell, TableRow } from '@/components/ui/table'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useMoveAction } from '@/lib/hooks/use-actions'
import { useAuth } from '@/lib/hooks/use-auth'
import { useCompany } from '@/lib/hooks/use-company'
import { useCompanyResponsibles } from '@/lib/services/queries/use-companies'
import { ActionStatus, type Action } from '@/lib/types/action'
import { toast } from 'sonner'
import { getActionDateDisplay } from '../shared/action-date-display'
import { BlockedBadge } from '../shared/blocked-badge'

interface ActionTableRowProps {
  action: Action
  canEdit: boolean
  canDelete: boolean
  onDelete: (id: string) => void
  onView: () => void
}

export function ActionTableRow({
  action,
  canEdit,
  canDelete,
  onDelete,
  onView,
}: ActionTableRowProps) {
  const moveAction = useMoveAction()
  const { user: authUser } = useAuth()
  const { selectedCompany } = useCompany()
  const { data: companyResponsibles = [] } = useCompanyResponsibles(selectedCompany?.id || '')

  const checklistProgress = action.checklistItems
    ? `${action.checklistItems.filter((i) => i.isCompleted).length}/${action.checklistItems.length}`
    : '—'
  const responsibleName =
    action.responsible?.firstName && action.responsible?.lastName
      ? `${action.responsible.firstName} ${action.responsible.lastName[0] || ''}.`
      : action.responsible?.firstName || '—'

  const currentResponsible = companyResponsibles.find(
    (employee) => employee.userId === action.responsibleId
  )

  const responsibleFromAction =
    action.responsible &&
    currentResponsible?.user &&
    action.responsible.id === currentResponsible.user.id
      ? currentResponsible.user
      : currentResponsible?.user

  const responsibleInitials =
    authUser && action.responsibleId === authUser.id
      ? (authUser.initials ?? null)
      : (responsibleFromAction?.initials ?? null)

  const responsibleAvatarColor =
    authUser && action.responsibleId === authUser.id
      ? (authUser.avatarColor ?? null)
      : (responsibleFromAction?.avatarColor ?? null)

  const handleStatusChange = async (newStatus: ActionStatus) => {
    try {
      await moveAction.mutateAsync({
        id: action.id,
        data: { toStatus: newStatus },
      })
      toast.success('Status atualizado com sucesso')
    } catch (error) {
      toast.error('Erro ao atualizar status')
    }
  }

  return (
    <TableRow className="cursor-pointer transition-colors hover:bg-muted/50" onClick={onView}>
      <TableCell className="font-medium">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">{action.title}</span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile-only status/priority indicators could go here if needed, 
                 but table is hidden on mobile anyway in favor of cards */}
            {/* <LateIndicator isLate={action.isLate} /> */}
            <BlockedBadge isBlocked={action.isBlocked} reason={action.blockedReason} />
          </div>
        </div>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Select
          disabled={action.isBlocked || !canEdit}
          value={action.status}
          onValueChange={(value) => handleStatusChange(value as ActionStatus)}
        >
          <SelectTrigger className="h-auto w-auto border-none bg-transparent p-0 shadow-none hover:bg-transparent focus:ring-0 [&>svg]:hidden">
            <StatusBadge status={action.status} />
          </SelectTrigger>
          <SelectContent>
            {Object.values(ActionStatus).map((status) => (
              <SelectItem key={status} value={status}>
                <StatusBadge status={status} className="border-0 bg-transparent px-0 shadow-none" />
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="w-[120px]">
        <PriorityBadge priority={action.priority} />
      </TableCell>
      <TableCell className="w-[120px] text-sm text-muted-foreground">
        <div className="flex items-center justify-center">
          <span className="sr-only">{responsibleName}</span>
          <UserAvatar
            id={action.responsibleId}
            firstName={responsibleFromAction?.firstName ?? action.responsible?.firstName}
            lastName={responsibleFromAction?.lastName ?? action.responsible?.lastName}
            initials={responsibleInitials}
            avatarColor={responsibleAvatarColor}
            size="sm"
            className="h-6 w-6 text-[9px]"
          />
        </div>
      </TableCell>
      <TableCell className="w-[180px] text-sm text-muted-foreground">
        <span title={getActionDateDisplay(action).tooltip}>
          {getActionDateDisplay(action).label}
        </span>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{checklistProgress}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <ActionButton
            action="view"
            onClick={(e) => {
              e.stopPropagation()
              onView()
            }}
            showLabel={false}
            size="sm"
            className="h-8 w-8"
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
