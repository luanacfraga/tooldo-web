# Weedu Web - Front-end

Front-end da plataforma Weedu, construído com Next.js 14 e arquitetura hexagonal.

## Tecnologias

| Categoria | Tecnologia | Versão | Motivo |
|-----------|------------|--------|--------|
| Framework | Next.js | 14.2+ | SSR, SSG, RSC, performance |
| UI | shadcn/ui | - | Componentes prontos e customizáveis |
| Estilos | Tailwind CSS | 3.4+ | Rápido, consistente, fácil tematização |
| Estado Global | Zustand | 5.0+ | Simples e poderoso |
| Formulários | React Hook Form | 7.53+ | Validação, performance |
| Validação | Zod | 3.23+ | Type-safe schema validation |
| API Client | fetch nativo | - | Integração com server actions |
| Tabelas | TanStack Table | 8.20+ | Filtros, paginação, ordenação |
| Charts | Recharts | 2.13+ | Dashboards e visualizações |
| Ícones | Lucide React | - | Ícones modernos e leves |
| Autenticação | JWT + Cookies | - | Padrão profissional seguro |

## Estrutura do Projeto

```
weedu-web/
├── src/
│   ├── app/                      # App Router (Next.js 14)
│   │   ├── layout.tsx           # Layout raiz com providers
│   │   ├── page.tsx             # Página inicial
│   │   ├── login/               # Páginas de login
│   │   ├── dashboard/           # Dashboard principal
│   │   └── [feature]/           # Outras páginas por feature
│   │
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes base (shadcn/ui)
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   └── ...
│   │   ├── layout/              # Componentes de layout
│   │   │   ├── header.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── main-layout.tsx
│   │   ├── features/            # Componentes por feature
│   │   │   ├── auth/            # Autenticação
│   │   │   ├── plans/           # Planos
│   │   │   ├── companies/       # Empresas
│   │   │   ├── teams/           # Equipes
│   │   │   └── users/           # Usuários
│   │   └── providers/           # Providers React
│   │       └── auth-provider.tsx
│   │
│   ├── core/                    # Camada de Domínio (Hexagonal)
│   │   ├── domain/              # Entidades de domínio
│   │   │   ├── user.entity.ts
│   │   │   ├── plan.entity.ts
│   │   │   └── ...
│   │   ├── ports/               # Interfaces/Contratos
│   │   │   ├── user.repository.ts
│   │   │   ├── auth.repository.ts
│   │   │   └── ...
│   │   └── use-cases/           # Casos de uso (interfaces)
│   │
│   ├── application/             # Camada de Aplicação
│   │   └── services/            # Serviços/Use cases
│   │       └── ...
│   │
│   ├── infrastructure/          # Camada de Infraestrutura
│   │   ├── api/                 # Cliente HTTP e repositórios
│   │   │   ├── client.ts        # API Client (fetch wrapper)
│   │   │   ├── auth.repository.impl.ts
│   │   │   └── ...
│   │   └── storage/             # LocalStorage, cookies, etc
│   │
│   ├── lib/                     # Bibliotecas e utilitários
│   │   ├── api/                 # Helpers de API
│   │   ├── hooks/               # Custom hooks
│   │   ├── stores/              # Zustand stores
│   │   │   └── auth.store.ts
│   │   ├── utils/               # Funções utilitárias
│   │   │   └── cn.ts            # Class name merger
│   │   └── validators/          # Schemas Zod
│   │       └── auth.schema.ts
│   │
│   ├── types/                   # TypeScript types e interfaces
│   │   └── index.ts             # Tipos compartilhados
│   │
│   ├── styles/                  # Estilos globais
│   │   └── globals.css          # Tailwind + variáveis CSS
│   │
│   └── config/                  # Configurações
│       └── ...
│
├── public/                      # Assets estáticos
├── .env.example                 # Variáveis de ambiente (exemplo)
├── next.config.js               # Configuração Next.js
├── tailwind.config.ts           # Configuração Tailwind
├── tsconfig.json                # Configuração TypeScript
└── package.json                 # Dependências

```

## Arquitetura Hexagonal

O projeto segue a **Arquitetura Hexagonal** (Ports and Adapters), mesma arquitetura do backend:

### Camadas

1. **Core/Domain** (`src/core/`)
   - **Entidades**: Objetos de domínio com regras de negócio
   - **Ports**: Interfaces que definem contratos
   - **Use Cases**: Interfaces dos casos de uso

2. **Application** (`src/application/`)
   - **Services**: Implementação dos casos de uso
   - Orquestra entidades e repositórios

