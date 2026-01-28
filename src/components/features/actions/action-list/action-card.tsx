import { Card, CardContent } from '@/components/ui/card'
import { PriorityBadge } from '@/components/ui/priority-badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Action } from '@/lib/types/action'
import { cn } from '@/lib/utils'
import { Calendar, UserCircle2 } from 'lucide-react'
import { BlockedBadge } from '../shared/blocked-badge'
import { getActionDateDisplay } from '../shared/action-date-display'

interface ActionCardProps {
  data: Action
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function ActionCard({ data, onView }: ActionCardProps) {



  return (
    <Card
      className={cn(
        'cursor-pointer overflow-hidden transition-colors duration-200 hover:border-primary/50 active:scale-[0.98]',
        data.isBlocked && 'border-muted-foreground/20 bg-muted/40 hover:border-muted-foreground/30'
      )}
      onClick={onView}
    >
      <CardContent className="space-y-3 p-4">
        
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 flex-1 text-sm font-semibold leading-tight">{data.title}</h3>
          <PriorityBadge priority={data.priority} showLabel={false} />
        </div>

        
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={data.status} />
          
          <BlockedBadge isBlocked={data.isBlocked} reason={data.blockedReason} />
        </div>

        
        <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <UserCircle2 className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">
              {data.responsible?.firstName
                ? `${data.responsible.firstName} ${data.responsible.lastName?.[0] || ''}.`
                : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1.5" title={getActionDateDisplay(data).tooltip}>
            <Calendar className="h-3.5 w-3.5" />
            <span>{getActionDateDisplay(data).label}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
