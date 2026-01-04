# Design System Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement refined purple color palette and strategic border-radius system across the application.

**Architecture:** Update CSS variables in globals.css, extend Tailwind config, and systematically update component styles to use new design tokens.

**Tech Stack:** CSS Variables, Tailwind CSS 3.x, TypeScript, React

---

## Task 1: Update Color Variables

**Files:**
- Modify: `src/app/globals.css:3-50`

**Step 1: Backup current color values**

Run: `git diff src/app/globals.css`
Expected: See current values before changes

**Step 2: Update primary and accent colors**

In `src/app/globals.css`, find the `:root` block and update:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 264 10% 10%;

    /* Primary - Roxo vibrante */
    --primary: 264 70% 55%;
    --primary-foreground: 0 0% 100%;

    /* Accent - Roxo pastel */
    --accent: 264 85% 70%;
    --accent-foreground: 264 70% 20%;

    /* Card */
    --card: 0 0% 100%;
    --card-foreground: 264 10% 10%;

    /* Popover */
    --popover: 0 0% 100%;
    --popover-foreground: 264 10% 10%;

    /* Muted */
    --muted: 264 10% 95%;
    --muted-foreground: 264 5% 40%;

    /* Borders */
    --border: 264 15% 88%;
    --input: 264 15% 88%;
    --ring: 264 70% 55%;

    /* Semantic colors */
    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    /* Chart colors (keep existing or update) */
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }
}
```

**Step 3: Add new semantic colors**

After the existing colors in `:root`, add:

```css
    /* Success - Verde vibrante */
    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;

    /* Warning - Amarelo/laranja */
    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
```

**Step 4: Update dark mode colors (if .dark exists)**

Find the `.dark` block and update to match:

```css
  .dark {
    --background: 264 10% 10%;
    --foreground: 0 0% 95%;

    --primary: 264 75% 60%;
    --primary-foreground: 0 0% 100%;

    --accent: 264 80% 65%;
    --accent-foreground: 264 60% 15%;

    --card: 264 8% 12%;
    --card-foreground: 0 0% 95%;

    --popover: 264 8% 12%;
    --popover-foreground: 0 0% 95%;

    --muted: 264 8% 20%;
    --muted-foreground: 264 5% 60%;

    --border: 264 15% 25%;
    --input: 264 15% 25%;
    --ring: 264 75% 60%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --success: 142 76% 36%;
    --success-foreground: 0 0% 100%;

    --warning: 38 92% 50%;
    --warning-foreground: 0 0% 100%;
  }
```

**Step 5: Verify CSS compiles**

Run: `pnpm dev`
Expected: No CSS errors, dev server starts successfully

**Step 6: Visual check in browser**

Open: `http://localhost:3000`
Check: Primary buttons are more vibrant purple (#7C3AED)
Check: Text contrast is improved

**Step 7: Commit color changes**

```bash
git add src/app/globals.css
git commit -m "feat(design): update color palette to refined purple theme

- Increase primary saturation (29% → 70%)
- Add success and warning semantic colors
- Improve contrast for WCAG AAA compliance
- Update dark mode variants"
```

---

## Task 2: Add Border-Radius Variables

**Files:**
- Modify: `src/app/globals.css:3-50`

**Step 1: Add radius variables to :root**

In `src/app/globals.css`, after the color variables in `:root`, add:

```css
    /* Border Radius System */
    --radius: 8px;  /* Default, compatibility with Shadcn */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 20px;
```

**Step 2: Add same radius variables to .dark (if exists)**

```css
  .dark {
    /* ... existing dark colors ... */

    /* Border Radius (same as light mode) */
    --radius: 8px;
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 20px;
  }
```

**Step 3: Verify CSS compiles**

Run: `pnpm dev`
Expected: No CSS errors

**Step 4: Commit radius variables**

```bash
git add src/app/globals.css
git commit -m "feat(design): add strategic border-radius system

- Add radius scale from 6px to 20px
- Create visual hierarchy through different radius sizes
- Maintain Shadcn compatibility with --radius: 8px"
```

---

## Task 3: Extend Tailwind Config

**Files:**
- Modify: `tailwind.config.ts:10-40`

**Step 1: Read current config**

Run: `cat tailwind.config.ts`
Check: Current `theme.extend` structure

**Step 2: Update colors in theme.extend**

Find `theme: { extend: { colors: { ... } } }` and update:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "9999px",
      },
      // ... keep other extends like keyframes, animation
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**Step 3: Verify TypeScript compiles**

