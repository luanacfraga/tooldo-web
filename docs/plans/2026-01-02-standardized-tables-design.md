# Standardized Tables and Filters Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Criar sistema padronizado de tabelas responsivas e filtros reutilizáveis para toda a aplicação

**Architecture:** Componentes híbridos (cards mobile, table desktop) com filtros configuráveis e paginação server/client-side

**Tech Stack:** TanStack React Table v8, Tailwind CSS, Radix UI, Zustand (para stores)

---

## Design Decisions

### 1. Estilo Visual
- **Híbrido mobile/desktop:**
  - Mobile (< 768px): Cards com estilo Kanban
  - Desktop (≥ 768px): Tabela tradicional TanStack
- **Baseado no Kanban styling:**
  - `bg-card/95 backdrop-blur-sm`
  - Hover effects: shadow-md, translateY
  - Custom scrollbar
  - Transições suaves

### 2. Escopo
Padronizar todas as principais tabelas:
- Companies (lista de empresas)
- Teams (converter grid para table responsiva)
- Members/Employees (padronizar estilo existente)
- Plans (adicionar paginação)
- Actions Table (padronizar)

### 3. Filtros
- Componente `<StandardFilters>` reutilizável
- Configurável via props
- Tipos suportados: search, select, toggle, date-range
- UI baseada em ActionFilters (popovers + badges)

### 4. Paginação
- Padrão: [10, 20, 50, 100]
- Default: 20 itens
- Suporte client-side e server-side
- Componente Pagination já existe

### 5. Funcionalidades
**Incluído:**
- Paginação
- Filtros configuráveis
- Ordenação por colunas
- Search global
- Responsividade (cards ↔ table)
- Loading states
- Empty states

**Não incluído (YAGNI):**
- Seleção múltipla / bulk actions
- Export CSV/Excel
- Print view

---

## Component Architecture

### Componentes Principais

```
src/components/shared/
├── table/
│   ├── responsive-data-table.tsx       # Componente principal híbrido
│   ├── table-view.tsx                  # View desktop (TanStack)
│   ├── card-view.tsx                   # View mobile (cards)
│   ├── use-table-state.ts              # Hook de estado
│   ├── use-responsive-table.ts         # Hook de breakpoint
│   └── types.ts                        # TypeScript types
├── filters/
│   ├── standard-filters.tsx            # Filtros genéricos
│   ├── filter-popover.tsx              # Popover reutilizável
│   └── filter-types.ts                 # Config types
└── data/
    └── pagination.tsx                  # Já existe (melhorar estilo)
```

### 1. ResponsiveDataTable

**Props:**
```typescript
interface ResponsiveDataTableProps<T> {
  // Dados
  data: T[]
  columns: ColumnDef<T>[] // TanStack columns

  // Customização
  CardComponent: React.ComponentType<{ item: T }> // Card para mobile
  emptyMessage?: string

  // Estado
  isLoading?: boolean

  // Paginação
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }

  // Filtros
  filters?: React.ReactNode // Slot para StandardFilters

  // Server-side ou client-side
  manualPagination?: boolean
  manualSorting?: boolean
}
```

**Comportamento:**
- Detecta breakpoint com `useResponsiveTable()`
- Mobile: renderiza `<CardView>` com CardComponent fornecido
- Desktop: renderiza `<TableView>` com TanStack Table
- Integra paginação automaticamente
- Skeleton loading em ambas as views

### 2. StandardFilters

**Props:**
```typescript
interface FilterConfig {
  type: 'search' | 'select' | 'toggle' | 'date-range'
  key: string
  label: string
  icon?: LucideIcon
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

interface StandardFiltersProps {
  config: FilterConfig[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onClear?: () => void
}
```

**Layout:**
```
Desktop: [Search............] [Status▼] [Priority▼] [Assignment▼] [×]
Mobile:  [Search............]
         [Status▼] [Priority▼]
         [Assignment▼] [×]
```

**Styling (baseado em ActionFilters):**
- Active filter: solid border + badge com count
- Inactive filter: dashed border
- Clear button: aparece quando há filtros ativos
- Popovers: Radix UI Popover

### 3. useTableState Hook

