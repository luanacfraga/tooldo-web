'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useActionDialogStore } from '@/lib/stores/action-dialog-store'
import { useAction } from '@/lib/hooks/use-actions'
import { LoadingSpinner } from '@/components/shared/feedback/loading-spinner'
import { cn } from '@/lib/utils'
import { PenLine, Sparkles } from 'lucide-react'
import { ActionForm } from './action-form/action-form'
import { AIActionForm } from './action-form/ai-action-form'
import { ActionFormData } from '@/lib/validators/action'
import { useState } from 'react'

export function ActionDialog() {
  const { open, actionId, mode, close, setMode } = useActionDialogStore()
  const { data: action, isLoading } = useAction(actionId || '')
  const [suggestedData, setSuggestedData] = useState<Partial<ActionFormData> | undefined>()

  const isEditMode = !!actionId
  const readOnly = action?.isBlocked || false

  const handleSuggestion = (data: Partial<ActionFormData>) => {
    setSuggestedData(data)
    setMode('manual')
  }

  const handleSuccess = () => {
    close()
    setSuggestedData(undefined)
  }

  const handleCancel = () => {
    close()
    setSuggestedData(undefined)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {isEditMode ? 'Editar Ação' : 'Nova Ação'}
          </DialogTitle>

          {!isEditMode && (
            <div className="flex w-fit rounded-lg bg-muted p-1 mt-4">
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
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isLoading && isEditMode ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : isEditMode && !action ? (
            <div className="text-center py-12 text-destructive">
              Falha ao carregar ação
            </div>
          ) : isEditMode && action ? (
            <ActionForm
              key={action.id}
              mode="edit"
              action={action}
              readOnly={readOnly}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : mode === 'manual' ? (
            <ActionForm
              mode="create"
              initialData={suggestedData}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          ) : (
            <AIActionForm
              onSuggestion={handleSuggestion}
              onCancel={() => setMode('manual')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
