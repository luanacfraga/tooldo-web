'use client'

import { ActionForm } from '@/components/features/actions/action-form/action-form'
import { AIActionForm } from '@/components/features/actions/action-form/ai-action-form'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ActionFormData } from '@/lib/validators/action'
import { ArrowLeft, PenLine, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function NewActionPage() {
  const [mode, setMode] = useState<'manual' | 'ai'>('manual')
  const [suggestedData, setSuggestedData] = useState<Partial<ActionFormData> | undefined>(undefined)

  const handleSuggestion = (data: Partial<ActionFormData>) => {
    setSuggestedData(data)
    setMode('manual')
  }

  return (
    <PageContainer>
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/actions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Ações
          </Link>
        </Button>
      </div>

      <PageHeader title="Nova Ação" description="Crie uma nova ação para sua equipe" />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <div className="flex w-fit rounded-lg bg-muted p-1">
            <button
              onClick={() => setMode('manual')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                mode === 'manual'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <PenLine className="h-4 w-4" />
              Manual
            </button>
            <button
              onClick={() => setMode('ai')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                mode === 'ai'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="h-4 w-4" />
              Criar com IA
            </button>
          </div>
        </div>

        <div className="p-6">
          {mode === 'manual' ? (
            <ActionForm mode="create" initialData={suggestedData} />
          ) : (
            <AIActionForm onSuggestion={handleSuggestion} onCancel={() => setMode('manual')} />
          )}
        </div>
      </div>
    </PageContainer>
  )
}
