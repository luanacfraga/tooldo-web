import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ActionForm } from '@/components/features/actions/action-form/action-form';

export default function NewActionPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" asChild className="mb-2">
            <Link href="/actions">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Ações
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Nova Ação</h1>
          <p className="text-muted-foreground">Crie uma nova ação para sua equipe</p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border bg-card p-6">
        <ActionForm mode="create" />
      </div>
    </div>
  );
}
