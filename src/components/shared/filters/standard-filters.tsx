'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FilterPopover } from './filter-popover';
import { StandardFiltersProps, FilterConfig } from './filter-types';
import { cn } from '@/lib/utils';

export function StandardFilters({
  config,
  values,
  onChange,
  onClear,
}: StandardFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    onChange({ ...values, [key]: value });
  };

  const hasActiveFilters = Object.entries(values).some(
    ([key, value]) =>
      value !== 'all' && value !== '' && value !== false && value !== null
  );

  const handleClearAll = () => {
    const cleared: Record<string, any> = {};
    config.forEach((filter) => {
      if (filter.type === 'search') {
        cleared[filter.key] = '';
      } else if (filter.type === 'toggle') {
        cleared[filter.key] = false;
      } else {
        cleared[filter.key] = 'all';
      }
    });
    onChange(cleared);
    onClear?.();
  };

  const searchFilters = config.filter((f) => f.type === 'search');
  const selectFilters = config.filter((f) => f.type === 'select');
  const toggleFilters = config.filter((f) => f.type === 'toggle');

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Search bars */}
      {searchFilters.map((filter) => (
        <div key={filter.key} className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={filter.placeholder || 'Buscar...'}
            value={values[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
      ))}

      {/* Filter buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {selectFilters.map((filter) => (
          <FilterPopover
            key={filter.key}
            label={filter.label}
            icon={filter.icon && <filter.icon className="h-4 w-4" />}
            options={filter.options || []}
            value={values[filter.key] || 'all'}
            onChange={(value) => handleFilterChange(filter.key, value)}
          />
        ))}

        {toggleFilters.map((filter) => (
          <Button
            key={filter.key}
            variant="outline"
            size="sm"
            className={cn(
              'h-9 gap-2 text-sm',
              values[filter.key]
                ? 'border-solid border-primary'
                : 'border-dashed border-border'
            )}
            onClick={() => handleFilterChange(filter.key, !values[filter.key])}
          >
            {filter.icon && <filter.icon className="h-4 w-4" />}
            {filter.label}
          </Button>
        ))}

        {/* Clear all button */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-2 text-sm"
            onClick={handleClearAll}
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
