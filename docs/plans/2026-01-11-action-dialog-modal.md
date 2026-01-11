# Action Dialog Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace action create/edit pages and detail sheet with a centralized Dialog modal

**Architecture:** Create a reusable ActionDialog component that handles both creating and editing actions in a modal. Use Zustand for global state management to control dialog open/close from anywhere. Replace navigation-based flows with in-place modal interactions.

**Tech Stack:** React, TypeScript, Zustand, shadcn/ui Dialog, TanStack Query

---

## Task 1: Create Action Dialog Store

**Files:**
- Create: `src/lib/stores/action-dialog-store.ts`

**Step 1: Create Zustand store for dialog state**

```typescript
import { create } from 'zustand'

interface ActionDialogState {
  // State
  open: boolean
  actionId: string | null // null = create, string = edit
  mode: 'manual' | 'ai'

  // Actions
  openCreate: () => void
  openEdit: (actionId: string) => void
  close: () => void
  setMode: (mode: 'manual' | 'ai') => void
}

export const useActionDialogStore = create<ActionDialogState>((set) => ({
  open: false,
  actionId: null,
  mode: 'manual',

  openCreate: () => set({ open: true, actionId: null, mode: 'manual' }),
  openEdit: (actionId: string) => set({ open: true, actionId, mode: 'manual' }),
  close: () => set({ open: false, actionId: null, mode: 'manual' }),
  setMode: (mode: 'manual' | 'ai') => set({ mode }),
}))
```

