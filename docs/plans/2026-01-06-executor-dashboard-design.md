# Dashboard do Executor - Design Document

**Data:** 2026-01-06
**Tipo:** Nova Feature
**Prioridade:** Alta

---

## 1. Visão Geral

### Objetivo

Criar um dashboard motivacional para executores acompanharem seu próprio desempenho com contexto da equipe. O dashboard deve focar 70% em métricas pessoais (entregas, metas, progresso) e 30% em contexto da equipe (posição, comparação com média), motivando crescimento individual sem pressão excessiva.

### Usuários-Alvo

- **Executor (Executor)**: Role principal que executa ações
- Precisa visualizar seu próprio desempenho
- Precisa entender progresso em relação a metas
- Precisa contexto de como está vs equipe (sem pressão)
- Precisa ver próximas ações priorizadas para facilitar execução

### Princípios de Design

1. **Foco Individual**: 70% do espaço dedicado a métricas pessoais
2. **Orientado a Ação**: "Próximas Ações" em destaque para facilitar execução
3. **Metas e Progresso**: Mostrar progresso vs meta pessoal
4. **Contexto, não Competição**: Posição na equipe sem ranking completo
5. **Sempre Motivacional**: Mensagens positivas independente do desempenho

---

## 2. Arquitetura da Página

