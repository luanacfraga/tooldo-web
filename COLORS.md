# Paleta de Cores Weedu

## Visão Geral

A paleta de cores foi customizada baseada no **weedu-app**, usando **Roxo/Violeta** como cor primária e **Teal** como cor secundária, com suporte completo para modo claro e escuro.

## Cores Principais

### 🟣 Primary (Roxo/Violeta)

**Light Mode:**

- Cor: `hsl(258, 90%, 66%)` - `#8855f6`
- Uso: Botões principais, links, ações primárias

**Dark Mode:**

- Cor: `hsl(258, 85%, 70%)` - Versão mais clara para contraste
- Uso: Versão mais clara para contraste no dark mode

**Como usar:**

```tsx
<Button variant="default">Primary Button</Button>
<div className="bg-primary text-primary-foreground">Primary</div>
<a className="text-primary hover:text-primary/80">Link</a>
```

---

### 🟢 Secondary (Teal)

**Light Mode:**

- Cor: `hsl(173, 80%, 50%)` - `#2dd4bf`
- Uso: Botões secundários, highlights, ações secundárias

**Dark Mode:**

- Cor: `hsl(173, 75%, 55%)` - Versão mais clara para contraste

**Como usar:**

```tsx
<Button variant="secondary">Secondary Button</Button>
<div className="bg-secondary text-secondary-foreground">Secondary</div>
```

---

## Cores de Estado

### 🔴 Destructive (Vermelho)

**Light & Dark Mode:**

- Cor: `hsl(0, 84%, 60%)` - `#EF4444`
- Uso: Botões de deletar, ações destrutivas, erros

**Como usar:**

```tsx
<Button variant="destructive">Delete</Button>
<div className="bg-destructive text-destructive-foreground">Error</div>
<p className="text-destructive">Mensagem de erro</p>
```

---

### ✅ Success (Teal)

**Light Mode:**

- Cor: `hsl(173, 80%, 50%)` - `#2dd4bf`
- Uso: Mensagens de sucesso, confirmações, badges positivos

**Dark Mode:**

- Cor: `hsl(173, 75%, 55%)` - Versão mais clara para contraste

**Como usar:**

```tsx
<Button variant="success">Save</Button>
<div className="bg-success text-success-foreground">Success</div>
<p className="text-success">Operação concluída</p>
```

---

### 🔵 Info (Azul)

**Light Mode:**

- Cor: `hsl(217, 91%, 60%)` - `#3b82f6`
- Uso: Informações, mensagens informativas, badges informativos

**Dark Mode:**

- Cor: `hsl(217, 91%, 65%)` - Versão mais clara para contraste

**Como usar:**

```tsx
<div className="bg-info text-info-foreground">Info</div>
<p className="text-info">Informação importante</p>
```

---

### ⚠️ Warning (Laranja)

**Light Mode:**

- Cor: `hsl(38, 92%, 50%)` - `#F59E0B`
- Uso: Avisos, alertas não críticos

**Dark Mode:**

- Mesma cor com foreground ajustado

**Como usar:**

```tsx
<Button variant="warning">Warning</Button>
<div className="bg-warning text-warning-foreground">Warning</div>
<p className="text-warning">Atenção necessária</p>
```

---

## Cores de UI

### Background & Foreground

**Light Mode:**

- Background: Branco `#FFFFFF`
- Foreground: Cinza escuro `#1A1A1A`

**Dark Mode:**

- Background: Cinza muito escuro `#1A1A1A`
- Foreground: Branco suave `#F5F5F5`

---

### Card

**Light Mode:**

- Background: Branco `#FFFFFF`

**Dark Mode:**

- Background: Cinza escuro `#212121`

**Como usar:**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
;<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo do card</CardContent>
</Card>
```

---

### Muted

**Light Mode:**

- Background: Cinza muito claro `#F5F5F5`
- Foreground: Cinza médio `#666666`

**Dark Mode:**

- Background: Cinza escuro `#333333`
- Foreground: Cinza claro `#A6A6A6`

**Como usar:**

```tsx
<div className="bg-muted text-muted-foreground">Texto auxiliar ou backgrounds secundários</div>
```

---

### Accent

**Light Mode:**

- Background: Teal muito claro `#E6FAF8`
- Foreground: Teal escuro `#0D9488`

**Dark Mode:**

- Background: Cinza escuro `#333333`
- Foreground: Branco suave

**Como usar:**

