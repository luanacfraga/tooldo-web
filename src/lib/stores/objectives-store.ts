import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Objective = {
  id: string
  companyId: string
  teamId: string
  title: string
  dueDate?: string // YYYY-MM-DD
  createdAt: string // ISO
  updatedAt: string // ISO
}

type ObjectivesState = {
  objectives: Objective[]
  listByTeam: (companyId: string, teamId: string) => Objective[]
  create: (input: { companyId: string; teamId: string; title: string; dueDate?: string }) => Objective
  update: (id: string, data: Partial<Pick<Objective, 'title' | 'dueDate'>>) => void
  remove: (id: string) => void
}

function nowIso(): string {
  return new Date().toISOString()
}

function randomId(): string {
  // Browser-friendly unique-ish id without extra deps
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const useObjectivesStore = create<ObjectivesState>()(
  persist(
    (set, get) => ({
      objectives: [],
      listByTeam: (companyId, teamId) =>
        get()
          .objectives.filter((o) => o.companyId === companyId && o.teamId === teamId)
          .sort((a, b) => (a.dueDate ?? '9999-12-31').localeCompare(b.dueDate ?? '9999-12-31')),
      create: ({ companyId, teamId, title, dueDate }) => {
        const objective: Objective = {
          id: randomId(),
          companyId,
          teamId,
          title: title.trim(),
          dueDate: dueDate?.trim() || undefined,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        }
        set((state) => ({ objectives: [objective, ...state.objectives] }))
        return objective
      },
      update: (id, data) => {
        set((state) => ({
          objectives: state.objectives.map((o) =>
            o.id === id
              ? {
                  ...o,
                  ...(data.title !== undefined ? { title: data.title.trim() } : {}),
                  ...(data.dueDate !== undefined
                    ? { dueDate: data.dueDate?.trim() || undefined }
                    : {}),
                  updatedAt: nowIso(),
                }
              : o
          ),
        }))
      },
      remove: (id) => {
        set((state) => ({ objectives: state.objectives.filter((o) => o.id !== id) }))
      },
    }),
    {
      name: 'objectives-storage',
      partialize: (state) => ({ objectives: state.objectives }),
    }
  )
)