### Estrutura (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ - Título: "Meu Desempenho"                                  │
│ - Filtros: Esta Semana | Este Mês | Últimos 30 Dias        │
│ - Indicador: "Esta Semana vs Semana Passada"               │
└─────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Card 1   │ Card 2   │ Card 3   │ Card 4   │
│ Entregas │ Progresso│ Taxa de  │ Atrasadas│
│ vs Meta  │ da Meta  │ Conclusão│          │
│ 12 / 15  │ 80%      │ 85%      │ 1        │
│ ↑ +3     │ ━━━━━━━  │ ↑ +10%   │ ↓ -2     │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────────────┐
│ Minha Evolução (Gráfico de Linha)                          │
│                                                             │
│     ╱╲      ╱╲                                             │
│    ╱  ╲    ╱  ╲    ╱╲                                     │
│   ╱    ╲  ╱    ╲  ╱  ╲                                    │
│  ╱      ╲╱      ╲╱    ╲                                   │
│ ──────────────────────────────                            │
│ Seg  Ter  Qua  Qui  Sex                                    │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────┬─────────────────────────────┐
│ Minhas Próximas Ações │ Minha Posição na Equipe     │
│                       │                             │
│ 🔴 [Alta] Revisar PR  │ 🏅 Você é #3 de 8          │
│ 🟡 [Média] Testes API │                             │
│ 🟡 [Média] Atualizar  │ 📊 10% acima da média      │
│ 🟢 [Baixa] Docs       │                             │
│ 🟢 [Baixa] Refatorar  │ Continue assim! 💪          │
│                       │                             │
│ Ver todas →           │                             │
└───────────────────────┴─────────────────────────────┘
```

### Hierarquia de Componentes

```
ExecutorDashboardPage
├── PageContainer
│   ├── PageHeader
│   │   ├── Título + Descrição
│   │   └── PeriodFilter (Esta Semana | Este Mês | Últimos 30 Dias)
│   │
│   ├── PeriodIndicator ("Esta Semana vs Semana Passada")
│   │
│   ├── PersonalMetricsCards (grid 4 colunas)
│   │   ├── MetricCardWithComparison (Entregas vs Meta)
│   │   ├── PersonalGoalCard (Progresso da Meta - especial)
│   │   ├── MetricCardWithComparison (Taxa de Conclusão)
│   │   └── MetricCardWithComparison (Atrasadas)
│   │
│   ├── DeliveryTrendChart (Evolução pessoal)
│   │
│   └── Grid 2 colunas
│       ├── MyNextActionsList (Próximas 5 ações)
│       └── TeamPositionCard (Posição e contexto)
```

---

## 3. Componentes Detalhados

### 3.1 PersonalGoalCard (Novo)

**Localização:** `src/components/features/dashboard/executor/personal-goal-card.tsx`

**Props:**
```typescript
interface PersonalGoalCardProps {
  current: number          // Entregas atuais
  goal: number            // Meta do período
  comparison?: {
    absolute: number      // +3 ou -2
    percent: number       // +25% ou -15%
  }
}
```

**Layout:**
```
┌─────────────────────────┐
│ 🎯 Progresso da Meta    │
│                         │
│ 80%                     │
│ ━━━━━━━━━━━━━━━━━━━━   │ ← Barra de progresso
│                         │
│ 12 de 15 entregas       │
│ Faltam 3 para a meta!   │
│                         │
│ ↑ +3 vs período anterior│
└─────────────────────────┘
```

**Comportamento:**
- Barra de progresso visual (ProgressBar component)
- Verde se ≥ 100%, amarelo se 70-99%, vermelho se < 70%
- Mensagens dinâmicas:
  - `>= 100%`: "Meta batida! Parabéns! 🎉"
  - `70-99%`: "Faltam X para a meta!"
  - `< 70%`: "Vamos lá! Escolha uma ação e avance!"

---

### 3.2 MyNextActionsList (Novo)

**Localização:** `src/components/features/dashboard/executor/my-next-actions-list.tsx`

**Props:**
```typescript
interface MyNextActionsListProps {
  actions: Action[]
  maxDisplay?: number // Default: 5
}
```

**Layout:**
```
┌───────────────────────────┐
│ Minhas Próximas Ações     │
│                           │
│ 🔴 [Alta] Revisar PR #123 │
│ 🟡 [Média] Testes da API  │
│ 🟡 [Média] Atualizar docs │
│ 🟢 [Baixa] Refatorar X    │
│ 🟢 [Baixa] Code review    │
│                           │
│ Ver todas (12) →          │
└───────────────────────────┘
```

**Comportamento:**
- Lista ordenada por: `isLate DESC, priority DESC, estimatedEndDate ASC`
- Cores de prioridade:
  - 🔴 Alta: text-destructive
  - 🟡 Média: text-warning
  - 🟢 Baixa: text-success
- Click na ação: navega para `/actions/{actionId}`
- Link "Ver todas" navega para `/actions` com filtro `responsibleId=executorId`

---

### 3.3 TeamPositionCard (Novo)

**Localização:** `src/components/features/dashboard/executor/team-position-card.tsx`

**Props:**
```typescript
interface TeamPositionCardProps {
  position: number        // 3
  totalMembers: number    // 8
  percentDiff: number     // +10 ou -5 (% vs média)
  isAboveAverage: boolean
}
```

**Layout:**
```
┌─────────────────────────┐
│ Minha Posição na Equipe │
│                         │
│ 🏅 Você é #3 de 8      │
│                         │
│ 📊 10% acima da média  │
│                         │
│ Continue assim! 💪      │
└─────────────────────────┘
```

**Lógica de Mensagens:**

```typescript
function getMotivationalMessage(percentDiff: number): string {
  if (percentDiff >= 10) {
    return 'Continue assim! Você está arrasando! 💪'
  }
  if (percentDiff >= 0) {
    return 'Você está no ritmo da equipe! 👏'
  }
  if (percentDiff >= -10) {
    return 'Bom trabalho! Mantenha o foco! 🎯'
  }
  return 'Vamos retomar o ritmo! Você consegue! 🚀'
}
```

**Ícone de Ranking:**
- Se position <= 3: Mostrar emoji de medalha 🏅
- Senão: Mostrar número normal

**Privacidade:**
- NÃO mostra ranking completo
- NÃO mostra nomes de outros membros
- Apenas: posição, total, comparação com média

---

### 3.4 PersonalMetricsCards (Novo)

**Localização:** `src/components/features/dashboard/executor/personal-metrics-cards.tsx`

**Props:**
```typescript
interface PersonalMetricsCardsProps {
  metrics: ExecutorMetrics
}

interface ExecutorMetrics {
  // Atual
  totalDeliveries: number
  goal: number
  completionRate: number
  late: number

