import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Plan } from '@/lib/types/plan';

interface PlanCardProps {
  item: Plan;
}

export function PlanCard({ item }: PlanCardProps) {
  return (
    <Card className="group/card relative overflow-hidden bg-card/95 backdrop-blur-sm border border-border/60 shadow-sm hover:shadow-md hover:border-border/80 hover:bg-card transition-all duration-200 ease-in-out hover:-translate-y-0.5 p-4">
      <div className="space-y-3">
        
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-base">{item.name}</h3>
          <div className="flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Empresas</p>
            <p className="font-medium">{item.maxCompanies}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Gestores</p>
            <p className="font-medium">{item.maxManagers}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Executores</p>
            <p className="font-medium">{item.maxExecutors}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Consultores</p>
            <p className="font-medium">{item.maxConsultants}</p>
          </div>
        </div>

        
        <div className="pt-2 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            Chamadas IA: <span className="font-medium text-foreground">{item.iaCallsLimit}</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