**Interface:**
```typescript
function useTableState<T>(config?: {
  initialPageSize?: number
  initialSortBy?: string
  persistKey?: string // localStorage key
}) {
  return {
    pagination: { pageIndex: number, pageSize: number }
    setPagination: Dispatch<SetStateAction<PaginationState>>
    sorting: SortingState
    setSorting: Dispatch<SetStateAction<SortingState>>
    filters: Record<string, any>
    setFilters: Dispatch<SetStateAction<Record<string, any>>>
  }
}
```

**Funcionalidades:**
- Gerencia estado de paginação, ordenação e filtros
- Persiste no localStorage se `persistKey` fornecido
- Restaura estado ao montar componente

---

## Styling Guidelines

### Mobile Cards (< 768px)

```tsx
<div className="space-y-3">
  <Card className="
    group/card relative overflow-hidden
    bg-card/95 backdrop-blur-sm
    border border-border/60
    shadow-sm
    hover:shadow-md hover:border-border/80 hover:bg-card
    transition-all duration-200 ease-in-out
    hover:-translate-y-0.5
  ">
    {/* Card content */}
  </Card>
</div>
```

### Desktop Table (≥ 768px)

```tsx
<div className="rounded-lg border border-border/60 overflow-hidden">
  <Table>
    <TableHeader className="bg-muted/50 backdrop-blur-sm sticky top-0 z-10">
      {/* Headers com sort */}
    </TableHeader>
    <TableBody>
      <TableRow className="
        hover:bg-muted/50
        border-b border-border/40
        transition-colors
      ">
        {/* Cells */}
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### Custom Scrollbar (ambas as views)

```css
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground) / 0.2) transparent;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: hsl(var(--muted-foreground) / 0.15);
  border-radius: 10px;
}
```

---

## Implementation Examples

### Example 1: Companies Table

```tsx
// src/app/(protected)/companies/page.tsx
import { ResponsiveDataTable } from '@/components/shared/table/responsive-data-table'
import { StandardFilters } from '@/components/shared/filters/standard-filters'
import { CompanyCard } from './company-card' // Mobile card

const companyColumns: ColumnDef<Company>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'cnpj', header: 'CNPJ' },
  { accessorKey: 'status', header: 'Status' },
  // ...
]

const filterConfig: FilterConfig[] = [
  { type: 'search', key: 'query', placeholder: 'Buscar empresas...' },
  {
    type: 'select',
    key: 'status',
    label: 'Status',
    icon: CheckCircle2,
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'active', label: 'Ativas' },
      { value: 'inactive', label: 'Inativas' }
    ]
  }
]

export default function CompaniesPage() {
  const [filters, setFilters] = useState({})
  const { data, isLoading } = useCompanies(filters)

  return (
    <div className="space-y-4">
      <StandardFilters
        config={filterConfig}
        values={filters}
        onChange={setFilters}
      />

      <ResponsiveDataTable
        data={data?.companies || []}
        columns={companyColumns}
        CardComponent={CompanyCard}
        isLoading={isLoading}
        pagination={{
          page: data?.page || 1,
          pageSize: data?.pageSize || 20,
          total: data?.total || 0,
          onPageChange: (page) => setFilters(f => ({ ...f, page })),
          onPageSizeChange: (size) => setFilters(f => ({ ...f, pageSize: size }))
        }}
        manualPagination // Server-side
      />
    </div>
  )
}
```

### Example 2: Plans Table (Client-side)

```tsx
// src/app/(protected)/plans/page.tsx
import { ResponsiveDataTable } from '@/components/shared/table/responsive-data-table'
import { PlanCard } from './plan-card'

const planColumns: ColumnDef<Plan>[] = [
  { accessorKey: 'name', header: 'Nome' },
  { accessorKey: 'maxCompanies', header: 'Max Empresas' },
  // ...
]

