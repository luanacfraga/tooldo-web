import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Team } from '@/lib/api/endpoints/teams'
import { Edit, Pencil, Users } from 'lucide-react'

interface TeamCardProps {
  item: Team
  managerName?: string
  onEdit?: (team: Team) => void
  onViewMembers?: (team: Team) => void
  onEditTeam?: (team: Team) => void
}

export function TeamCard({ item, managerName, onEdit, onViewMembers, onEditTeam }: TeamCardProps) {
  return (
    <Card className="group/card relative overflow-hidden border border-border/60 bg-card/95 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-border/80 hover:bg-card hover:shadow-md">
      <div className="space-y-3">
        
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-base font-semibold">{item.name}</h3>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover/card:opacity-100">
            {onViewMembers && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onViewMembers(item)}
                title="Ver membros"
              >
                <Users className="h-4 w-4" />
              </Button>
            )}
            {onEditTeam && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEditTeam(item)}
                title="Editar equipe"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        
        {managerName && (
          <p className="text-xs text-muted-foreground">
            Gestor: <span className="font-medium text-foreground">{managerName}</span>
          </p>
        )}

        
        {item.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
        )}

        
        {item.iaContext && (
          <div className="border-t border-border/40 pt-2">
            <p className="mb-1 text-xs text-muted-foreground">Contexto de IA:</p>
            <p className="line-clamp-2 text-xs text-foreground">{item.iaContext}</p>
          </div>
        )}
      </div>
    </Card>
  )
}
