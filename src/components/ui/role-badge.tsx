import { Badge } from '@/components/ui/badge'
import { USER_ROLES, USER_ROLES_LABELS } from '@/lib/constants'
import type { UserRole } from '@/lib/permissions'
import { cn } from '@/lib/utils'

const ROLE_STYLES: Record<
  UserRole,
  {
    variant: 'outline'
    className?: string
  }
> = {
  [USER_ROLES.MASTER]: {
    variant: 'outline',
    className: 'border-primary/60 bg-primary/10 text-primary',
  },
  [USER_ROLES.ADMIN]: {
    variant: 'outline',
    className: 'border-primary/60 bg-primary/10 text-primary',
  },
  [USER_ROLES.MANAGER]: {
    variant: 'outline',
    className: 'border-primary/60 bg-primary/10 text-primary',
  },
  [USER_ROLES.EXECUTOR]: {
    variant: 'outline',
    className: 'border-primary/60 bg-primary/10 text-primary',
  },
  [USER_ROLES.CONSULTANT]: {
    variant: 'outline',
    className: 'border-primary/60 bg-primary/10 text-primary',
  },
}

interface RoleBadgeProps {
  role: UserRole | string | null | undefined
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (!role) return null

  const normalizedRole = role as UserRole
  const label = USER_ROLES_LABELS[normalizedRole] ?? role
  const style = ROLE_STYLES[normalizedRole] ?? {
    variant: 'outline' as const,
    className: 'text-xs',
  }

  return (
    <Badge
      variant={style.variant}
      className={cn(
        'h-5 px-2 text-[11px] font-semibold uppercase tracking-wide',
        style.className,
        className
      )}
    >
      {label}
    </Badge>
  )
}
