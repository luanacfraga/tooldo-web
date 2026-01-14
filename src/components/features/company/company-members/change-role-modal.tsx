'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RoleBadge } from '@/components/ui/role-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useChangeEmployeeRole } from '@/lib/services/queries/use-employees'
import type { Employee } from '@/lib/types/api'
import { getApiErrorMessage } from '@/lib/utils/error-handling'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ChangeRoleModalProps {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const ROLES = [
  { value: 'manager', label: 'Gestor' },
  { value: 'executor', label: 'Executor' },
  { value: 'consultant', label: 'Consultor' },
] as const

export function ChangeRoleModal({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState<'manager' | 'executor' | 'consultant'>(
    employee.role as 'manager' | 'executor' | 'consultant'
  )
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: changeRole, isPending } = useChangeEmployeeRole()

  const handleConfirm = async () => {
    try {
      setError(null)
      await changeRole({
        id: employee.id,
        newRole: selectedRole,
      })

      const roleLabel = ROLES.find((r) => r.value === selectedRole)?.label || selectedRole
      toast.success(`Cargo alterado com sucesso para ${roleLabel}`)

      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      const message = getApiErrorMessage(err, 'Erro ao mudar cargo')
      setError(message)
    }
  }

  const fullName = employee.user
    ? `${employee.user.firstName} ${employee.user.lastName}`
    : 'Funcionário'

  const isRoleChanged = selectedRole !== employee.role

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mudar Cargo</DialogTitle>
          <DialogDescription>
            Mudando cargo de <span className="font-medium text-foreground">{fullName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Cargo Atual</Label>
            <div>
              <RoleBadge role={employee.role} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-role">Novo Cargo</Label>
            <Select
              value={selectedRole}
              onValueChange={(value: 'manager' | 'executor' | 'consultant') =>
                setSelectedRole(value)
              }
              disabled={isPending}
            >
              <SelectTrigger id="new-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isRoleChanged && (
              <p className="text-xs text-muted-foreground">Selecione um cargo diferente</p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isRoleChanged || isPending}>
            {isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
