# Code Review - Mudanças Recentes

## ❌ VIOLAÇÕES CRÍTICAS

### 1. Comentários no Código (Regra #2)

#### `src/components/shared/logo.tsx`

- **Linha 34**: Comentário inline `// Use PNG image if available and useImage is true`
- **Linha 50**: Comentário inline `// Fallback to component-based logo`
- **Linha 59**: Comentário inline `{/* Stylized D with checkmark - square that connects to the 'o' */}`
- **Linha 63**: Comentário inline `// Remove right border to connect with 'o'`
- **Linha 94**: Comentário inline `{/* Icon-only version */}`

**Ação**: Remover todos os comentários. O código deve ser auto-explicativo através de nomes claros.

#### `src/components/layout/header-menu.tsx`

- **Linha 56**: Comentário inline `{/* Left Section: Logo & Mobile Menu */}`
- **Linha 81**: Comentário inline `{/* Right Section: Actions & Profile */}`
- **Linha 83**: Comentário inline `{/* Notifications */}`
- **Linha 89**: Comentário inline `{/* Badge de notificações pode ser adicionado aqui */}`
- **Linha 92**: Comentário inline `{/* Profile Button */}`
- **Linha 98**: Comentário inline `{/* User Info (Desktop only) */}`
- **Linha 108**: Comentário inline `{/* Avatar */}`

**Ação**: Remover todos os comentários JSX.

#### `src/lib/validators/auth.ts`

- **Linha 40**: Comentário inline `// Valida se é um número de telefone brasileiro válido`
- **Linha 42**: Comentário inline `// Celular: DDD (2 dígitos) + 9 + 8 dígitos`
- **Linha 46**: Comentário inline `// Fixo: DDD (2 dígitos) + 8 dígitos`

**Ação**: Remover todos os comentários. A lógica deve ser clara através de nomes de variáveis e funções.

#### `src/lib/hooks/ui/use-form-mask.ts`

- **Linhas 15-20**: JSDoc comentário

**Ação**: Remover JSDoc. O código deve ser auto-explicativo.

---

### 2. Tipagem Fraca (Regra #4)

#### `src/components/layout/header-menu.tsx`

- **Linha 45**: Uso de type assertion `as any` sem validação

```typescript
// ❌ ATUAL
const getRoleLabel = (role: string | undefined) => {
  if (!role) return 'Usuário'
  return formatRole(role as any)
}

// ✅ CORRETO - Tipar corretamente
type UserRole = 'master' | 'admin' | 'manager' | 'executor' | 'consultant'

const getRoleLabel = (role: string | undefined): string => {
  if (!role) return 'Usuário'
  return formatRole(role as UserRole)
}
```

#### `src/components/auth/login/login-form.tsx`

- **Linha 39**: Type assertion sem type guard

```typescript
// ❌ ATUAL
const errorMessage = (err.data as { message?: string })?.message || 'Email ou senha inválidos'

// ✅ CORRETO - Usar type guard
function isApiErrorData(data: unknown): data is { message?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data
      ? typeof (data as { message: unknown }).message === 'string' ||
        (data as { message: unknown }).message === undefined
      : true)
  )
}

const errorMessage = isApiErrorData(err.data)
  ? err.data.message || 'Email ou senha inválidos'
  : 'Email ou senha inválidos'
```

#### `src/components/auth/forgot-password/forgot-password-form.tsx`

- **Linha 42**: Type assertion sem type guard (mesmo padrão acima)

#### `src/components/auth/reset-password/reset-password-form.tsx`

- **Linha 55**: Type assertion sem type guard (mesmo padrão acima)

#### `src/app/(protected)/companies/[companyId]/teams/page.tsx`

- **Linha 85**: Type assertion sem type guard

```typescript
// ❌ ATUAL
const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err instanceof ApiError) {
    const errorData = err.data as { message?: string }
    return errorData?.message || defaultMessage
  }
  return defaultMessage
}

// ✅ CORRETO - Usar type guard
function isApiErrorData(data: unknown): data is { message?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data
      ? typeof (data as { message: unknown }).message === 'string' ||
        (data as { message: unknown }).message === undefined
      : true)
  )
}

const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  if (err instanceof ApiError && isApiErrorData(err.data)) {
    return err.data.message || defaultMessage
  }
  return defaultMessage
}
```

#### `src/components/features/company/selectors/company-selector-view.tsx`

- **Linhas 7-8**: Uso de `any[]` e `any`