  // Comparativos
  deliveriesChange: number
  deliveriesChangePercent: number
  completionRateChange: number
  lateChange: number
}
```

**Renderiza 4 cards:**
1. **Entregas vs Meta** (MetricCardWithComparison customizado)
2. **Progresso da Meta** (PersonalGoalCard)
3. **Taxa de Conclusão** (MetricCardWithComparison)
4. **Atrasadas** (MetricCardWithComparison com inversão)

---

## 4. Lógica de Dados

### 4.1 Estrutura de Dados

**ExecutorMetrics**:
```typescript
interface ExecutorMetrics {
  // Identificação
  userId: string

  // Métricas do período atual
  totalDeliveries: number        // Ações DONE
  goal: number                   // Meta do período (semanal/mensal)
  goalProgress: number           // (deliveries / goal) * 100
  completionRate: number         // (DONE / TOTAL) * 100
  inProgress: number             // Ações IN_PROGRESS
  late: number                   // Ações isLate
  totalActions: number           // Total de ações

  // Comparativos com período anterior
  deliveriesChange: number       // +3 ou -2
  deliveriesChangePercent: number // +25% ou -15%
  completionRateChange: number   // +10 ou -5 (pontos percentuais)
  lateChange: number             // +1 ou -2

  // Contexto da equipe
  teamPosition: number           // 3 (posição no ranking)
  totalTeamMembers: number       // 8
  teamAvgDeliveries: number      // 10
  percentVsAverage: number       // +20% ou -10%
  isAboveAverage: boolean
}
```

**NextAction**:
```typescript
interface NextAction {
  id: string
  title: string
  priority: ActionPriority
  isLate: boolean
  estimatedEndDate: Date | null
}
```

---

### 4.2 Cálculo de Métricas

**Função:** `calculateExecutorMetrics()`

```typescript
function calculateExecutorMetrics(
  currentActions: Action[],
  previousActions: Action[],
  teamActions: Action[],
  teamMembers: User[],
  executorId: string,
  preset: DatePreset
): ExecutorMetrics {
  // Filtrar ações do executor
  const myCurrentActions = currentActions.filter(a => a.responsibleId === executorId)
  const myPreviousActions = previousActions.filter(a => a.responsibleId === executorId)

  // Métricas atuais
  const totalDeliveries = myCurrentActions.filter(a => a.status === 'DONE').length
  const totalActions = myCurrentActions.length
  const completionRate = totalActions > 0 ? (totalDeliveries / totalActions) * 100 : 0
  const late = myCurrentActions.filter(a => a.isLate).length
  const inProgress = myCurrentActions.filter(a => a.status === 'IN_PROGRESS').length

  // Meta (buscar de settings ou usar padrão)
  const goal = getGoalForPreset(executorId, preset) // 15/semana, 60/mês
  const goalProgress = (totalDeliveries / goal) * 100

  // Comparativos
  const previousDeliveries = myPreviousActions.filter(a => a.status === 'DONE').length
  const deliveriesChange = totalDeliveries - previousDeliveries
  const deliveriesChangePercent = previousDeliveries > 0
    ? ((totalDeliveries - previousDeliveries) / previousDeliveries) * 100
    : totalDeliveries > 0 ? 100 : 0

  // Contexto da equipe
  const teamMetrics = calculateTeamPositionMetrics(
    teamActions,
    teamMembers,
    executorId
  )

  return {
    userId: executorId,
    totalDeliveries,
    goal,
    goalProgress,
    completionRate,
    inProgress,
    late,
    totalActions,
    deliveriesChange,
    deliveriesChangePercent,
    completionRateChange: /* calcular */,
    lateChange: /* calcular */,
    ...teamMetrics
  }
}
```

**Função:** `calculateTeamPositionMetrics()`

```typescript
function calculateTeamPositionMetrics(
  teamActions: Action[],
  teamMembers: User[],
  executorId: string
): TeamPositionMetrics {
  // Contar entregas por membro
  const memberDeliveries = teamMembers.map(member => ({
    userId: member.id,
    deliveries: teamActions.filter(
      a => a.responsibleId === member.id && a.status === 'DONE'
    ).length
  }))

  // Ordenar por entregas (desc)
  memberDeliveries.sort((a, b) => b.deliveries - a.deliveries)

  // Encontrar posição do executor
  const teamPosition = memberDeliveries.findIndex(m => m.userId === executorId) + 1

  // Calcular média da equipe
  const teamAvgDeliveries = memberDeliveries.reduce((sum, m) => sum + m.deliveries, 0) / teamMembers.length

  // Comparação percentual
  const myDeliveries = memberDeliveries.find(m => m.userId === executorId)?.deliveries || 0
  const percentVsAverage = teamAvgDeliveries > 0
    ? ((myDeliveries - teamAvgDeliveries) / teamAvgDeliveries) * 100
    : 0

  return {
    teamPosition,
    totalTeamMembers: teamMembers.length,
    teamAvgDeliveries: Math.round(teamAvgDeliveries),
    percentVsAverage: Math.round(percentVsAverage),
    isAboveAverage: percentVsAverage >= 0
  }
}
```

---

### 4.3 Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário seleciona período → "Esta Semana"               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Hook calcula datas usando date-presets.ts               │
│    - Período atual: 2026-01-05 a 2026-01-11                │
│    - Período anterior: 2025-12-29 a 2026-01-04             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Faz 3 chamadas paralelas à API                          │
│    GET /actions?responsibleId=X&dateFrom=...&dateTo=...    │
│    GET /actions?responsibleId=X&dateFrom=...&dateTo=...    │
│    GET /actions?teamId=Y&dateFrom=...&dateTo=...           │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Processa dados no frontend                              │
│    - Calcula métricas pessoais (entregas, meta, taxa)      │
│    - Calcula comparativos (atual vs anterior)              │
│    - Calcula posição na equipe (ranking, % vs média)       │
│    - Ordena próximas ações (late, priority, date)          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Renderiza componentes                                   │
│    - Cards de métricas com comparativos                    │
│    - Gráfico de evolução pessoal                           │
│    - Lista de próximas ações                               │
│    - Card de posição na equipe                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Integração com Backend

### 5.1 Endpoints Utilizados

**Buscar minhas ações (período atual)**:
```
GET /actions?responsibleId={executorId}&dateFrom={dateFrom}&dateTo={dateTo}&dateFilterType=createdAt&limit=1000
```

**Buscar minhas ações (período anterior)**:
```
GET /actions?responsibleId={executorId}&dateFrom={dateFromPrevious}&dateTo={dateToPrevious}&dateFilterType=createdAt&limit=1000
```

**Buscar ações da equipe (para comparação)**:
```
GET /actions?teamId={teamId}&dateFrom={dateFrom}&dateTo={dateTo}&dateFilterType=createdAt&limit=1000
```

**Buscar próximas ações**:
```
GET /actions?responsibleId={executorId}&status=TODO,IN_PROGRESS&page=1&limit=5
```

**Notas:**
- Backend já suporta esses filtros (implementados anteriormente)
- `limit=1000`: Alto o suficiente para pegar todas as ações
- Próximas ações: ordenação já é feita pelo backend (late, priority, date)

### 5.2 Configuração de Metas

**Novos campos em User Settings** (TODO: Backend):
```typescript
interface UserSettings {
  weeklyGoal: number    // Default: 15
  monthlyGoal: number   // Default: 60
}
```

**Endpoints necessários** (TODO):
```
GET /users/me/settings
PUT /users/me/settings { weeklyGoal: 20 }
```

---

### 5.3 Hook Customizado

**Localização:** `src/lib/hooks/use-executor-metrics.ts`

```typescript
export function useExecutorMetrics(executorId: string, preset: DatePreset) {
  const currentPeriod = getPresetRange(preset)
  const previousPeriod = getPreviousPeriod(preset)

  // Buscar minhas ações (atual)
  const myCurrentQuery = useActions({
    responsibleId: executorId,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: 'createdAt',
    limit: 1000,
  })

  // Buscar minhas ações (anterior)
  const myPreviousQuery = useActions({
    responsibleId: executorId,
    dateFrom: previousPeriod.dateFrom,
    dateTo: previousPeriod.dateTo,
    dateFilterType: 'createdAt',
    limit: 1000,
  })

  // Buscar ações da equipe
  const teamQuery = useActions({
    teamId: /* TODO: obter teamId do executor */,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: 'createdAt',
    limit: 1000,
  })

  // Buscar próximas ações
  const nextActionsQuery = useActions({
    responsibleId: executorId,
    status: [ActionStatus.TODO, ActionStatus.IN_PROGRESS],
    page: 1,
    limit: 5,
  })

  // Processar métricas
  const metrics = useMemo(() => {
    if (!myCurrentQuery.data || !myPreviousQuery.data || !teamQuery.data) {
      return null
    }

    return calculateExecutorMetrics(
      myCurrentQuery.data.data,
      myPreviousQuery.data.data,
      teamQuery.data.data,
      teamMembers, // TODO: buscar membros da equipe
      executorId,
      preset
    )
  }, [myCurrentQuery.data, myPreviousQuery.data, teamQuery.data])

  return {
    metrics,
    nextActions: nextActionsQuery.data?.data || [],
    isLoading: myCurrentQuery.isLoading || myPreviousQuery.isLoading || teamQuery.isLoading,
    error: myCurrentQuery.error || myPreviousQuery.error || teamQuery.error,
  }
}
```

---

## 6. Design System e UI/UX

### 6.1 Cores Semânticas (conforme design-system.md)

- **Verde (success)**: Melhora, meta batida, acima da média
- **Vermelho (destructive)**: Piora, atrasadas, abaixo da meta
- **Amarelo (warning)**: Atenção, prioridade média, próximo da meta
- **Roxo (primary)**: Ações principais, destaques
- **Azul (info)**: Informações neutras
- **Cinza (muted)**: Secundário, sem mudança

### 6.2 Ícones (seguindo diretrizes)

**Quando usar:**
- 🎯 Target: Meta/objetivo
- 🏅 Medal: Top 3 no ranking
- 📊 Chart: Comparação com média
- 💪 Flex: Mensagem motivacional positiva
- 🚀 Rocket: Mensagem de incentivo
- 🔴🟡🟢 Círculos coloridos: Prioridade de ações

**Quando NÃO usar:**
- Não adicionar ícones redundantes em todos os cards
- Apenas onde adicionam significado ou facilitam escaneamento visual

### 6.3 Responsividade

**Mobile (<640px)**:
- Cards empilhados verticalmente (1 coluna)
- Gráfico de evolução com scroll horizontal se necessário
- "Próximas Ações" e "Posição na Equipe" empilhados
- Filtros em dropdown ou stack vertical

**Tablet (640px - 1024px)**:
- Cards em 2 colunas
- Gráfico full-width
- Grid de 2 colunas para listas

**Desktop (>1024px)**:
- Cards em 4 colunas
- Gráfico full-width
- Grid 2 colunas (70/30) para listas + posição

### 6.4 Estados de Loading

1. **Skeleton nos cards**: Placeholder cinza animado
2. **Spinner no gráfico**: Spinner centralizado
3. **Skeleton na lista de ações**: 3-5 linhas placeholder

### 6.5 Estados Vazios

1. **Sem ações no período**:
   - Ícone: Sparkles
   - Mensagem: "Nenhuma ação neste período. Comece agora!"
   - Botão: "Nova Ação"

2. **Sem próximas ações**:
   - Ícone: CheckSquare
   - Mensagem: "Tudo concluído! Que tal criar novas ações?"
   - Botão: "Ver Backlog"

3. **Sem equipe**:
   - Não mostra card de posição
   - Mostra apenas métricas pessoais

---

## 7. Estrutura de Arquivos

```
src/
├── components/
│   ├── features/
│   │   └── dashboard/
│   │       ├── executor/
│   │       │   ├── executor-dashboard.tsx          # Componente principal
│   │       │   ├── personal-metrics-cards.tsx      # Grid de 4 cards
│   │       │   ├── personal-goal-card.tsx          # Card especial da meta
│   │       │   ├── my-next-actions-list.tsx        # Lista de próximas ações
│   │       │   └── team-position-card.tsx          # Card de posição na equipe
│   │       └── shared/
│   │           ├── metric-card-with-comparison.tsx # (já existe)
│   │           ├── period-filter.tsx               # (já existe)
│   │           ├── period-indicator.tsx            # (já existe)
│   │           └── delivery-trend-chart.tsx        # (reutilizar, adaptar)
│   └── ui/
│       └── (componentes shadcn/ui existentes)
│
├── lib/
│   ├── hooks/
│   │   └── use-executor-metrics.ts                # Hook para métricas do executor
│   ├── utils/
│   │   ├── executor-metrics-calculator.ts         # Funções de cálculo
│   │   ├── goal-manager.ts                        # Lógica de metas
│   │   ├── date-presets.ts                        # (já existe)
│   │   └── period-comparator.ts                   # (já existe)
│   └── types/
│       └── executor-dashboard.ts                   # Types do dashboard
│
└── app/
    └── (protected)/
        └── companies/
            └── [companyId]/
                └── dashboard/
                    └── executor/
                        └── page.tsx                # Página do dashboard do executor
