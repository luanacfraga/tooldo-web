'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionStats } from './action-stats';
import { useAuth } from '@/lib/hooks/use-auth';

export function ActionListHeader() {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Actions</h1>
        <ActionStats />
      </div>
      {canCreate && (
        <Button asChild>
          <Link href="/actions/new">
            <Plus className="mr-2 h-4 w-4" />
            New Action
          </Link>
        </Button>
      )}
    </div>
  );
}
