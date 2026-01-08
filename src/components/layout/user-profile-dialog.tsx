'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { usePermissions } from '@/lib/hooks/use-permissions'
import { formatCPF, formatCNPJ, formatPhone, formatRole } from '@/lib/formatters'
import { Shield, Mail, Phone, User } from 'lucide-react'

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user, role } = usePermissions()

  if (!user) return null

  const isCnpj = user.documentType === 'CNPJ'
  const rawDocument = user.document?.replace?.(/\D/g, '') ?? ''
  const formattedDocument = rawDocument
    ? isCnpj
      ? formatCNPJ(rawDocument)
      : formatCPF(rawDocument)
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Perfil do usuário</DialogTitle>
          <DialogDescription>Informações da sua conta e permissões atuais.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Nome e papel */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">{user.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                ID: <span className="font-mono">{user.id}</span>
              </p>
            </div>
            {role && (
              <Badge variant="outline" className="flex items-center gap-1 text-xs">
                <Shield className="h-3 w-3 text-primary" />
                {formatRole(role)}
              </Badge>
            )}
          </div>

          {/* Email e telefone */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </p>
              <p className="text-sm break-all text-foreground">{user.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Telefone
              </p>
              <p className="text-sm text-foreground">
                {user.phone ? formatPhone(user.phone) : '-'}
              </p>
            </div>
          </div>

          {/* Documento */}
          {formattedDocument && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {isCnpj ? 'CNPJ' : 'CPF'}
              </p>
              <p className="font-mono text-xs text-foreground">{formattedDocument}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