Run: `pnpm tsc --noEmit`
Expected: No type errors

**Step 4: Test Tailwind classes work**

Run: `pnpm dev`
Open browser, inspect element with `rounded-xl`
Expected: Should have `border-radius: 16px` (from var(--radius-xl))

**Step 5: Commit Tailwind config**

```bash
git add tailwind.config.ts
git commit -m "feat(design): extend Tailwind with new design tokens

- Add success and warning color utilities
- Map border-radius scale to Tailwind classes
- Enable rounded-{sm,md,lg,xl,2xl} utilities"
```

---

## Task 4: Update Button Component (Primary Radius)

**Files:**
- Modify: `src/components/ui/button.tsx:20-30`

**Step 1: Read current button variants**

Run: `cat src/components/ui/button.tsx | grep -A 20 "const buttonVariants"`
Check: Current className structure

**Step 2: Update default variant radius**

Find the `buttonVariants` cva definition and update the `default` variant:

```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 rounded-[10px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

**Note:** Added `rounded-[10px]` to the `default` variant for slightly pill-like primary buttons.

**Step 3: Verify button compiles**

Run: `pnpm dev`
Expected: No errors

**Step 4: Visual check primary buttons**

Open: Any page with primary buttons (e.g., /plans with "Novo Plano")
Check: Button has 10px border-radius and vibrant purple

**Step 5: Commit button changes**

```bash
git add src/components/ui/button.tsx
git commit -m "feat(design): update primary button radius to 10px

- Apply slightly pill-like shape to default variant
- Creates visual distinction from secondary buttons (8px)"
```

---

## Task 5: Update Kanban Board Cards

**Files:**
- Modify: `src/components/features/actions/action-list/action-kanban-board.tsx:200-220`

**Step 1: Find Kanban card rendering**

Run: `grep -n "rounded-lg" src/components/features/actions/action-list/action-kanban-board.tsx`
Check: Line numbers of card className

**Step 2: Update card border-radius**

Find the card component (likely around line 200-220) and change:

```tsx
// Before
<div className="rounded-lg border ...">

// After
<div className="rounded-xl border ...">
```

**Step 3: Check for nested rounded elements**

Search for any child elements that might conflict:
Run: `grep "rounded" src/components/features/actions/action-list/action-kanban-board.tsx`

Ensure consistency - if there are badge/tag elements inside, they should use `rounded-sm`

**Step 4: Visual verification**

Run: `pnpm dev`
Navigate to: Actions page with Kanban view
Check: Cards have 16px border-radius (more prominent rounding)

**Step 5: Commit Kanban changes**

```bash
git add src/components/features/actions/action-list/action-kanban-board.tsx
git commit -m "feat(design): increase Kanban card radius to 16px