export default function PlansPage() {
  const { data: plans, isLoading } = usePlans()

  return (
    <ResponsiveDataTable
      data={plans || []}
      columns={planColumns}
      CardComponent={PlanCard}
      isLoading={isLoading}
      // Sem manualPagination = client-side
    />
  )
}
```

---

## Migration Strategy

### Phase 1: Create Core Components
1. `responsive-data-table.tsx` (componente principal)
2. `table-view.tsx` (desktop view)
3. `card-view.tsx` (mobile view)
4. `use-table-state.ts` (hook de estado)
5. `use-responsive-table.ts` (hook de breakpoint)

### Phase 2: Create Filter System
1. `standard-filters.tsx` (filtros genéricos)
2. `filter-popover.tsx` (popover reutilizável)
3. `filter-types.ts` (tipos)

### Phase 3: Migrate Tables (one at a time)
1. **Plans** (mais simples, sem filtros complexos)
2. **Teams** (converter de grid para table)
3. **Companies** (adicionar filtros)
4. **Members** (já tem TanStack, adaptar)
5. **Actions** (já funciona, apenas padronizar estilo)

### Phase 4: Polish
1. Melhorar Pagination styling (backdrop-blur)
2. Skeleton states consistentes
3. Empty states consistentes
4. Accessibility (ARIA labels, keyboard nav)

---

## TypeScript Types

```typescript
// src/components/shared/table/types.ts
import { ColumnDef } from '@tanstack/react-table'
import { LucideIcon } from 'lucide-react'

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export interface ResponsiveDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  CardComponent: React.ComponentType<{ item: T }>
  emptyMessage?: string
  isLoading?: boolean
  pagination?: PaginationConfig
  filters?: React.ReactNode
  manualPagination?: boolean
  manualSorting?: boolean
}

export type FilterType = 'search' | 'select' | 'toggle' | 'date-range'

export interface FilterOption {
  value: string
  label: string
  icon?: LucideIcon
}

export interface FilterConfig {
  type: FilterType
  key: string
  label: string
  icon?: LucideIcon
  options?: FilterOption[]
  placeholder?: string
}

export interface StandardFiltersProps {
  config: FilterConfig[]
  values: Record<string, any>
  onChange: (values: Record<string, any>) => void
  onClear?: () => void
}
```

---

## Testing Strategy

### Unit Tests
- `useTableState` hook (pagination, sorting, filters, persistence)
- `useResponsiveTable` hook (breakpoint detection)
- Filter logic (StandardFilters)

### Integration Tests
- ResponsiveDataTable com dados mock
- Troca entre mobile/desktop views
- Paginação client-side vs server-side
- Filtros atualizando dados

### Visual Tests (Manual)
- Responsividade em diferentes breakpoints
- Hover states (cards e table rows)
- Loading states (skeleton)
- Empty states
- Transições suaves

---

## Acceptance Criteria

✅ **Core Components:**
- [ ] ResponsiveDataTable funciona em mobile e desktop
- [ ] TableView usa TanStack React Table corretamente
- [ ] CardView renderiza cards customizados
- [ ] useTableState gerencia estado completo
- [ ] useResponsiveTable detecta breakpoints

✅ **Filters:**
- [ ] StandardFilters suporta search, select, toggle
- [ ] Popovers abrem/fecham corretamente
- [ ] Badges mostram contagem de filtros ativos
- [ ] Clear all remove todos os filtros

✅ **Styling:**
- [ ] Cards mobile têm estilo Kanban (backdrop-blur, hover)
- [ ] Table desktop tem sticky header
- [ ] Custom scrollbar em ambas as views
- [ ] Transições suaves entre estados

✅ **Tables Migradas:**
- [ ] Plans table com paginação
- [ ] Teams convertido para table responsiva
- [ ] Companies com filtros padronizados
- [ ] Members com estilo atualizado
- [ ] Actions mantendo funcionalidade atual

✅ **Pagination:**
- [ ] Client-side pagination funciona
- [ ] Server-side pagination funciona
- [ ] Persist pageSize no localStorage
- [ ] Números de página corretos

✅ **Responsiveness:**
- [ ] Mobile (< 768px): mostra cards
- [ ] Desktop (≥ 768px): mostra table
- [ ] Transição suave ao resize
- [ ] Touch-friendly em mobile

---

## Future Enhancements (Out of Scope)

- Bulk actions (select multiple, delete all, etc.)
- Export to CSV/Excel
- Advanced filters (date ranges, multi-select)
- Column visibility toggle
- Column reordering
- Row expansion (nested data)
- Virtualization para tabelas muito grandes

---

**Design Status:** ✅ Validated and ready for implementation
**Next Step:** Create detailed implementation plan using `superpowers:writing-plans`
