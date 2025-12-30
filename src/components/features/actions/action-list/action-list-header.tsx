'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionStats } from './action-stats';
import { useAuth } from '@/lib/hooks/use-auth';
import { PageHeader } from '@/components/shared/layout/page-header';

export function ActionListHeader() {
  const { user } = useAuth();
  const canCreate = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div>
      <PageHeader
        title="Ações"
        description="Gerencie e acompanhe o progresso das suas tarefas"
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/actions/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Ação
              </Link>
            </Button>
          ) : null
        }
      />
      <div className="-mt-2 mb-6">
        <ActionStats />
      </div>
    </div>
  );
}