```tsx
<div className="bg-accent text-accent-foreground">Elementos destacados</div>
```

---

### Border & Input

**Light Mode:**

- Cor: Cinza claro `#E5E5E5`

**Dark Mode:**

- Cor: Cinza escuro `#333333`

**Como usar:**

```tsx
import { Input } from '@/components/ui/input'

<Input className="border-border" placeholder="Email" />
<div className="border border-border">Box com borda</div>
```

---

## Exemplos de Uso

### Botões

```tsx
import { Button } from '@/components/ui/button'

// Primary
<Button>Primary Action</Button>

// Secondary
<Button variant="secondary">Secondary Action</Button>

// Success
<Button variant="success">Save Changes</Button>

// Warning
<Button variant="warning">Review Changes</Button>

// Destructive
<Button variant="destructive">Delete Item</Button>

// Outline
<Button variant="outline">Cancel</Button>

// Ghost
<Button variant="ghost">Menu Item</Button>
```

### Cards com Cores

```tsx
import { Card, CardContent } from '@/components/ui/card'

// Card padrão
<Card>
  <CardContent>Conteúdo</CardContent>
</Card>

// Card com background muted
<Card className="bg-muted">
  <CardContent>Background secundário</CardContent>
</Card>

// Card com borda colorida
<Card className="border-l-4 border-l-primary">
  <CardContent>Card destacado</CardContent>
</Card>
```

### Badges/Tags

```tsx
// Success badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success text-success-foreground">
  Ativo
</span>

// Warning badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning text-warning-foreground">
  Pendente
</span>

// Destructive badge
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive text-destructive-foreground">
  Inativo
</span>
```

### Mensagens de Status

```tsx
// Success message
<div className="p-4 rounded-md bg-success/10 border border-success/20">
  <p className="text-sm text-success">Operação concluída com sucesso!</p>
</div>

// Warning message
<div className="p-4 rounded-md bg-warning/10 border border-warning/20">
  <p className="text-sm text-warning">Atenção: Revise os dados antes de continuar.</p>
</div>

// Error message
<div className="p-4 rounded-md bg-destructive/10 border border-destructive/20">
  <p className="text-sm text-destructive">Erro ao processar a solicitação.</p>
</div>
```

### Textos Coloridos

```tsx
<p className="text-primary">Texto primário</p>
<p className="text-secondary">Texto secundário</p>
<p className="text-success">Texto de sucesso</p>
<p className="text-warning">Texto de aviso</p>
<p className="text-destructive">Texto de erro</p>
<p className="text-muted-foreground">Texto auxiliar</p>
```

---

## Tabela de Referência Rápida

| Cor         | Classe Tailwind                      | Uso Principal                       |
| ----------- | ------------------------------------ | ----------------------------------- |
| Primary     | `bg-primary` `text-primary`          | Ações principais, links             |
| Secondary   | `bg-secondary` `text-secondary`      | Ações secundárias                   |
| Success     | `bg-success` `text-success`          | Confirmações, sucesso               |
| Warning     | `bg-warning` `text-warning`          | Avisos, alertas                     |
| Destructive | `bg-destructive` `text-destructive`  | Deletar, erros                      |
| Info        | `bg-info` `text-info`                | Informações, mensagens informativas |
| Muted       | `bg-muted` `text-muted-foreground`   | Backgrounds secundários             |
| Accent      | `bg-accent` `text-accent-foreground` | Highlights                          |
| Border      | `border-border`                      | Bordas                              |
| Input       | `border-input`                       | Inputs de formulário                |

---

## Customização

Para alterar as cores, edite o arquivo `src/app/globals.css`:

```css
@layer base {
  :root {
    /* Modifique os valores HSL aqui */
    --primary: 258 90% 66%;
    --secondary: 173 80% 50%;
    --success: 173 80% 50%;
    --info: 217 91% 60%;
    /* ... */
  }
}
```

## Acessibilidade

Todas as combinações de cor/background foram testadas para garantir contraste adequado (WCAG AA):

- ✅ `bg-primary` + `text-primary-foreground` - Contraste 4.5:1+
- ✅ `bg-secondary` + `text-secondary-foreground` - Contraste 4.5:1+
- ✅ `bg-success` + `text-success-foreground` - Contraste 4.5:1+
- ✅ `bg-warning` + `text-warning-foreground` - Contraste 4.5:1+
- ✅ `bg-destructive` + `text-destructive-foreground` - Contraste 4.5:1+
