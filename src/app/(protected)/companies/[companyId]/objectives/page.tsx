'use client'

import { PageContainer } from '@/components/shared/layout/page-container'
import { PageHeader } from '@/components/shared/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Objective } from '@/lib/api/endpoints/objectives'
import { USER_ROLES } from '@/lib/constants'
import { useUserContext } from '@/lib/contexts/user-context'
import {
  useCreateObjective,
  useDeleteObjective,
  useObjectivesByTeam,
  useUpdateObjective,
} from '@/lib/services/queries/use-objectives'
import { useTeamsByCompany } from '@/lib/services/queries/use-teams'
import { cn } from '@/lib/utils'
import { Plus, Target, Trash2, Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export default function ObjectivesPage() {
  const params = useParams()
  const companyId = params.companyId as string

  const { user, currentRole } = useUserContext()
  const { data: teamsData } = useTeamsByCompany(companyId)
  const teams = useMemo(() => teamsData?.data ?? [], [teamsData])
  const [teamId, setTeamId] = useState<string>('')

  // Define automaticamente a equipe em foco, sem seleção manual:
  // - Se for manager e tiver exatamente uma equipe onde ele é gestor, usa essa.
  // - Caso contrário, se houver exatamente uma equipe na empresa, usa essa.
  useEffect(() => {
    if (teamId) return
    if (!teams.length) return

    if (currentRole === USER_ROLES.MANAGER && user) {
      const managerTeams = teams.filter((t) => t.managerId === user.id)
      if (managerTeams.length === 1) {
        setTeamId(managerTeams[0].id)
        return
      }
    }

    if (teams.length === 1) {
      setTeamId(teams[0].id)
    }
  }, [teamId, teams, currentRole, user])

  const { data: objectives = [] } = useObjectivesByTeam(companyId, teamId)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Objective | null>(null)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')

  const resetForm = () => {
    setTitle('')
    setDueDate('')
    setEditing(null)
  }

  const onCreate = () => {
    if (!teamId) {
      toast.error('Selecione uma equipe para cadastrar objetivos')
      return
    }
    resetForm()
    setOpen(true)
  }

  const onEdit = (o: Objective) => {
    setEditing(o)
    setTitle(o.title)
    setDueDate(o.dueDate ?? '')
    setOpen(true)
  }

  const { mutateAsync: createObjective } = useCreateObjective()
  const { mutateAsync: updateObjective } = useUpdateObjective()
  const { mutateAsync: deleteObjective } = useDeleteObjective()

  const onSave = async () => {
    const t = title.trim()
    if (!t) {
      toast.error('Informe um título para o objetivo')
      return
    }
    if (!teamId) {
      toast.error('Selecione uma equipe')
      return
    }

    try {
      if (editing) {
        await updateObjective({
          id: editing.id,
          data: { title: t, dueDate: dueDate || undefined },
        })
        toast.success('Objetivo atualizado')
      } else {
        await createObjective({
          companyId,
          teamId,
          title: t,
          dueDate: dueDate || undefined,
        })
        toast.success('Objetivo criado')
      }
      setOpen(false)
      resetForm()
    } catch (e) {
      toast.error('Erro ao salvar objetivo')
    }
  }

  const onDelete = async (o: { id: string }) => {
    if (!confirm('Excluir este objetivo?')) return
    await deleteObjective(o.id)
    toast.success('Objetivo excluído')
  }

  return (
    <PageContainer maxWidth="7xl">
      <PageHeader
        title="Objetivos"
        description="Cadastre objetivos e prazos para vincular às ações do time."
        action={
          <Button onClick={onCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Novo objetivo</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:items-start">
        <Card className="border-border/40">
          <CardHeader>
            <CardTitle className="text-base">Lista</CardTitle>
            <CardDescription>
              Objetivos disponíveis para vincular às ações da equipe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!teamId ? (
              <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <Users className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold">Selecione uma equipe</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Depois de selecionar, você verá (e poderá criar) os objetivos dessa equipe.
                </div>
              </div>
            ) : objectives.length ? (
              <div className="space-y-2">
                {objectives.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => onEdit(o)}
                    className={cn(
                      'w-full rounded-xl border border-border/40 bg-card/60 p-4 text-left',
                      'transition-colors hover:bg-accent/30'
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <div className="truncate text-sm font-semibold text-foreground">
                            {o.title}
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Prazo:{' '}
                          <span className="font-medium text-foreground/80">{o.dueDate ?? '—'}</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          onDelete(o)
                        }}
                        aria-label="Excluir objetivo"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 p-8 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Target className="h-5 w-5" />
                </div>
                <div className="mt-3 text-sm font-semibold">Nenhum objetivo cadastrado</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Crie um objetivo para selecionar durante a criação/edição de ações.
                </div>
                <Button onClick={onCreate} variant="outline" className="mt-4">
                  Criar primeiro objetivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          if (!v) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar objetivo' : 'Novo objetivo'}</DialogTitle>
            <DialogDescription>
              Defina um título claro e, se quiser, um prazo para orientar o time.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Título</div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: Reduzir churn"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Prazo (opcional)</div>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={onSave}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