3. **Infrastructure** (`src/infrastructure/`)
   - **API**: Implementação concreta dos repositórios
   - **Storage**: Gerenciamento de dados locais
   - Adaptadores para serviços externos

4. **Presentation** (`src/app/` e `src/components/`)
   - **App Router**: Rotas e páginas Next.js
   - **Components**: Componentes React
   - **UI**: Componentes base reutilizáveis

### Fluxo de Dados

```
User Interaction → Component → Store (Zustand) → Service → Repository → API
                      ↓                                         ↓
                   UI Update  ←  State Update  ←  Response  ←  Backend
```

## Gerenciamento de Estado

### Zustand

Usado para estado global da aplicação:

- **auth.store.ts**: Estado de autenticação (usuário, login, logout)
- Stores por feature conforme necessário

```typescript
// Exemplo de uso
import { useAuthStore } from '@/lib/stores/auth.store'

function Component() {
  const { user, login, logout } = useAuthStore()
  // ...
}
```

### React Hook Form + Zod

Para formulários locais com validação:

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
})
```

## Sistema de Autenticação

### Fluxo

1. Usuário faz login via `LoginForm`
2. `authRepository.login()` chama API do backend
3. Token JWT é armazenado em cookies (HttpOnly, Secure)
4. `AuthStore` atualiza estado global com dados do usuário
5. `AuthProvider` carrega usuário ao iniciar app
6. Token é enviado automaticamente em todas requisições

### Proteção de Rotas

Implementar middleware Next.js para rotas protegidas:

```typescript
// middleware.ts (criar na raiz)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  // Redirecionar para /login se não autenticado
}
```

## Componentes UI (shadcn/ui)

Componentes base estilizados com Tailwind CSS:

- **Button**: Botões com variantes (default, destructive, outline, etc)
- **Input**: Campos de texto
- **Card**: Containers com header, content, footer
- **Table**: Tabelas estilizadas
- **Form**: Integração com React Hook Form
- **Label**: Labels para formulários
- **Badge**: Tags e status

### Adicionar Novos Componentes

Use o padrão shadcn/ui: copie componentes de [ui.shadcn.com](https://ui.shadcn.com) para `src/components/ui/`

## TanStack Table

Para tabelas complexas com filtros, ordenação e paginação:

```typescript
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
```

Ver exemplo em: `src/app/plans/page.tsx`

## Comunicação com API

### API Client

Cliente HTTP centralizado (`src/infrastructure/api/client.ts`):

```typescript
import { apiClient } from '@/infrastructure/api/client'

// GET
const users = await apiClient.get<User[]>('/users')

// POST
const user = await apiClient.post<User>('/users', data)

// PUT/PATCH/DELETE
await apiClient.put<User>(`/users/${id}`, data)
```

### Repositories

Implementação do padrão Repository:

```typescript
// Interface (Port)
export interface UserRepository {
  findAll(): Promise<User[]>
  create(data: CreateUserDto): Promise<User>
}

// Implementação (Infrastructure)
export class UserRepositoryImpl implements UserRepository {
  async findAll() {
    return apiClient.get<User[]>('/users')
  }
}
```

## Variáveis de Ambiente

Criar `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar produção
npm start

# Linting
npm run lint

# Formatação
npm run format
```

## Padrões de Código

### Importações

Use o alias `@/` para imports:

```typescript
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/stores/auth.store'
```

### Componentes

- **Server Components** por padrão (Next.js 14)
- Use `'use client'` apenas quando necessário (hooks, eventos)
- Prefira composição sobre props complexas

### Nomenclatura

- **Componentes**: PascalCase (`UserCard.tsx`)
- **Arquivos**: kebab-case para utilitários (`auth.store.ts`)
- **Pastas**: kebab-case (`user-profile/`)

## Próximos Passos

1. **Middleware de Autenticação**: Proteger rotas privadas
2. **Error Boundary**: Tratamento de erros global
3. **Loading States**: Skeletons e spinners
4. **Toast Notifications**: Feedback visual de ações
5. **Dark Mode**: Suporte a tema escuro
6. **Testes**: Jest + React Testing Library
7. **E2E**: Playwright ou Cypress

## Integração com Backend

O backend está em `weedu-api/` e roda em `http://localhost:3000`.

Endpoints principais:
- `POST /auth/login` - Autenticação
- `GET /auth/me` - Usuário atual
- `GET /plans` - Lista de planos
- `GET /companies` - Empresas do admin
- etc.

Ver documentação completa em: `http://localhost:3000/api` (Swagger)

## Contribuindo

1. Siga a arquitetura hexagonal
2. Mantenha a separação de camadas
3. Use TypeScript strict mode
4. Valide dados com Zod
5. Documente componentes complexos
# weedu-web
