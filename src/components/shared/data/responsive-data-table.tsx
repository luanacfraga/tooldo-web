import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/hooks/use-media-query';

interface ResponsiveDataTableProps<T> {
  data: T[];
  headers: {
    label: string;
    align?: 'left' | 'center' | 'right';
    className?: string;
  }[];
  children: (item: T) => ReactNode;
  CardComponent: (props: { data: T }) => ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
}

/**
 * Componente de tabela responsiva que alterna automaticamente entre
 * Tabela (Desktop) e Cards (Mobile)
 */
export function ResponsiveDataTable<T>({
  data,
  headers,
  children,
  CardComponent,
  emptyMessage,
  isLoading,
  className,
}: ResponsiveDataTableProps<T>) {
  const isMobile = useIsMobile();
  const hasContent = !isLoading && data && data.length > 0;
  const showEmpty = !isLoading && (!data || data.length === 0);

  if (isLoading && (!data || data.length === 0)) {
    return (
      <Card className={cn('w-full', className)}>
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Carregando...</span>
        </div>
      </Card>
    );
  }

  if (showEmpty) {
    return (
      <Card className={cn('w-full', className)}>
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
          <span>{emptyMessage || 'Nenhum dado encontrado'}</span>
        </div>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <div className={cn('space-y-4 relative', className)}>
        
        {isLoading && data.length > 0 && (
          <div className="sticky top-0 left-0 right-0 h-1 bg-primary/20 z-10 mb-4">
            <div className="h-full bg-primary animate-pulse" />
          </div>
        )}
        <div className={cn(isLoading && 'opacity-70 transition-opacity')}>
          {data.map((item, idx) => (
            <div key={idx}>
              <CardComponent data={item} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('w-full overflow-hidden relative', className)}>
      
      {isLoading && data.length > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 z-10">
          <div className="h-full bg-primary animate-pulse" />
        </div>
      )}
      <div className={cn('overflow-x-auto', isLoading && 'opacity-70 transition-opacity')}>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={cn(
                    'h-10 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
                    header.align === 'center' && 'text-center',
                    header.align === 'right' && 'text-right',
                    header.className
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {data.map((item, index) => children(item))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

