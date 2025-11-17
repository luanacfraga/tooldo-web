# Weedu Web - Configuração do Projeto

## Visão Geral

Este projeto foi configurado com as seguintes tecnologias:

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilização utilitária
- **shadcn/ui** - Componentes UI prontos e customizáveis
- **Zustand** - Gerenciamento de estado global
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Table** - Tabelas avançadas
- **Recharts** - Gráficos e visualizações
- **js-cookie** - Gerenciamento de cookies

## Estrutura do Projeto

```
weedu-web/
├── src/
│   ├── app/                    # App Router do Next.js 14
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── page.tsx            # Página inicial
│   │   ├── providers.tsx       # Providers (Zustand, etc)
│   │   └── globals.css         # Estilos globais
│   │
│   ├── components/             # Componentes React
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── select.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── label.tsx
│   │   │   └── table.tsx
│   │   │
│   │   ├── layout/             # Componentes de layout
│   │   └── features/           # Componentes por feature
│   │
│   ├── lib/                    # Bibliotecas e utilitários
│   │   ├── api/                # Cliente API e endpoints
│   │   │   ├── api-client.ts   # Cliente HTTP com fetch
│   │   │   ├── types.ts        # Tipos comuns da API
│   │   │   ├── endpoints/      # Endpoints organizados
│   │   │   │   ├── auth.ts
│   │   │   │   ├── plans.ts
│   │   │   │   ├── companies.ts
│   │   │   │   ├── users.ts
│   │   │   │   └── teams.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── stores/             # Zustand stores
│   │   │   ├── auth-store.ts   # Store de autenticação
│   │   │   ├── theme-store.ts  # Store de tema
│   │   │   └── index.ts
│   │   │
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── use-auth.ts     # Hook de autenticação
│   │   │   ├── use-theme.ts    # Hook de tema
│   │   │   └── index.ts
│   │   │
│   │   ├── validators/         # Schemas Zod
│   │   │   ├── auth.ts
│   │   │   ├── plan.ts
│   │   │   ├── company.ts
│   │   │   ├── user.ts
│   │   │   ├── team.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── utils.ts            # Função cn() para classes
│   │   ├── formatters.ts       # Funções de formatação
│   │   └── constants.ts        # Constantes da aplicação
│   │
│   ├── config/                 # Configurações
│   │   ├── env.ts              # Variáveis de ambiente
│   │   └── index.ts            # Config geral
│   │
│   ├── types/                  # Tipos TypeScript globais
│   ├── core/                   # Domínio (entities, use-cases)
│   ├── application/            # Serviços de aplicação
│   └── infrastructure/         # Infraestrutura
│
├── .env.example                # Exemplo de variáveis de ambiente
├── tailwind.config.ts          # Configuração do Tailwind
├── tsconfig.json               # Configuração do TypeScript
└── next.config.js              # Configuração do Next.js
```

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Instalação de Dependências

```bash
npm install
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## Principais Recursos Configurados

### 1. Autenticação

O sistema de autenticação está configurado com:
- Store Zustand para gerenciar estado de autenticação
- Cookies HTTP-only para armazenar tokens
- Hook `useAuth()` para facilitar o uso

```typescript
import { useAuth } from '@/lib/hooks'

function LoginPage() {
  const { login, isLoading, error } = useAuth()

  const handleLogin = async () => {
    await login({ email, password })
  }
}
```

### 2. API Client

Cliente HTTP configurado com:
- Autenticação automática via Bearer token
- Type safety completo
- Tratamento de erros
- Suporte a paginação

```typescript
import { plansApi } from '@/lib/api'

// GET /plans com paginação
const plans = await plansApi.getAll({ page: 1, limit: 10 })

// GET /plans/:id
const plan = await plansApi.getById('123')

// POST /plans
const newPlan = await plansApi.create({ name: 'Pro', price: 99 })
```

### 3. Formulários com Validação

React Hook Form + Zod configurados:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@/lib/validators'

function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = form.handleSubmit(async (data) => {
    await login(data)
  })
}
```

### 4. Componentes UI

Todos os componentes shadcn/ui estão prontos:

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Email" />
        <Button>Enviar</Button>
      </CardContent>
    </Card>
  )
}
```

### 5. Formatação e Utilitários

Funções de formatação prontas:

```typescript
import {
  formatCurrency,
  formatDate,
  formatRole,
  formatPhone
} from '@/lib/formatters'

formatCurrency(9990) // "R$ 99,90"
formatDate(new Date()) // "16/11/2025"
formatRole('admin') // "Administrador"
formatPhone('11999999999') // "(11) 99999-9999"
```

### 6. Tema Dark/Light

Sistema de temas configurado:

```typescript
import { useTheme } from '@/lib/hooks'

function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      Tema atual: {theme}
    </button>
  )
}
```

## Próximos Passos

Agora você pode começar a criar as páginas e componentes da aplicação:

1. **Criar páginas**: Adicione rotas em `src/app/`
2. **Criar componentes**: Adicione em `src/components/features/`
3. **Adicionar endpoints**: Expanda `src/lib/api/endpoints/`
4. **Criar stores**: Adicione novas stores em `src/lib/stores/`

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm run start

# Lint
npm run lint

# Formatação
npm run format
```

## Integração com Backend

O projeto está configurado para se comunicar com a API Weedu. Certifique-se de:

1. A API está rodando em `http://localhost:3000` (ou configure `NEXT_PUBLIC_API_URL`)
2. Os endpoints da API seguem o padrão definido em `src/lib/api/endpoints/`
3. Os tokens JWT são retornados no formato esperado pelo `authApi.login()`

## Suporte

Para problemas ou dúvidas, consulte:
- Documentação do Next.js: https://nextjs.org/docs
- Documentação do shadcn/ui: https://ui.shadcn.com
- Documentação do Zustand: https://zustand-demo.pmnd.rs
