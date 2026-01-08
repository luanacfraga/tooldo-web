'use client'

import { Button } from '@/components/ui/button'
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
import { teamSchema, type TeamFormData } from '@/lib/validators/team'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, Sparkles, UserCog, Users } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface TeamFormProps {
  companyId: string
  managers: Employee[]
  currentUserId?: string
  currentUserRole?: string
  onSubmit: (data: TeamFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  defaultValues?: Partial<TeamFormData>
  isEditing?: boolean
}

export function TeamForm({
  companyId,
  managers,
  currentUserId,
  currentUserRole,
  onSubmit,
  onCancel,
  isLoading = false,
  defaultValues,
  isEditing = false,
}: TeamFormProps) {
  const isManager = currentUserRole === 'manager'
  const defaultManagerId = !isEditing && isManager && currentUserId ? currentUserId : ''
  const currentManagerName = managers.find((m) => m.userId === currentUserId)?.user
    ? `${managers.find((m) => m.userId === currentUserId)?.user?.firstName} ${managers.find((m) => m.userId === currentUserId)?.user?.lastName}`
    : 'Você'

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: '',
      companyId,
      managerId: defaultManagerId,
      description: '',
      iaContext: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (!isEditing && isManager && currentUserId && !form.getValues('managerId')) {
      form.setValue('managerId', currentUserId)
    }
  }, [isEditing, isManager, currentUserId, form])

  const handleSubmit = async (data: TeamFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="border-b p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold">Informações da Equipe</h3>
                <p className="text-sm text-muted-foreground">Dados básicos da equipe</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <fieldset disabled={isLoading || form.formState.isSubmitting} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">
                  Nome da Equipe <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Ex: Equipe de Desenvolvimento"
                      {...field}
                      autoFocus
                      className="h-9 pl-10 text-sm"
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                  Nome que identifica a equipe na empresa
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="managerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">
                  Gestor da Equipe <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  {!isEditing && isManager ? (
                    <div className="relative">
                      <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input value={currentManagerName} disabled readOnly className="h-9 pl-10 text-sm" />
                    </div>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      disabled={isLoading || form.formState.isSubmitting}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Selecione um gestor" />
                      </SelectTrigger>
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
                  )}
                </FormControl>
                <FormDescription className="text-xs">
                  {isEditing
                    ? 'Você pode substituir o gestor da equipe. Cada gestor só pode gerenciar uma equipe por vez na empresa.'
                    : isManager
                      ? 'Você será o gestor desta equipe'
                      : 'Selecione o gestor responsável pela equipe'}
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
                  <div className="relative">
                    <Sparkles className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                    placeholder="Descreva o propósito da equipe, responsabilidades, perfil dos membros, tipos de atividades, etc."
                      className="min-h-[100px] resize-none pl-10 text-sm"
                      {...field}
                      disabled={isLoading || form.formState.isSubmitting}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-xs">
                Este texto será usado como descrição da equipe e também poderá servir de contexto para a IA ao sugerir ou criar ações para esta equipe (máximo 1000 caracteres, opcional).
                </FormDescription>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
            </fieldset>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t p-6 sm:flex-row sm:justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading || form.formState.isSubmitting}
                size="sm"
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading || form.formState.isSubmitting}
              size="sm"
              className={cn('w-full sm:w-auto', onCancel ? 'sm:min-w-[200px]' : 'sm:min-w-[220px]')}
            >
              {(isLoading || form.formState.isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {!isLoading && !form.formState.isSubmitting && <Save className="mr-2 h-4 w-4" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Equipe'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
