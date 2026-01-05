import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockedBadgeProps {
  isBlocked: boolean;
  reason?: string | null;
  className?: string;
}

export function BlockedBadge({ isBlocked, reason, className }: BlockedBadgeProps) {
  if (!isBlocked) return null;

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 border-warning/40 bg-warning/10 text-warning', className)}
      title={reason || 'Ação bloqueada'}
    >
      <Lock className="h-3 w-3" />
      Bloqueada
    </Badge>
  );
}
