import { Badge } from '@/components/ui/badge';
import { ActionPriority } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface PriorityBadgeProps {
  priority: ActionPriority;
  className?: string;
}

const priorityConfig = {
  [ActionPriority.LOW]: {
    label: 'Baixa',
    className: 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted/80',
  },
  [ActionPriority.MEDIUM]: {
    label: 'Média',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50',
  },
  [ActionPriority.HIGH]: {
    label: 'Alta',
    className: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50',
  },
  [ActionPriority.URGENT]: {
    label: 'Urgente',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
