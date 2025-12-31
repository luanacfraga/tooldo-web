import { Badge } from '@/components/ui/badge';
import { ActionStatus } from '@/lib/types/action';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ActionStatus;
  className?: string;
}

const statusConfig = {
  [ActionStatus.TODO]: {
    label: 'Pendente',
    className: 'bg-muted/50 text-muted-foreground border-muted hover:bg-muted/80',
  },
  [ActionStatus.IN_PROGRESS]: {
    label: 'Em Andamento',
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
  },
  [ActionStatus.DONE]: {
    label: 'Concluído',
    className: 'bg-success/10 text-success-700 border-success/20 hover:bg-success/20 dark:text-success',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("whitespace-nowrap font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
