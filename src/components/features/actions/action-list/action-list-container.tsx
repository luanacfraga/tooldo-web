'use client';

import { useActionFiltersStore } from '@/lib/stores/action-filters-store';
import { ActionTable } from './action-table';
import { ActionKanbanBoard } from './action-kanban-board';
import { useEffect, useState } from 'react';
import { ActionListSkeleton } from './action-list-skeleton';

export function ActionListContainer() {
  const { viewMode } = useActionFiltersStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ActionListSkeleton />;
  }

  if (viewMode === 'kanban') {
    return <ActionKanbanBoard />;
  }

  return <ActionTable />;
}