```typescript
// ❌ ATUAL
interface CompanySelectorViewProps {
  companies: any[]
  selectedCompany: any
  // ...
}

// ✅ CORRETO - Criar interface específica
interface Company {
  id: string
  name: string
}

interface CompanySelectorViewProps {
  companies: Company[]
  selectedCompany: Company | null
  // ...
}
```

**Ação**: Criar interfaces específicas para tipar corretamente.

#### `src/lib/hooks/ui/use-form-mask.ts`

- **Linhas 7, 21, 28, 44**: Uso de `any` em generics e type assertions

```typescript
// ❌ ATUAL
interface UseFormMaskOptions<T extends Record<string, any>> {
  // ...
}

const fieldValue = watch(fieldName as any)
setValue(fieldName as any, unmasked as any)

// ✅ CORRETO - Usar generics apropriados
interface UseFormMaskOptions<T extends Record<string, string>> {
  fieldName: keyof T
  mask: MaskFunction
  unmask: UnmaskFunction
  watch: UseFormWatch<T>
  setValue: UseFormSetValue<T>
}

const fieldValue = watch(fieldName)
setValue(fieldName, unmasked as T[keyof T])
```

**Ação**: Refatorar para usar generics apropriados sem `any`.

---

### 3. Código Repetitivo (Regra #5)

#### Múltiplos arquivos - Lógica de className repetida

A mesma lógica de className para inputs com erro está repetida em:

- `src/components/auth/login/login-form.tsx` (linhas 65-69, 90-94)
- `src/components/auth/forgot-password/forgot-password-form.tsx` (linhas 96-100)
- `src/components/auth/reset-password/reset-password-form.tsx` (linhas 107-111, 124-128)
- `src/components/register/steps/company-step.tsx` (linhas 27-31, 46-50)

**Ação**: Extrair para função auxiliar ou componente wrapper.

```typescript
// ✅ SUGESTÃO - Criar função auxiliar
import { cn } from '@/lib/utils'

function getInputClassName(hasError: boolean): string {
  return cn(
    'h-12 text-base transition-all',
    hasError
      ? 'border-destructive focus-visible:ring-destructive'
      : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
  )
}

// Uso:
<Input
  className={getInputClassName(!!errors.email)}
  {...register('email')}
/>
```

#### Tratamento de Erro Repetitivo

O padrão de tratamento de erro com type assertion está repetido em múltiplos arquivos.

**Ação**: Criar função utilitária centralizada.

```typescript
// ✅ SUGESTÃO - Criar em src/lib/utils/error-handling.ts
import { ApiError } from '@/lib/api/api-client'

function isApiErrorData(data: unknown): data is { message?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data
      ? typeof (data as { message: unknown }).message === 'string' ||
        (data as { message: unknown }).message === undefined
      : true)
  )
}

export function getApiErrorMessage(err: unknown, defaultMessage: string): string {
  if (err instanceof ApiError && isApiErrorData(err.data)) {
    return err.data.message || defaultMessage
  }
  return defaultMessage
}
```

---

### 4. Ordem de Imports

#### `src/app/(public)/reset-password/page.tsx`

- **Linhas 3-7**: Imports não estão na ordem correta

**Ordem esperada**:

1. React e Next.js
2. Bibliotecas externas
3. Componentes UI base
4. Componentes compartilhados
5. Componentes de feature
6. Hooks
7. Stores
8. API/Endpoints
9. Validators
10. Utils
11. Types

**Ação**: Reorganizar imports conforme padrão.

```typescript
// ❌ ATUAL
import { ResetPasswordForm } from '@/components/auth/reset-password/reset-password-form'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// ✅ CORRETO
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingScreen } from '@/components/shared/feedback/loading-screen'
import { ResetPasswordForm } from '@/components/auth/reset-password/reset-password-form'
```

#### `src/components/auth/forgot-password/forgot-password-form.tsx`

- **Linhas 3-15**: Imports não estão na ordem correta

**Ação**: Reorganizar conforme padrão.

#### `src/components/auth/reset-password/reset-password-form.tsx`

- **Linhas 3-16**: Imports não estão na ordem correta

**Ação**: Reorganizar conforme padrão.

---

## ⚠️ MELHORIAS SUGERIDAS

### 1. Cores Hardcoded

#### `src/components/auth/forgot-password/forgot-password-form.tsx`

- **Linha 56**: `bg-success-lightest` e `text-success-base` - Usar variáveis do sistema
- **Linha 57**: `text-success-base` - Usar variáveis do sistema