**Step 2: Verify store compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/lib/stores/action-dialog-store.ts
git commit -m "feat: add action dialog store for modal state management"
```

---

## Task 2: Create ActionDialog Component

**Files:**
- Create: `src/components/features/actions/action-dialog.tsx`

**Step 1: Create base dialog component structure**

```typescript
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
  const { data: action, isLoading } = useAction(actionId || '', { enabled: !!actionId })
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
          ) : isEditMode ? (
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
```

**Step 2: Verify component compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/features/actions/action-dialog.tsx
git commit -m "feat: create ActionDialog component with create/edit modes"
```

---

## Task 3: Update Actions Page

**Files:**
- Modify: `src/app/(protected)/actions/page.tsx`

**Step 1: Import and add ActionDialog to page**

Replace the entire file content with:

```typescript
'use client'

import { ActionFilters } from '@/components/features/actions/action-list/action-filters'
import { ActionListContainer } from '@/components/features/actions/action-list/action-list-container'
import { ActionListSkeleton } from '@/components/features/actions/action-list/action-list-skeleton'
import { ActionDialog } from '@/components/features/actions/action-dialog'
import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/hooks/use-auth'
import { useActionDialogStore } from '@/lib/stores/action-dialog-store'
import { Plus } from 'lucide-react'
import { Suspense } from 'react'

export default function ActionsPage() {
  const { user } = useAuth()
  const { openCreate } = useActionDialogStore()
  const canCreate = user?.role === 'admin' || user?.role === 'manager'

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Ações"
        description="Gerencie e acompanhe o progresso das suas tarefas"
        action={
          canCreate ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Ação
            </Button>
          ) : null
        }
      />

      <div className="space-y-6">
        <ActionFilters />
        <div className="-mx-4 sm:mx-0">
          <Suspense fallback={<ActionListSkeleton />}>
            <ActionListContainer />
          </Suspense>
        </div>
      </div>

      <ActionDialog />
    </PageContainer>
  )
}
```

**Step 2: Verify page compiles**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Test manually**

1. Navigate to `/actions`
2. Click "Nova Ação" button
3. Verify dialog opens with create form

Expected: Dialog opens, no navigation

**Step 4: Commit**

```bash
git add src/app/(protected)/actions/page.tsx
git commit -m "feat: integrate ActionDialog into actions page"
```

---

## Task 4: Update Kanban Board

**Files:**
- Modify: `src/components/features/actions/action-list/action-kanban-board.tsx`

**Step 1: Find and read current ActionDetailSheet usage**

Read file: `src/components/features/actions/action-list/action-kanban-board.tsx`
Locate: Lines where `ActionDetailSheet` is imported and used

**Step 2: Replace ActionDetailSheet with ActionDialog**

- Remove import of `ActionDetailSheet`
- Remove local state managing `selectedActionId` and `sheetOpen`
- Import and use `useActionDialogStore`
- Replace `ActionDetailSheet` component with calls to `openEdit(actionId)`

Key changes:
```typescript
// Remove these imports
- import { ActionDetailSheet } from '../action-detail-sheet'

// Add this import
+ import { useActionDialogStore } from '@/lib/stores/action-dialog-store'

// In component body, remove state:
- const [selectedActionId, setSelectedActionId] = useState<string | null>(null)
- const [sheetOpen, setSheetOpen] = useState(false)

// Add store hook:
+ const { openEdit } = useActionDialogStore()

// Replace action click handler:
- setSelectedActionId(action.id)
- setSheetOpen(true)
+ openEdit(action.id)

// Remove ActionDetailSheet component at bottom
- <ActionDetailSheet
-   actionId={selectedActionId}
-   open={sheetOpen}
-   onOpenChange={setSheetOpen}
- />
```

**Step 3: Verify changes compile**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Test manually**

1. Navigate to `/actions` with kanban view
2. Click on an action card
3. Verify dialog opens with edit form

Expected: Dialog opens with action details

**Step 5: Commit**

```bash
git add src/components/features/actions/action-list/action-kanban-board.tsx
git commit -m "refactor: replace ActionDetailSheet with ActionDialog in kanban board"
```

---

## Task 5: Update Table View

**Files:**
- Modify: `src/components/features/actions/action-list/action-table.tsx`

**Step 1: Find current ActionDetailSheet usage**

Read file: `src/components/features/actions/action-list/action-table.tsx`
Locate: Lines where `ActionDetailSheet` is imported and used

**Step 2: Replace ActionDetailSheet with ActionDialog**

Apply same pattern as Task 4:
- Remove `ActionDetailSheet` import and local state
- Add `useActionDialogStore` hook
- Replace sheet opening logic with `openEdit(actionId)`
- Remove `ActionDetailSheet` component

**Step 3: Verify changes compile**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Test manually**

1. Navigate to `/actions` with table view
2. Click on an action row
3. Verify dialog opens with edit form

Expected: Dialog opens with action details

**Step 5: Commit**

```bash
git add src/components/features/actions/action-list/action-table.tsx
git commit -m "refactor: replace ActionDetailSheet with ActionDialog in table view"
```

---

## Task 6: Remove Old Files

**Files:**
- Delete: `src/app/(protected)/actions/new/page.tsx`
- Delete: `src/app/(protected)/actions/[actionId]/edit/page.tsx`
- Delete: `src/components/features/actions/action-detail-sheet.tsx`

**Step 1: Check for any remaining imports**

Run:
```bash
grep -r "action-detail-sheet" src/ --include="*.tsx" --include="*.ts"
grep -r "actions/new" src/ --include="*.tsx" --include="*.ts"
grep -r "actions.*edit" src/ --include="*.tsx" --include="*.ts"
```

Expected: No results (or only in deleted files)

**Step 2: Delete old page files**

```bash
rm src/app/\(protected\)/actions/new/page.tsx
rm src/app/\(protected\)/actions/\[actionId\]/edit/page.tsx
rm src/components/features/actions/action-detail-sheet.tsx
```

**Step 3: Verify no broken imports**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Test navigation**

1. Try navigating to `/actions/new` - should 404
2. Try navigating to `/actions/[id]/edit` - should 404

Expected: Both routes no longer exist

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: remove old action pages and detail sheet"
```

---

## Task 7: Update Dashboard Sidebar (if needed)

**Files:**
- Check: `src/components/layout/dashboard-sidebar.tsx`

**Step 1: Search for old routes**

Run: `grep -n "actions/new" src/components/layout/dashboard-sidebar.tsx`

**Step 2: If found, update to use dialog**

Replace any `href="/actions/new"` links with button that calls `openCreate()`

**Step 3: Verify and commit if changed**

```bash
git add src/components/layout/dashboard-sidebar.tsx
git commit -m "refactor: update sidebar to use action dialog"
```

---

## Task 8: Final Testing

**Step 1: Test create flow**

1. Navigate to `/actions`
2. Click "Nova Ação"
3. Fill form in manual mode
4. Save action
5. Verify dialog closes and action appears in list

**Step 2: Test AI create flow**

1. Click "Nova Ação"
2. Switch to "Criar com IA"
3. Enter goal and generate
4. Verify suggestion loads
5. Switch back to manual with suggestion data
6. Save action

**Step 3: Test edit flow**

1. Click on existing action (kanban or table)
2. Modify fields
3. Save changes
4. Verify dialog closes and changes reflected

**Step 4: Test blocked action**

1. Block an action
2. Try to edit it
3. Verify form is read-only with warning

**Step 5: Verify no console errors**

Check browser console for any errors during all flows

Expected: Clean console, no errors

**Step 6: Final commit**

If any fixes were needed:
```bash
git add -A
git commit -m "fix: final adjustments for action dialog"
```

---

## Completion Checklist

- [ ] Action dialog store created and working
- [ ] ActionDialog component renders correctly
- [ ] Create action opens dialog (no navigation)
- [ ] Edit action opens dialog from kanban
- [ ] Edit action opens dialog from table
- [ ] AI mode works in create dialog
- [ ] Manual mode works in create dialog
- [ ] Old routes deleted and return 404
- [ ] No console errors
- [ ] All TypeScript checks pass
- [ ] ActionDetailSheet completely removed

---

## Rollback Plan

If issues arise:

1. Revert commits: `git revert HEAD~7..HEAD`
2. Restore deleted files from git history
3. Investigate specific issue before re-attempting

---

## Notes

- The `useAction` hook in ActionDialog uses `enabled: !!actionId` to only fetch when editing
- The `key={action.id}` on ActionForm ensures proper remounting when switching between actions
- Dialog automatically handles ESC key and backdrop click to close
- Form buttons (Cancel/Save) are preserved from existing ActionForm component
