import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Company } from '@/lib/api/endpoints/companies'
import { cn } from '@/lib/utils'
import { Building2, Settings } from 'lucide-react'

interface CompanySelectorViewProps {
  companies: Company[]
  selectedCompany: Company | null
  onCompanyChange: (companyId: string) => void
  onManage: () => void
  showLabel: boolean
  variant: 'default' | 'compact'
  className?: string
}

export function CompanySelectorView({
  companies,
  selectedCompany,
  onCompanyChange,
  onManage,
  showLabel,
  variant,
  className,
}: CompanySelectorViewProps) {
  const isCompact = variant === 'compact'

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && variant === 'default' && (
        <label className="block truncate text-xs font-medium text-muted-foreground">
          Empresa Atual
        </label>
      )}
      <div className="flex min-w-0 gap-2">
        <Select value={selectedCompany?.id || ''} onValueChange={onCompanyChange}>
          <SelectTrigger
            className={cn(
              'h-11 min-w-0 flex-1 border-border/50',
              isCompact &&
                'h-9 min-w-[160px] max-w-[220px] border-border/50 bg-muted/30 text-sm hover:bg-muted/50'
            )}
          >
            <SelectValue placeholder={isCompact ? 'Empresa' : 'Selecione uma empresa'} />
          </SelectTrigger>
          <SelectContent
            className="z-[100] min-w-[220px] max-w-[90vw]"
            align={isCompact ? 'end' : 'start'}
            sideOffset={4}
          >
            {companies.length > 0 && (
              <>
                {companies.map((company) => {
                  const isSelected = selectedCompany?.id === company.id
                  return (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex min-w-0 items-center gap-2">
                        <Building2
                          className={cn(
                            'h-4 w-4 flex-shrink-0',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span className={cn('truncate', isSelected && 'font-medium')}>
                          {company.name}
                        </span>
                        {isSelected && (
                          <span className="ml-auto h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                    </SelectItem>
                  )
                })}
                <div className="my-1 border-t border-border" />
              </>
            )}
            <SelectItem value="new">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>Nova Empresa</span>
              </div>
            </SelectItem>
            <SelectItem value="manage">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span>Gerenciar Empresas</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {variant === 'default' && (
          <Button
            variant="outline"
            size="icon"
            onClick={onManage}
            title="Gerenciar empresas"
            className="flex-shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
