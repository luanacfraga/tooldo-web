import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ActionForm } from '@/components/features/actions/action-form/action-form';
import { PageContainer } from '@/components/shared/layout/page-container';
import { PageHeader } from '@/components/shared/layout/page-header';

export default function NewActionPage() {
  return (
    <PageContainer>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/actions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Ações
          </Link>
        </Button>
      </div>

      <PageHeader
        title="Nova Ação"
        description="Crie uma nova ação para sua equipe"
      />

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <ActionForm mode="create" />
      </div>
    </PageContainer>
  );
}