#### `src/components/auth/reset-password/reset-password-form.tsx`

- **Linha 69**: `bg-success-lightest` e `text-success-base` - Usar variáveis do sistema
- **Linha 70**: `text-success-base` - Usar variáveis do sistema

**Ação**: Verificar se essas cores estão no sistema de design. Se não, usar variáveis do sistema (`success`, `success/10`, etc.).

### 2. Duplicação de Código em Páginas

#### `src/app/(public)/forgot-password/page.tsx`

- **Linhas 8-19**: Código duplicado para mobile e desktop (título e descrição)

**Ação**: Extrair para componente reutilizável.

```typescript
// ✅ SUGESTÃO
interface PageHeaderProps {
  title: string
  description: string
}

function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <>
      <div className="animate-fade-in mb-8 text-center lg:hidden">
        <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="mb-8 hidden text-center lg:block">
        <h2 className="text-3xl font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
    </>
  )
}
```

#### `src/app/(public)/reset-password/page.tsx`

- **Linhas 28-37**: Mesma duplicação

**Ação**: Aplicar mesma solução.

### 3. Magic Numbers

#### `src/components/auth/reset-password/reset-password-form.tsx`

- **Linha 49**: `setTimeout(() => { router.push('/login') }, 2000)` - Magic number

**Ação**: Extrair para constante.

```typescript
const REDIRECT_DELAY_MS = 2000

setTimeout(() => {
  router.push('/login')
}, REDIRECT_DELAY_MS)
```

---

## ✅ PONTOS POSITIVOS

1. ✅ Nenhum `console.log` encontrado
2. ✅ Estrutura de pastas correta
3. ✅ Componentes tipados (exceto violações mencionadas)
4. ✅ Uso correto de React Hook Form
5. ✅ Validação com Zod implementada
6. ✅ Tratamento de erros adequado (exceto type assertions)
7. ✅ Uso correto de guards e layouts
8. ✅ Estados de loading/error/success tratados
9. ✅ Cores do sistema sendo usadas na maioria dos lugares
10. ✅ Animações com durações padronizadas

---

## 📋 CHECKLIST DE CORREÇÕES

### Prioridade ALTA (Violações de Regras Absolutas)

- [ ] Remover todos os comentários de `logo.tsx`
- [ ] Remover todos os comentários de `header-menu.tsx`
- [ ] Remover todos os comentários de `auth.ts`
- [ ] Remover JSDoc de `use-form-mask.ts`
- [ ] Substituir `as any` por tipagem correta em `header-menu.tsx`
- [ ] Criar type guard para tratamento de erros da API
- [ ] Substituir todas as type assertions por type guards nos formulários
- [ ] Corrigir tipagem em `company-selector-view.tsx` (criar interface `Company`)
- [ ] Corrigir tipagem em `use-form-mask.ts` (remover `any` dos generics)

### Prioridade MÉDIA (Melhorias de Código)

- [ ] Extrair lógica repetitiva de className para função auxiliar
- [ ] Criar função utilitária centralizada para tratamento de erros
- [ ] Reorganizar ordem de imports em todos os arquivos afetados
- [ ] Extrair componente `PageHeader` para evitar duplicação
- [ ] Extrair magic numbers para constantes

### Prioridade BAIXA (Melhorias de Arquitetura)

- [ ] Verificar uso de cores hardcoded e substituir por variáveis do sistema
- [ ] Considerar criar hook customizado para tratamento de erros de formulário

---

## 🎯 PRIORIDADE

**ALTA**:

- Remover comentários (viola regra absoluta #2)
- Corrigir tipagem fraca (viola regra absoluta #4)
- Criar type guards para tratamento de erros

**MÉDIA**:

- Extrair código repetitivo
- Reorganizar imports
- Extrair componentes duplicados

**BAIXA**:

- Melhorias de arquitetura sugeridas
- Verificação de cores hardcoded

---

## 📝 NOTAS ADICIONAIS

### Sobre Comentários CSS

Os comentários em `globals.css` são aceitáveis, pois são parte da documentação do sistema de design e ajudam a entender as variáveis CSS. A regra de não usar comentários se aplica principalmente ao código TypeScript/JavaScript.

### Sobre Type Guards

A criação de type guards centralizados não apenas resolve o problema de tipagem fraca, mas também melhora a manutenibilidade e reutilização do código.

### Sobre Código Repetitivo

A extração da lógica de className e tratamento de erros para funções utilitárias seguirá o princípio DRY (Don't Repeat Yourself) e facilitará futuras manutenções.