```

---

## 8. Ordem de Implementação

### Fase 1: Fundação (Tarefas 1-2)

**Tarefa 1: Criar utilidades e types**
- `src/lib/types/executor-dashboard.ts`: Definir interfaces (ExecutorMetrics, NextAction, TeamPositionMetrics)
- `src/lib/utils/executor-metrics-calculator.ts`: Funções de cálculo de métricas pessoais e posição
- `src/lib/utils/goal-manager.ts`: Lógica de metas (getGoalForPreset, default goals)

**Tarefa 2: Hook de dados**
- `src/lib/hooks/use-executor-metrics.ts`: Hook para buscar e processar métricas
- 3 chamadas paralelas (minhas ações atual/anterior + equipe)
- Integrar com `useActions` existente

### Fase 2: Componentes Novos (Tarefas 3-6)

**Tarefa 3: PersonalGoalCard**
- Card especial com barra de progresso da meta
- Mensagens dinâmicas baseadas em % da meta
- Cores verde/amarelo/vermelho

**Tarefa 4: MyNextActionsList**
- Lista de próximas 5 ações
- Ordenação por late → priority → date
- Cores de prioridade (vermelho/amarelo/verde)
- Link "Ver todas"

**Tarefa 5: TeamPositionCard**
- Card com posição (#3 de 8)
- Comparação com média (+10% acima)
- Mensagem motivacional dinâmica
- Emoji de medalha se Top 3

**Tarefa 6: PersonalMetricsCards**
- Grid de 4 cards
- Reutilizar MetricCardWithComparison
- Integrar PersonalGoalCard
- Comparativos com período anterior

### Fase 3: Integração (Tarefas 7-9)

**Tarefa 7: Adaptar DeliveryTrendChart**
- Reutilizar componente do manager dashboard
- Adaptar para dados individuais (não de equipe)
- Mesmo estilo visual

**Tarefa 8: Página do dashboard**
- `src/app/(protected)/companies/[companyId]/dashboard/executor/page.tsx`
- Orquestrar todos os componentes
- Estados de loading e erro
- Responsividade

**Tarefa 9: Configuração de metas (Settings)**
- Tela de configuração para definir metas personalizadas
- Input para weeklyGoal e monthlyGoal
- Persistência no backend (TODO: criar endpoint)

### Fase 4: Testes (Tarefa 10)

**Tarefa 10: Testes manuais e ajustes**
- Testar filtros de período
- Verificar cálculos de métricas
- Validar comparativos
- Testar mensagens motivacionais
- Verificar responsividade
- Ajustar cores e espaçamentos

---

## 9. Bibliotecas e Dependências

### Necessárias

- **recharts**: Gráfico de evolução (já instalado no manager dashboard)

### Já Disponíveis (Reutilizar)

- **shadcn/ui**: Button, Card, Badge, ProgressBar
- **lucide-react**: Ícones
- **tailwindcss**: Estilização
- **react-query**: Chamadas à API (`useActions`)
- **date-presets.ts**: Filtros de período
- **period-comparator.ts**: Comparação de períodos

---

## 10. Métricas de Sucesso

### KPIs Técnicos

- ✅ Tempo de carregamento < 2s
- ✅ Responsivo em todos os tamanhos de tela
- ✅ Cálculos de métricas precisos
- ✅ Comparativos corretos entre períodos
- ✅ Posição na equipe calculada corretamente

### KPIs de UX

- ✅ Executor consegue ver progresso da meta em < 3s
- ✅ Executor consegue identificar próximas ações rapidamente
- ✅ Mensagens motivacionais são sempre positivas
- ✅ Comparação com equipe é sutil (não cria pressão)

### KPIs de Negócio

- ✅ Aumento no engajamento de executores com a plataforma
- ✅ Aumento na taxa de conclusão de ações
- ✅ Redução de ações atrasadas
- ✅ Executores sentem-se motivados (não pressionados)

---

## 11. Próximos Passos (Futuro)

### Gamificação Avançada

- Badges de conquistas (ex: "5 dias seguidos entregando")
- Streaks (dias consecutivos com entregas)
- Níveis (Bronze, Prata, Ouro) baseados em desempenho
- Histórico de conquistas

### Metas Personalizadas

- Definir metas diferentes por período
- Metas progressivas (aumentar gradualmente)
- Sugestão de metas baseadas em desempenho histórico

### Comparação com Si Mesmo

- "Você está 20% melhor que há 3 meses"
- Gráfico de evolução de longo prazo (trimestral, anual)
- Tendências de crescimento

### Notificações Motivacionais

- "Faltam 2 entregas para bater sua meta semanal!"
- "Você está no Top 3 da equipe! Continue!"
- "Parabéns! Meta batida! 🎉"

---

## 12. Considerações de Segurança

1. **Autorização**: Verificar que usuário tem role `executor` e pertence à equipe
2. **Dados Privados**: Executor só vê suas próprias ações e contexto agregado da equipe (não ações individuais de outros)
3. **Validação**: Validar executorId e teamId no backend
4. **Rate Limiting**: Cache para evitar muitas chamadas à API

---

## 13. Notas de Implementação

### YAGNI Aplicado
- Não construir sistema completo de gamificação (apenas posição e comparação)
- Não criar configuração de metas complexas (apenas valores simples)
- Não implementar notificações (pode vir depois)
- Não mostrar ranking completo da equipe (apenas posição do executor)

### DRY Aplicado
- Reutilizar `date-presets.ts`, `period-comparator.ts` do manager dashboard
- Reutilizar `MetricCardWithComparison`, `PeriodFilter`, `PeriodIndicator`
- Reutilizar `DeliveryTrendChart` (adaptar para dados individuais)
- Reutilizar lógica de cálculo de métricas (extrair funções comuns)

### Acessibilidade
- Labels descritivos em gráficos
- Cores com contraste adequado (WCAG AA)
- Mensagens sempre visíveis (não só em hover)
- Navegação por teclado em listas de ações

---

## 14. Diferenças com Manager Dashboard

| Aspecto | Manager Dashboard | Executor Dashboard |
|---------|-------------------|-------------------|
| **Foco** | Equipe inteira | Individual (70%) + Contexto equipe (30%) |
| **Métricas** | Agregadas da equipe | Pessoais + comparação com média |
| **Ranking** | Top 5 completo com nomes | Apenas posição própria |
| **Ações** | Não tem lista de ações | "Próximas Ações" em destaque |
| **Metas** | Não tem | Progresso vs meta pessoal |
| **Mensagens** | Neutras | Sempre motivacionais |
| **Gráfico** | Entregas da equipe | Evolução pessoal |

---

## Aprovações

- [x] Design revisado e aprovado
- [ ] Implementação pendente
- [ ] Testes pendentes
- [ ] Deploy pendente

**Data de Aprovação:** 2026-01-06
**Próximo Passo:** Criar plano de implementação detalhado
