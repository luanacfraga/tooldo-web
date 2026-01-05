import { Badge } from '@/components/ui/badge';
import { ActionPriority } from '@/lib/types/action';
import { cn } from '@/lib/utils';
import { getActionPriorityUI } from './action-priority-ui';

interface PriorityBadgeProps {
  priority: ActionPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = getActionPriorityUI(priority);

  return (
    <Badge
      variant="outline"
      className={cn('whitespace-nowrap font-medium', config.pillClass, className)}
    >
      {config.label}
    </Badge>
  );
}
