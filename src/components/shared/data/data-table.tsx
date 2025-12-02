import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DataTableProps {
  headers: {
    label: string
    align?: 'left' | 'center' | 'right'
    className?: string
  }[]
  children: ReactNode
  emptyMessage?: string
  isLoading?: boolean
  className?: string
}

/**
 * Componente de tabela responsiva padronizada
 * Com scroll horizontal em mobile e layout otimizado
 */
export function DataTable({
  headers,
  children,
  emptyMessage,
  isLoading,
  className,
}: DataTableProps) {
  const hasContent = !isLoading && !emptyMessage && children
  const showEmpty = !isLoading && emptyMessage && !children

  return (
    <Card className={className}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={cn(
                    'px-4 py-3 text-left text-sm font-semibold sm:px-6 sm:py-4',
                    header.align === 'center' && 'text-center',
                    header.align === 'right' && 'text-right',
                    header.className
                  )}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-6">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Carregando...</span>
                  </div>
                </td>
              </tr>
            )}
            {showEmpty && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-6">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {hasContent && children}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

interface DataTableRowProps {
  children: ReactNode
  className?: string
}

export function DataTableRow({ children, className }: DataTableRowProps) {
  return (
    <tr className={cn('border-b hover:bg-muted/50 transition-colors', className)}>
      {children}
    </tr>
  )
}

interface DataTableCellProps {
  children: ReactNode
  align?: 'left' | 'center' | 'right'
  className?: string
}

export function DataTableCell({ children, align = 'left', className }: DataTableCellProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-sm sm:px-6 sm:py-4',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  )
}

