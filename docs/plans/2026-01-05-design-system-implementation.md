# Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Apply design system guidelines to action filters: add date presets, remove unnecessary icons, and improve visual consistency.

**Architecture:** Bottom-up approach - create utilities first, then update UI components. Follow YAGNI (only build what's needed), DRY (reuse date logic), and maintain existing functionality.

**Tech Stack:** React, TypeScript, Zustand, Tailwind CSS, lucide-react icons

---

## Task 1: Create Date Preset Utilities

**Files:**
- Create: `src/lib/utils/date-presets.ts`
- Test: Manual testing in browser (utility functions)

**Step 1: Create date preset utility file**

Create `src/lib/utils/date-presets.ts` with type-safe preset functions:

```typescript
export type DatePreset = 'esta-semana' | 'ultimas-2-semanas' | 'este-mes' | 'ultimos-30-dias'

export interface DateRange {
  dateFrom: string // ISO string
  dateTo: string // ISO string
}

export interface DatePresetOption {
  id: DatePreset
  label: string
  getRange: () => DateRange
}

/**
 * Get Monday of current week at 00:00:00
 */
function getMonday(): Date {
  const today = new Date()
  const day = today.getDay()
  const diff = day === 0 ? 6 : day - 1 // Sunday is 0, Monday is 1
  const monday = new Date(today)
  monday.setDate(today.getDate() - diff)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/**
 * Get Sunday of current week at 23:59:59
 */
function getSunday(): Date {
  const monday = getMonday()
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return sunday
}

/**
 * Esta Semana: Segunda-feira até Domingo da semana atual
 */
export function getThisWeekRange(): DateRange {
  return {
    dateFrom: getMonday().toISOString(),
    dateTo: getSunday().toISOString(),
  }
}

/**
 * Últimas 2 Semanas: 14 dias atrás até hoje
 */
export function getLastTwoWeeksRange(): DateRange {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const twoWeeksAgo = new Date(today)
  twoWeeksAgo.setDate(today.getDate() - 14)
  twoWeeksAgo.setHours(0, 0, 0, 0)

  return {
    dateFrom: twoWeeksAgo.toISOString(),
    dateTo: today.toISOString(),
  }
}

/**
 * Este Mês: Dia 1 até último dia do mês atual
 */
export function getThisMonthRange(): DateRange {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  firstDay.setHours(0, 0, 0, 0)

  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  lastDay.setHours(23, 59, 59, 999)

  return {
    dateFrom: firstDay.toISOString(),
    dateTo: lastDay.toISOString(),
  }
}

/**
 * Últimos 30 Dias: 30 dias atrás até hoje
 */
export function getLastThirtyDaysRange(): DateRange {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  return {
    dateFrom: thirtyDaysAgo.toISOString(),
    dateTo: today.toISOString(),
  }
}

/**
 * All available date presets
 */
export const datePresets: DatePresetOption[] = [
  {
    id: 'esta-semana',
    label: 'Esta Semana',
    getRange: getThisWeekRange,
  },
  {
    id: 'ultimas-2-semanas',
    label: 'Últimas 2 Semanas',
    getRange: getLastTwoWeeksRange,
  },
  {
    id: 'este-mes',
    label: 'Este Mês',
    getRange: getThisMonthRange,
  },
  {
    id: 'ultimos-30-dias',
    label: 'Últimos 30 Dias',
    getRange: getLastThirtyDaysRange,
  },
]

/**
 * Get preset by ID
 */
export function getPresetById(id: DatePreset): DatePresetOption | undefined {
  return datePresets.find(p => p.id === id)
}
```

**Step 2: Verify file was created**

Run: `ls -la src/lib/utils/date-presets.ts`
Expected: File exists

**Step 3: Commit**

```bash
git add src/lib/utils/date-presets.ts
git commit -m "feat: add date preset utilities

- Add type-safe date range calculation functions
- Support Esta Semana, Últimas 2 Semanas, Este Mês, Últimos 30 Dias
- Export reusable preset options array"
```

---

## Task 2: Update Filter Store with Date Preset Field

**Files:**
- Modify: `src/lib/stores/action-filters-store.ts:8-32`
- Modify: `src/lib/stores/action-filters-store.ts:34-51`
- Modify: `src/lib/stores/action-filters-store.ts:73-81`

**Step 1: Import DatePreset type**

Add import at top of file (after line 3):

```typescript
import type { ActionPriority, ActionStatus } from '@/lib/types/action';
import type { DatePreset } from '@/lib/utils/date-presets'; // Add this line
```

**Step 2: Add datePreset field to ActionFiltersState interface**

Modify interface (lines 8-32), add field after `dateFilterType`:

```typescript
interface ActionFiltersState {
  // Filter values
  statuses: ActionStatus[];
  priority: ActionPriority | 'all';
  assignment: AssignmentFilter;
  dateFrom: string | null; // ISO string
  dateTo: string | null; // ISO string
  dateFilterType: DateFilterType; // Filter by creation date or start date
  datePreset: DatePreset | null; // Add this line - tracks active preset
  companyId: string | null;
  teamId: string | null;
  showBlockedOnly: boolean;
  showLateOnly: boolean;
  searchQuery: string;

  // Table preferences
  viewMode: 'list' | 'kanban';
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;

  // Actions
  setFilter: <K extends keyof ActionFiltersState>(key: K, value: ActionFiltersState[K]) => void;
  resetFilters: () => void;
}
```

**Step 3: Add datePreset to initialState**

Modify initialState (lines 34-51), add after `dateFilterType`:

```typescript
const initialState = {
  statuses: [] as ActionStatus[],
  priority: 'all' as const,
  assignment: 'all' as AssignmentFilter,
  dateFrom: null,
  dateTo: null,
  dateFilterType: 'createdAt' as DateFilterType,
  datePreset: null, // Add this line
  companyId: null,
  teamId: null,
  showBlockedOnly: false,
  showLateOnly: false,
  searchQuery: '',
  viewMode: 'list' as const,
  sortBy: 'estimatedEndDate',
  sortOrder: 'asc' as const,
  page: 1,
  pageSize: 20,
};
```

**Step 4: Add datePreset to persistence**

Modify partialize (lines 73-81), add after `dateFilterType`:

```typescript
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        pageSize: state.pageSize,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        dateFilterType: state.dateFilterType,
        datePreset: state.datePreset, // Add this line
      }),
```

**Step 5: Verify TypeScript compiles**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 6: Commit**

```bash
git add src/lib/stores/action-filters-store.ts
git commit -m "feat: add datePreset field to filter store

- Track which date preset is active
- Persist preset selection in localStorage
- Type-safe with DatePreset type"
```

---

## Task 3: Remove Unnecessary Icons from Filter Buttons

**Files:**
- Modify: `src/components/features/actions/action-list/action-filters.tsx:11-21`
- Modify: `src/components/features/actions/action-list/action-filters.tsx:139-142`
- Modify: `src/components/features/actions/action-list/action-filters.tsx:146-159`
- Modify: `src/components/features/actions/action-list/action-filters.tsx:216-229`
- Modify: `src/components/features/actions/action-list/action-filters.tsx:282-295`
- Modify: `src/components/features/actions/action-list/action-filters.tsx:340-353`

**Step 1: Remove unused icon imports**

Update imports (lines 11-21), remove CheckCircle2, Filter, Flag, UserCircle2, CalendarIcon:

```typescript
import {
  LayoutGrid,
  LayoutList,
  Search,
  X,
} from 'lucide-react'
```

**Step 2: Remove "Filtros" decorative label**

Remove lines 139-142 entirely:

```typescript
// DELETE these lines:
//   <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 uppercase tracking-wide pr-2">
//     <Filter className="h-3.5 w-3.5" />
//     <span>Filtros</span>
//   </div>
```

**Step 3: Remove icon from Status button**

Update Status button (lines 146-159), remove icon but keep badge:

```typescript
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.statuses.length > 0)}
            >
              <span>Status</span>
              {filters.statuses.length > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {filters.statuses.length}
                </span>
              )}
            </Button>
```

**Step 4: Remove icon from Priority button**

Update Priority button (lines 216-229), remove icon but keep badge:

```typescript
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.priority !== 'all')}
            >
              <span>Prioridade</span>
              {filters.priority !== 'all' && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
```

**Step 5: Remove icon from Assignment button**

Update Assignment button (lines 282-295), remove icon but keep badge:

```typescript
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(filters.assignment !== 'all')}
            >
              <span>Atribuição</span>
              {filters.assignment !== 'all' && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
```

**Step 6: Remove icon from Date button and update badge logic**

Update Date button (lines 340-353), remove icon, show preset label in badge:

```typescript
            <Button
              variant="outline"
              size="sm"
              className={getButtonState(!!filters.dateFrom || !!filters.dateTo)}
            >
              <span>Data</span>
              {filters.datePreset && (
                <span className="ml-1.5 inline-flex h-5 px-1.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {getPresetById(filters.datePreset)?.label || 'Ativo'}
                </span>
              )}
              {!filters.datePreset && (filters.dateFrom || filters.dateTo) && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  1
                </span>
              )}
            </Button>
```

**Step 7: Add getPresetById import**

Add to imports at top:

```typescript
import { getPresetById } from '@/lib/utils/date-presets'
```

**Step 8: Test in browser**

1. Run: `npm run dev`
2. Open: `http://localhost:3000/actions`
3. Verify: Filter buttons show only text (no icons)
4. Verify: Badges still display correctly
5. Verify: Search icon still appears (it's a standard pattern for search inputs)
6. Verify: View toggle icons still appear (icon-only buttons)

Expected: Cleaner, less cluttered filter bar

**Step 9: Commit**

```bash
git add src/components/features/actions/action-list/action-filters.tsx
git commit -m "refactor: remove redundant icons from filter buttons

- Remove icons from Status, Priority, Assignment, Date buttons
- Keep badges for active filter count
- Remove decorative 'Filtros' label icon
- Follow design system guideline: text-only for clear labels
- Preserve icons for: search input, view toggles (icon-only buttons)"
```

---

## Task 4: Add Date Preset Buttons to Popover

**Files:**
- Modify: `src/components/features/actions/action-list/action-filters.tsx:355-442`

**Step 1: Import datePresets**

Add to imports (already have getPresetById from previous task):

```typescript
import { getPresetById, datePresets } from '@/lib/utils/date-presets'
```

**Step 2: Replace Date Popover content**

Replace PopoverContent (lines 355-442) with new structure:

```typescript
          <PopoverContent className="w-[280px] p-0" align="start">
            <div className="p-3 space-y-3">
              {/* Presets Section */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Períodos Rápidos
                </label>
                <div className="space-y-1">
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        'w-full justify-start text-xs font-normal',
                        filters.datePreset === preset.id && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => {
                        const range = preset.getRange()
                        filters.setFilter('dateFrom', range.dateFrom)
                        filters.setFilter('dateTo', range.dateTo)
                        filters.setFilter('datePreset', preset.id)
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-muted" />

              {/* Filter Type Selection */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Filtrar por
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'text-xs font-normal h-8',
                      filters.dateFilterType === 'createdAt' && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', 'createdAt')}
                  >
                    Criação
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'text-xs font-normal h-8',
                      filters.dateFilterType === 'startDate' && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => filters.setFilter('dateFilterType', 'startDate')}
                  >
                    Início
                  </Button>
                </div>
              </div>

              <div className="h-px bg-muted" />

              {/* Custom Date Range */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                  Personalizado
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">De</label>
                    <Input
                      type="date"
                      value={filters.dateFrom ? filters.dateFrom.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value + 'T00:00:00').toISOString() : null
                        filters.setFilter('dateFrom', date)
                        filters.setFilter('datePreset', null) // Clear preset when custom date selected
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-muted-foreground mb-1 block">Até</label>
                    <Input
                      type="date"
                      value={filters.dateTo ? filters.dateTo.split('T')[0] : ''}
                      onChange={(e) => {
                        const date = e.target.value ? new Date(e.target.value + 'T23:59:59').toISOString() : null
                        filters.setFilter('dateTo', date)
                        filters.setFilter('datePreset', null) // Clear preset when custom date selected
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Button */}
              {(filters.dateFrom || filters.dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    filters.setFilter('dateFrom', null)
                    filters.setFilter('dateTo', null)
                    filters.setFilter('datePreset', null)
                  }}
                  className="w-full h-7 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <X className="mr-1.5 h-3 w-3" />
                  Limpar datas
                </Button>
              )}
            </div>
          </PopoverContent>
```

**Step 3: Test preset functionality in browser**

1. Run: `npm run dev`
2. Open: `http://localhost:3000/actions`
3. Click "Data" button
4. Verify: See 4 preset buttons (Esta Semana, Últimas 2 Semanas, Este Mês, Últimos 30 Dias)
5. Click "Esta Semana"
   - Verify: Date button shows badge with "Esta Semana"
   - Verify: Date inputs are populated with correct range
6. Click "Este Mês"
   - Verify: Badge updates to "Este Mês"
   - Verify: Date inputs update
7. Manually change "De" date
   - Verify: Badge disappears (preset cleared)
   - Verify: Generic "1" badge shows
8. Click "Limpar datas"
   - Verify: All dates cleared
   - Verify: Badge disappears
9. Refresh page
   - Verify: Selected preset persists (localStorage)

Expected: All preset functionality works correctly

**Step 4: Commit**

```bash
git add src/components/features/actions/action-list/action-filters.tsx
git commit -m "feat: add date preset buttons to filter popover

- Add 4 quick preset buttons: Esta Semana, Últimas 2 Semanas, Este Mês, Últimos 30 Dias
- Show active preset in button badge
- Clear preset when custom dates selected
- Reorganize popover: Presets → Filter Type → Custom dates
- Improve labels: 'Criação' and 'Início' instead of full text"
```

---

## Task 5: Simplify Popover Selection Indicators

**Files:**
- Modify: `src/components/features/actions/action-list/action-filters.tsx` (multiple sections)

**Context:** Current implementation shows CheckCircle2 icon for selected items in popovers. This adds visual clutter. Following design guidelines, we'll use only background color to indicate selection (already applied via className).

**Step 1: Import CheckCircle2 only for badges**

Icons are already removed from imports in Task 3. No change needed.

**Step 2: Remove CheckCircle2 from Status popover items**

Find Status popover (around line 161-211), remove selection indicator icons:

Before:
```typescript
                    {isActive && (
                      <CheckCircle2 className="ml-auto h-3.5 w-3.5" />
                    )}
```

After: Delete these 3 lines (appears twice in Status popover - "Todos" and individual options)

**Step 3: Remove CheckCircle2 from Priority popover items**

Find Priority popover (around line 231-277), remove selection indicator icons (appears twice).

**Step 4: Remove CheckCircle2 from Assignment popover items**

Find Assignment popover (around line 297-335), remove selection indicator icons (appears twice).

**Step 5: Remove CheckCircle2 from Date Filter Type buttons**

Already handled in Task 4 (new implementation doesn't include these).

**Step 6: Test visual clarity in browser**

1. Run: `npm run dev`
2. Open: `http://localhost:3000/actions`
3. Test each filter popover:
   - Status: Click, select multiple, verify only bg-primary/10 shows selection
   - Priority: Click, select one, verify only bg-primary/10 shows selection
   - Assignment: Click, select one, verify only bg-primary/10 shows selection
   - Date: Already tested in Task 4

Expected: Cleaner popovers, selection clear from background color alone

**Step 7: Commit**

```bash
git add src/components/features/actions/action-list/action-filters.tsx
git commit -m "refactor: remove redundant selection check icons from popovers

- Remove CheckCircle2 icons from Status, Priority, Assignment popovers
- Selection indicated by background color only (bg-primary/10)
- Reduces visual clutter following design system guidelines
- Maintains clear selection state with color"
```

---

## Task 6: Final Testing and Verification

**Files:** None (testing only)

**Step 1: Run TypeScript type check**

Run: `npm run build`
Expected: Build succeeds with no TypeScript errors

**Step 2: Test complete flow in browser**

1. Run: `npm run dev`
2. Open: `http://localhost:3000/actions`
3. **Test date presets:**
   - Click "Data"
   - Click "Esta Semana" → verify correct dates, badge shows "Esta Semana"
   - Click "Últimas 2 Semanas" → verify dates update, badge updates
   - Click "Este Mês" → verify dates, badge
   - Click "Últimos 30 Dias" → verify dates, badge
4. **Test custom dates:**
   - Manually set dateFrom → verify preset badge clears
   - Manually set dateTo → verify badge shows "1"
   - Click "Limpar datas" → verify all cleared
5. **Test persistence:**
   - Set "Esta Semana" preset
   - Refresh page → verify preset restored (badge shows, dates populated)
6. **Test filter combinations:**
   - Set date preset + status filter → verify both work
   - Set date preset + priority filter → verify both work
   - Clear all filters → verify everything resets
7. **Visual verification:**
   - Filter buttons: No icons except view toggles and search
   - Popovers: No check icons, only background colors for selection
   - Badge labels: Show preset names clearly
   - Overall: Cleaner, less cluttered appearance

Expected: All functionality works, visual design cleaner per guidelines

**Step 3: Verify changes against design system doc**

1. Open: `docs/design-system.md`
2. Verify icon usage follows Section 2 guidelines:
   - ✅ No icons on text-clear buttons (Status, Priority, etc.)
   - ✅ Icons only where needed (Search input, view toggles)
   - ✅ No decorative icons (removed "Filtros" icon)
   - ✅ No redundant selection indicators
3. Verify date preset implementation matches Section 3:
   - ✅ 4 presets: Esta Semana, Últimas 2 Semanas, Este Mês, Últimos 30 Dias
   - ✅ Badge shows active preset
   - ✅ Custom dates clear preset
   - ✅ Persistence works

Expected: Implementation matches design system specifications

**Step 4: Test on mobile (optional but recommended)**

1. Open dev tools, toggle device toolbar
2. Test on iPhone SE size (375x667)
3. Verify: Filters responsive, popovers readable, buttons touchable

Expected: Mobile experience good

**Step 5: Document completion**

All tasks completed:
- ✅ Task 1: Date preset utilities created
- ✅ Task 2: Store updated with datePreset field
- ✅ Task 3: Icons removed from filter buttons
- ✅ Task 4: Date presets added to popover
- ✅ Task 5: Selection indicators simplified
- ✅ Task 6: Testing complete

---

## Summary of Changes

**Files Created:**
- `src/lib/utils/date-presets.ts` - Reusable date range calculation utilities

**Files Modified:**
- `src/lib/stores/action-filters-store.ts` - Added datePreset field, persistence
- `src/components/features/actions/action-list/action-filters.tsx` - Removed icons, added presets, simplified indicators

**Git Commits:**
1. `feat: add date preset utilities`
2. `feat: add datePreset field to filter store`
3. `refactor: remove redundant icons from filter buttons`
4. `feat: add date preset buttons to filter popover`
5. `refactor: remove redundant selection check icons from popovers`

**Design Guidelines Applied:**
- Icon usage: Only where they add value (search, view toggles)
- Color semantics: Primary color for active states
- Date presets: Quick access to common periods
- Visual clarity: Less clutter, clear selection states

**Next Steps (Future Work):**
- Apply design guidelines to other components (Dashboard, Sidebar, Forms)
- Create reusable `<StatusBadge>` and `<PriorityBadge>` components
- Audit remaining areas for icon overuse
- Document component patterns in design system

---

## Notes for Implementation

**YAGNI Applied:**
- Only built the 4 requested presets (not all possible date ranges)
- Didn't create generic DatePicker component (not needed yet)
- Kept existing filter logic, only enhanced UX

**DRY Applied:**
- Reusable date calculation functions
- Single source of truth for preset definitions
- Consistent button styling via getButtonState

**No Breaking Changes:**
- All existing functionality preserved
- Backward compatible with stored filters
- API calls unchanged (still uses dateFrom/dateTo)

**Performance:**
- No additional re-renders
- Date calculations only on click (not on every render)
- Zustand persist handles localStorage efficiently
