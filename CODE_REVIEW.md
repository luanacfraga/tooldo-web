# Code Review - Register Master

## ❌ VIOLAÇÕES CRÍTICAS

### 1. Comentários no Código (Regra #2)

#### `src/components/ui/phone-input.tsx`
- **Linha 12-16**: JSDoc comentário
- **Linha 21**: Comentário inline `// Formata o telefone`
- **Linha 23**: Comentário inline `// Remove tudo que não é número`
- **Linha 26**: Comentário inline `// Limita a 11 dígitos`
- **Linha 31**: Comentário inline `// Formata conforme o tamanho`
- **Linha 44**: Comentário inline `// 11 dígitos (celular) - formato: (XX) XXXXX-XXXX`
- **Linha 48**: Comentário inline `// Atualiza o valor formatado quando o value prop mudar`
- **Linha 62**: Comentário inline `// Extrai apenas os números para passar para o onChange`

#### `src/lib/validators/master.ts`
- **Linha 32**: Comentário inline `// Valida se é um número de telefone brasileiro válido`
- **Linha 34**: Comentário inline `// Celular: DDD (2 dígitos) + 9 + 8 dígitos`
- **Linha 38**: Comentário inline `// Fixo: DDD (2 dígitos) + 8 dígitos`

**Ação**: Remover todos os comentários. O código deve ser auto-explicativo.

---

### 2. Tipagem Fraca (Regra #4)

#### `src/app/(public)/register-master/page.tsx`
- **Linha 62**: Uso de type assertion `as { message?: string }` sem validação

```typescript
// ❌ ATUAL
const errorData = err.data as { message?: string }

// ✅ CORRETO - Usar type guard
function isApiErrorData(data: unknown): data is { message?: string } {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('message' in data ? typeof (data as { message: unknown }).message === 'string' || (data as { message: unknown }).message === undefined : true)
  )
}
```

---

### 3. Código Repetitivo (Regra #5)

#### `src/app/(public)/register-master/page.tsx`
- **Linhas 94-98, 112-116, 127-131, 141-145, 159-163, 172-176, 189-193**: Repetição da mesma lógica de className para inputs

**Ação**: Extrair para função auxiliar ou componente wrapper.

```typescript
// ✅ SUGESTÃO
function getInputClassName(hasError: boolean): string {
  return cn(
    'h-12 text-base transition-all',
    hasError
      ? 'border-destructive focus-visible:ring-destructive'
      : 'border-input focus-visible:border-primary focus-visible:ring-primary/20'
  )
}
```

---

### 4. Ordem de Imports (Regra de Imports)

#### `src/app/(public)/register-master/page.tsx`
- **Linhas 3-17**: Imports não estão na ordem correta

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

---

## ⚠️ MELHORIAS SUGERIDAS

### 1. Extrair Lógica de Formatação

#### `src/components/ui/phone-input.tsx`
A função `formatPhone` poderia ser extraída para `src/lib/utils/masks.ts` para reutilização.

### 2. Simplificar PhoneInput

O componente `PhoneInput` tem duas props similares (`onChange` e `onValueChange`). Considerar manter apenas uma.

### 3. Validação de Telefone

A validação no `master.ts` está correta, mas poderia ser extraída para uma função auxiliar para melhor testabilidade.

---

## ✅ PONTOS POSITIVOS

1. ✅ Nenhum `console.log` encontrado
2. ✅ Nenhum `any` explícito (exceto type assertion mencionada)
3. ✅ Componentes tipados corretamente
4. ✅ Estrutura de pastas correta
5. ✅ Uso correto de React Hook Form
6. ✅ Validação com Zod implementada
7. ✅ Tratamento de erros adequado

---

## 📋 CHECKLIST DE CORREÇÕES

- [ ] Remover todos os comentários de `phone-input.tsx`
- [ ] Remover todos os comentários de `master.ts`
- [ ] Substituir type assertion por type guard em `register-master/page.tsx`
- [ ] Extrair lógica repetitiva de className
- [ ] Reorganizar ordem de imports
- [ ] Considerar extrair `formatPhone` para utils
- [ ] Simplificar props do `PhoneInput`

---

## 🎯 PRIORIDADE

**ALTA**:
- Remover comentários (viola regra absoluta)
- Corrigir type assertion (viola regra de tipagem forte)

**MÉDIA**:
- Extrair código repetitivo
- Reorganizar imports

**BAIXA**:
- Melhorias de arquitetura sugeridas

