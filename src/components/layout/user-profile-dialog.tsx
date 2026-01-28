'use client'

import { AvatarColorPicker } from '@/components/shared/avatar-color-picker'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '@/components/ui/user-avatar'
import { usersApi } from '@/lib/api/endpoints/users'
import { formatCNPJ, formatCPF } from '@/lib/formatters'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { useAuthStore } from '@/lib/stores/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Mail, Phone, Shield, User } from 'lucide-react'
import { RoleBadge } from '@/components/ui/role-badge'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const profileFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileFormSchema>

const DEFAULT_COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
] as const

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user, role } = usePermissions()
  const authUser = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  const { data: avatarColorsData, isLoading: isLoadingColors } = useQuery({
    queryKey: ['avatar-colors'],
    queryFn: async () => {
      try {
        const response = await usersApi.getAvatarColors()

        let colors: string[] = []

        if (response) {
          if (Array.isArray(response)) {
            colors = response
          } else if (typeof response === 'object' && 'colors' in response) {
            colors = Array.isArray(response.colors) ? response.colors : []
          }
        }

        const finalColors = colors.length > 0 ? colors : [...DEFAULT_COLORS]

        return { colors: finalColors }
      } catch (error) {
        return { colors: [...DEFAULT_COLORS] }
      }
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  const updateAvatarColor = useMutation({
    mutationFn: (color: string) => usersApi.updateAvatarColor({ avatarColor: color }),
    onSuccess: (_updatedUser, color) => {
      if (authUser) {
        setUser({
          ...authUser,
          avatarColor: color,
        })
      }
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['executors'] })
      toast.success('Cor do avatar atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar cor do avatar')
    },
  })

  const availableColors = React.useMemo(() => {
    if (
      avatarColorsData?.colors &&
      Array.isArray(avatarColorsData.colors) &&
      avatarColorsData.colors.length > 0
    ) {
      return avatarColorsData.colors
    }
    return [...DEFAULT_COLORS]
  }, [avatarColorsData])

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  })

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user, form])

  if (!user) return null

  const isCnpj = user.documentType === 'CNPJ'
  const rawDocument = user.document?.replace?.(/\D/g, '') ?? ''
  const formattedDocument = rawDocument
    ? isCnpj
      ? formatCNPJ(rawDocument)
      : formatCPF(rawDocument)
    : null

  const handleColorChange = (color: string) => {
    updateAvatarColor.mutate(color)
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const fullName = data.name.trim()
      const [firstName, ...rest] = fullName.split(/\s+/)
      const lastName = rest.join(' ') || firstName

      const updated = await usersApi.updateProfile({
        firstName,
        lastName,
        phone: data.phone || undefined,
      })

      if (authUser) {
        setUser({
          ...authUser,
          name: `${updated.firstName} ${updated.lastName}`.trim(),
          phone: data.phone || authUser.phone || null,
        })
      }

      toast.success('Perfil atualizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar perfil')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e personalize seu avatar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-6">
            
            <div className="flex items-start gap-4">
              <UserAvatar
                id={user.id}
                name={user.name}
                initials={authUser?.initials}
                avatarColor={authUser?.avatarColor}
                size="lg"
                className="flex-shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold">{user.name}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  ID: <span className="font-mono">{user.id}</span>
                </p>
                {role && (
                  <div className="mt-1 flex items-center gap-2">
                    <Shield className="h-3 w-3 text-primary" />
                    <RoleBadge role={role} />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-sm font-medium">Cor do Avatar</p>
                <p className="mb-3 text-xs text-muted-foreground">
                  Escolha uma cor para personalizar seu avatar
                </p>
                {isLoadingColors && availableColors.length === 0 ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <AvatarColorPicker
                    currentColor={authUser?.avatarColor ?? null}
                    availableColors={availableColors}
                    onColorChange={handleColorChange}
                    isLoading={updateAvatarColor.isPending}
                  />
                )}
              </div>
            </div>

            <Separator />

            
            <div className="space-y-4">
              <p className="text-sm font-medium">Informações Pessoais</p>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 text-xs">
                      <User className="h-3 w-3" />
                      Nome
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="text" className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 text-xs">
                      <Mail className="h-3 w-3" />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className="h-9 text-sm" disabled readOnly />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" />
                      Telefone
                    </FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" className="h-9 text-sm" />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              
              {formattedDocument && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {isCnpj ? 'CNPJ' : 'CPF'}
                  </p>
                  <p className="rounded-md bg-muted/50 p-2 font-mono text-sm text-foreground">
                    {formattedDocument}
                  </p>
                </div>
              )}
            </div>

            <Separator />

            
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button type="submit" size="sm">
                Salvar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
