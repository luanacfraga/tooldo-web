import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, MapPin } from 'lucide-react';
import type { Company } from '@/lib/api/endpoints/companies';

interface CompanyCardProps {
  item: Company;
}

export function CompanyCard({ item }: CompanyCardProps) {
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

        
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        )}

        
        <div className="pt-2 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            ID: <span className="font-medium text-foreground">{item.id.slice(0, 8)}...</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
