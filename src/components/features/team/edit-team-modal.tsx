'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Employee } from '@/lib/types/api'
import { useUpdateTeam } from '@/lib/services/queries/use-teams'
import type { Team } from '@/lib/api/endpoints/teams'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { teamSchema, type TeamFormData } from '@/lib/validators/team'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

interface EditTeamModalProps {
  team: Team
  companyId: string
  managers: Employee[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditTeamModal({
  team,
  companyId,
  managers,
  open,
  onOpenChange,
  onSuccess,
}: EditTeamModalProps) {
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: updateTeam, isPending } = useUpdateTeam()

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team.name || '',
      companyId,
      managerId: team.managerId || '',
      iaContext: team.iaContext || team.description || '',
    },
  })

  useEffect(() => {
    if (open && team) {
      form.reset({
        name: team.name || '',
        companyId,
        managerId: team.managerId || '',
        iaContext: team.iaContext || team.description || '',
      })
      setError(null)
    }
  }, [open, team, companyId, form])

  const handleSubmit = async (data: TeamFormData) => {
    try {
      setError(null)
      const unifiedContext = data.iaContext?.trim() || undefined

      await updateTeam({
        id: team.id,
        data: {
          name: data.name,
          managerId: data.managerId,
          description: unifiedContext,
          iaContext: unifiedContext,
        },
      })

      toast.success('Equipe atualizada com sucesso')
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao atualizar equipe')
      setError(message)
      toast.error(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-[600px]">
        <DialogHeader className="border-b px-6 pb-4 pt-6">
          <DialogTitle>Editar Equipe</DialogTitle>
          <DialogDescription>
            Atualize as informações de{' '}
            <span className="font-medium text-foreground">{team.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-4 animate-fade-in rounded-lg border border-danger-light bg-danger-lightest p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-danger-base" />
                <div className="flex-1">
                  <h3 className="font-semibold text-danger-dark">Erro ao atualizar</h3>
                  <p className="mt-1 text-sm text-danger-base">{error}</p>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form id="edit-team-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <fieldset disabled={isPending} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Nome da Equipe</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Equipe de Desenvolvimento" {...field} className="h-9 text-sm" />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="managerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Gestor da Equipe</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || undefined}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Selecione um gestor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {managers.length === 0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              Nenhum gestor disponível
                            </div>
                          ) : (
                            managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.userId} className="text-sm">
                                {manager.user
                                  ? `${manager.user.firstName} ${manager.user.lastName}`
                                  : manager.userId}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        Cada gestor só pode gerenciar uma equipe por vez na empresa.
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="iaContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Descrição da equipe e contexto para IA</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o propósito da equipe, responsabilidades, perfil dos membros, tipos de atividades, etc."
                          className="min-h-[100px] text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Este texto será usado como descrição da equipe e também poderá servir de
                        contexto para a IA ao sugerir ou criar ações para esta equipe (máximo 1000
                        caracteres, opcional).
                      </FormDescription>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </fieldset>
            </form>
          </Form>
        </div>

        <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            size="sm"
          >
            Cancelar
          </Button>
          <Button type="submit" form="edit-team-form" disabled={isPending} size="sm">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