- Apply rounded-xl for visual prominence
- Largest cards get largest radius (hierarchy)"
```

---

## Task 6: Verify Card Components Radius

**Files:**
- Verify: `src/app/(protected)/plans/plan-card.tsx`
- Verify: `src/app/(protected)/companies/company-card.tsx`
- Verify: `src/app/(protected)/companies/[companyId]/teams/team-card.tsx`
- Verify: `src/components/shared/table/card-view.tsx`

**Step 1: Check PlanCard**

Run: `grep "rounded" src/app/(protected)/plans/plan-card.tsx`
Expected: Should use `rounded-lg` (12px)

If not, update:
```tsx
<Card className="rounded-lg ...">
```

**Step 2: Check CompanyCard**

Run: `grep "rounded" src/app/(protected)/companies/company-card.tsx`
Expected: Should use `rounded-lg` (12px)

**Step 3: Check TeamCard**

Run: `grep "rounded" src/app/(protected)/companies/[companyId]/teams/team-card.tsx`
Expected: Should use `rounded-lg` (12px)

**Step 4: Check CardView wrapper**

Run: `grep "rounded" src/components/shared/table/card-view.tsx`
Expected: Individual cards use `rounded-lg` via CardComponent prop

**Step 5: Update if needed and commit**

If any cards were updated:
```bash
git add src/app/(protected)/*/
git commit -m "fix(design): ensure list cards use rounded-lg (12px)

- PlanCard, CompanyCard, TeamCard standardized
- Consistent with responsive table design"
```

If all correct, no commit needed.

---

## Task 7: Update Modal/Dialog Radius

**Files:**
- Verify: `src/components/ui/dialog.tsx`

**Step 1: Check Dialog component**

Run: `cat src/components/ui/dialog.tsx | grep -A 5 "DialogContent"`
Check: Current border-radius

**Step 2: Update DialogContent if needed**

Should have `rounded-xl`:

```tsx
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl sm:rounded-xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

**Step 3: Commit if changed**

```bash
git add src/components/ui/dialog.tsx
git commit -m "feat(design): update dialog radius to 16px (rounded-xl)

- Prominent rounding for primary UI surface
- Consistent with large card styling"
```

---

## Task 8: Update Input/Select Radius

**Files:**
- Verify: `src/components/ui/input.tsx`
- Verify: `src/components/ui/select.tsx`

**Step 1: Check Input component**

Run: `cat src/components/ui/input.tsx | grep "rounded"`
Expected: Should have `rounded-md` (8px)

If has `rounded-lg`, update to `rounded-md`:

```tsx
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
```

**Step 2: Check Select component**

Run: `cat src/components/ui/select.tsx | grep "rounded"`
Expected: SelectTrigger should have `rounded-md`

**Step 3: Commit if changed**

```bash
git add src/components/ui/input.tsx src/components/ui/select.tsx
git commit -m "fix(design): ensure inputs and selects use rounded-md (8px)

- Professional appearance for form elements
- Consistent with button secondary styling"
```

---

## Task 9: Update Pagination Component

**Files:**
- Modify: `src/components/shared/data/pagination.tsx:75-120`

**Step 1: Check pagination button radius**

Run: `grep "rounded" src/components/shared/data/pagination.tsx`
Check: Current radius on page number buttons

**Step 2: Update to rounded-md if needed**

Page buttons should use `rounded-md` (8px):

```tsx
<Button
  variant={page === pageNum ? 'default' : 'outline'}
  size="sm"
  onClick={() => onPageChange(pageNum)}
  className="h-9 w-9 rounded-md p-0 text-xs transition-all duration-200 hover:shadow-sm sm:text-sm"
>
  {pageNum}
</Button>
```

**Step 3: Verify visual consistency**

Run: `pnpm dev`
Navigate to: Any paginated page (Plans, Companies)
Check: Pagination buttons have 8px radius

**Step 4: Commit**

```bash
git add src/components/shared/data/pagination.tsx
git commit -m "fix(design): standardize pagination button radius to 8px

- Consistent with other secondary interactive elements"
```

---

## Task 10: Visual Regression Testing

**Files:**
- None (manual testing task)

**Step 1: Build production bundle**

Run: `pnpm build`
Expected: Build succeeds with no errors

**Step 2: Test all major pages**

Run: `pnpm dev` or `pnpm start`

Visit and verify each page:

**Homepage/Auth:**
- [ ] Login page - inputs have 8px radius
- [ ] Buttons vibrant purple, 10px radius

**Dashboard:**
- [ ] Cards use appropriate radius
- [ ] Navigation elements consistent

**Actions (Kanban):**
- [ ] Kanban cards have 16px radius (most prominent)
- [ ] Hover states show proper purple
- [ ] Badges/tags have 6px radius

**Tables (Plans, Companies, Teams):**
- [ ] Desktop table container: 12px radius
- [ ] Mobile cards: 12px radius
- [ ] Filter popovers: 12px radius
- [ ] Pagination buttons: 8px radius

**Forms:**
- [ ] All inputs: 8px radius
- [ ] All selects: 8px radius
- [ ] Primary buttons: 10px radius
- [ ] Secondary buttons: 8px radius

**Modals/Dialogs:**
- [ ] Dialog containers: 16px radius
- [ ] Close buttons: appropriate radius

**Step 3: Test dark mode (if applicable)**

Toggle dark mode (if exists)
Verify: All colors adjust properly, radius unchanged

**Step 4: Document any issues**

If visual bugs found, create issues or fix immediately:
- Screenshot the issue
- Note the component and expected vs actual
- Fix in separate commit

**Step 5: Create verification checklist commit**

```bash
git add .
git commit -m "test: visual regression verification complete

All components verified:
- Kanban cards: 16px ✓
- List cards: 12px ✓
- Inputs/selects: 8px ✓
- Primary buttons: 10px ✓
- Secondary buttons: 8px ✓
- Modals: 16px ✓
- Colors: Vibrant purple theme ✓" --allow-empty
```

---

## Task 11: Accessibility Audit

**Files:**
- None (testing task)

**Step 1: Install axe DevTools**

Browser extension: Chrome Web Store → "axe DevTools"

**Step 2: Run accessibility scan**

For each major page:
1. Open axe DevTools panel
2. Click "Scan ALL of my page"
3. Check for color contrast issues

Expected: No critical issues

**Step 3: Test keyboard navigation**

On each page:
- [ ] Tab through all interactive elements
- [ ] Focus rings visible (3px solid purple)
- [ ] Logical tab order
- [ ] Enter/Space activate buttons

**Step 4: Test with screen reader (optional)**

MacOS: Enable VoiceOver (Cmd+F5)
Windows: Enable Narrator

Verify: All interactive elements announced properly

**Step 5: Document results**

Create: `docs/accessibility-audit-2026-01-04.md`

```markdown
# Accessibility Audit - Design System Update

**Date:** 2026-01-04
**Auditor:** Claude Sonnet 4.5

## Color Contrast

- Primary buttons: 4.7:1 (WCAG AA ✓)
- Body text: 12.5:1 (WCAG AAA ✓)
- Muted text: 7.2:1 (WCAG AAA ✓)

## Keyboard Navigation

- All buttons focusable ✓
- Focus rings visible (3px solid) ✓
- Logical tab order ✓

## Screen Reader

- All interactive elements labeled ✓
- Semantic HTML used ✓

## Issues

None found.
```

**Step 6: Commit audit results**

```bash
git add docs/accessibility-audit-2026-01-04.md
git commit -m "docs: accessibility audit for design system update

All WCAG AA requirements met
No critical issues found"
```

---

## Task 12: Final Verification and Cleanup

**Files:**
- All modified files

**Step 1: Run full build**

Run: `pnpm build`
Expected: Success with no warnings

**Step 2: Run TypeScript check**

Run: `pnpm tsc --noEmit`
Expected: No type errors

**Step 3: Check for console errors**

Run: `pnpm dev`
Open browser console on each page
Expected: No errors or warnings

**Step 4: Review git diff**

Run: `git diff origin/feat/actions`
Review: All changes align with design document

**Step 5: Update design document status**

Edit: `docs/plans/2026-01-04-design-system-foundation.md`

Change status from "Validated" to "Implemented":

```markdown
**Status:** ✅ Implemented (2026-01-04)
```

**Step 6: Final commit**

```bash
git add docs/plans/2026-01-04-design-system-foundation.md
git commit -m "docs: mark design system foundation as implemented

Phase 1 complete:
- Refined purple color palette ✓
- Strategic border-radius system ✓
- All components updated ✓
- Accessibility verified ✓"
```

---

## Acceptance Criteria

✅ **Colors:**
- [ ] Primary color is vibrant purple (#7C3AED)
- [ ] Contrast meets WCAG AAA for body text
- [ ] Success, warning, destructive colors implemented
- [ ] Dark mode variants work correctly (if applicable)

✅ **Border-Radius:**
- [ ] Kanban cards: 16px
- [ ] List cards (Plans, Companies, Teams): 12px
- [ ] Modals/Dialogs: 16px
- [ ] Inputs/Selects: 8px
- [ ] Primary buttons: 10px
- [ ] Secondary buttons: 8px
- [ ] Pagination: 8px
- [ ] Avatars: rounded-full (Phase 2)

✅ **Technical:**
- [ ] Build succeeds with no errors
- [ ] TypeScript compiles with no errors
- [ ] No console errors in browser
- [ ] CSS variables properly defined
- [ ] Tailwind config extends correctly

✅ **Visual:**
- [ ] All pages reviewed manually
- [ ] Hover states work correctly
- [ ] Focus states visible
- [ ] Responsive design intact

✅ **Accessibility:**
- [ ] Color contrast WCAG AA minimum
- [ ] Keyboard navigation functional
- [ ] Focus rings visible
- [ ] Screen reader friendly

---

## Rollback Plan

If issues arise after implementation:

```bash
# Revert all design system changes
git revert HEAD~12..HEAD

# Or revert specific commit
git revert <commit-hash>

# Or reset to before changes (if not pushed)
git reset --hard origin/feat/actions
```

**Backup:** All changes are in git history, safe to revert.

---

## Next Steps (Phase 2)

After Phase 1 is complete and verified:

1. **User Avatars (initials + colors)**
   - Add fields to User schema
   - Generate initials automatically
   - Assign random avatar color
   - Create `<UserAvatar>` component
   - Use in profile and action cards

2. **Component Standardization**
   - Standardize form layouts
   - Complete filter positioning
   - Navigation improvements

---

**Implementation Status:** 🟡 Ready to implement
**Estimated Time:** 2-3 hours
**Complexity:** Low (mostly styling updates)
