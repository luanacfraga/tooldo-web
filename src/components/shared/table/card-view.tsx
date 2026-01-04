'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface CardViewProps<T> {
  data: T[];
  CardComponent: React.ComponentType<{ item: T }>;
  isLoading?: boolean;
  emptyMessage?: string;
  getRowId?: (row: T, index: number) => string;
}

export function CardView<T>({
  data,
  CardComponent,
  isLoading,
  emptyMessage = 'Nenhum item encontrado',
  getRowId,
}: CardViewProps<T>) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 custom-scrollbar">
      {data.map((item, index) => {
        const key = getRowId ? getRowId(item, index) : String(index);
        return <CardComponent key={key} item={item} />;
      })}
    </div>
  );
}
