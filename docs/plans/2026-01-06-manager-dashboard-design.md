# Dashboard do Gestor - Design Document

**Data:** 2026-01-06
**Tipo:** Nova Feature
**Prioridade:** Alta

---

## 1. Visão Geral

### Objetivo

Criar um dashboard motivacional para gestores acompanharem o desempenho da equipe com foco em entregas. O dashboard deve promover competição saudável através de rankings, mostrar tendências de progresso e fornecer comparativos entre períodos para evidenciar melhorias.

### Usuários-Alvo

- **Gestor (Manager)**: Role principal que gerencia uma ou mais equipes
- Precisa visualizar desempenho individual dos membros
- Precisa identificar top performers e quem precisa de suporte
- Precisa acompanhar evolução ao longo do tempo

### Princípios de Design

1. **Foco em Entregas**: Métricas centradas em conclusão de ações
2. **Gamificação Saudável**: Ranking e comparativos que motivam sem pressionar excessivamente
3. **Comparação Temporal**: Mostrar progresso vs período anterior
4. **Ação Imediata**: Links diretos para resolver problemas (atrasadas, bloqueadas)
5. **Clareza Visual**: Cards, gráficos e cores semânticas para rápida compreensão

---

## 2. Arquitetura da Página

### Estrutura (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────┐
│ Header com Filtros                                          │
│ - Título: "Dashboard da Equipe"                             │
│ - Filtros: Esta Semana | Este Mês | Últimos 30 Dias        │
│ - Filtro de equipe (se gestor gerencia múltiplas)          │
│ - Indicador: "Esta Semana vs Semana Passada"               │
└─────────────────────────────────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Card 1   │ Card 2   │ Card 3   │ Card 4   │
│ Total    │ Taxa de  │ Velocid. │ Atrasadas│
│ Entregas │ Conclusão│ Média    │          │
│ 45       │ 78%      │ 12/sem   │ 3        │
│ ↑ +15%   │ ↑ +5%    │ ↑ +2     │ ↓ -2     │
└──────────┴──────────┴──────────┴──────────┘

┌───────────────────────┬─────────────────────────────┐
│ Ranking da Equipe     │ Tendência de Entregas       │
│                       │                             │
│ 1. João Silva    🏆   │     ╱╲                      │
│    ████████████ 24    │    ╱  ╲    ╱╲              │
│ 2. Maria Santos       │   ╱    ╲  ╱  ╲             │
│    ██████████ 18      │  ╱      ╲╱    ╲            │
│ 3. Pedro Costa        │ ╱                ╲         │
│    ████████ 12        │───────────────────────────  │
│                       │ Sem1 Sem2 Sem3 Sem4         │
│ Ver toda equipe →     │                             │
└───────────────────────┴─────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Detalhes da Equipe                                          │
│ ┌─────────┬──────────┬──────────┬─────────┬─────────┐      │
│ │ Membro  │ Entregas │ Taxa %   │ Andamen.│ Atrasad.│      │
│ ├─────────┼──────────┼──────────┼─────────┼─────────┤      │
│ │ 👤 João │    24    │   95%    │    2    │    0    │      │
│ │ 👤 Maria│    18    │   85%    │    3    │    1    │      │
│ │ 👤 Pedro│    12    │   70%    │    1    │    2    │      │
│ └─────────┴──────────┴──────────┴─────────┴─────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Hierarquia de Componentes

```
ManagerDashboardPage
├── PageContainer
│   ├── PageHeader
│   │   ├── Título + Descrição
│   │   └── PeriodFilter (Esta Semana | Este Mês | Últimos 30 Dias)
│   │
│   ├── PeriodIndicator ("Esta Semana vs Semana Passada")
│   │
│   ├── TeamMetricsCards (grid 4 colunas)
│   │   ├── MetricCardWithComparison (Total Entregas)
│   │   ├── MetricCardWithComparison (Taxa de Conclusão)
│   │   ├── MetricCardWithComparison (Velocidade Média)
│   │   └── MetricCardWithComparison (Ações Atrasadas)
│   │
│   ├── Grid 2 colunas
│   │   ├── TeamRankingChart (Gráfico de Barras)
│   │   └── DeliveryTrendChart (Gráfico de Linha)
│   │
│   └── TeamDetailsTable (Tabela completa)
```

---

## 3. Componentes Detalhados

### 3.1 PeriodFilter

**Localização:** `src/components/features/dashboard/shared/period-filter.tsx`

**Props:**
```typescript
interface PeriodFilterProps {
  selected: DatePreset
  onChange: (preset: DatePreset) => void
}
```

**Comportamento:**
- Botões para "Esta Semana", "Este Mês", "Últimos 30 Dias"
- Reutiliza `date-presets.ts` criado anteriormente
- Botão ativo com destaque visual (bg-primary)
- Ao mudar filtro, dispara onChange com novo preset

**Design:**
```tsx
<div className="flex gap-2">
  <Button variant={selected === 'esta-semana' ? 'default' : 'outline'}>
    Esta Semana
  </Button>
  <Button variant={selected === 'este-mes' ? 'default' : 'outline'}>
    Este Mês
  </Button>
  <Button variant={selected === 'ultimos-30-dias' ? 'default' : 'outline'}>
    Últimos 30 Dias
  </Button>
</div>
```

---

### 3.2 MetricCardWithComparison

**Localização:** `src/components/features/dashboard/shared/metric-card-with-comparison.tsx`

**Props:**
```typescript
interface MetricCardWithComparisonProps {
  title: string
  value: number | string
  comparison?: {
    absolute: number      // +15 ou -3
    percent: number       // +50 ou -20
    isImprovement: boolean // true = verde, false = vermelho
  }
  icon?: React.ComponentType
  iconColor?: string
  bgColor?: string
}
```

**Layout:**
```
┌─────────────────────────┐
│ 📊 Total de Entregas    │
│                         │
│ 45                      │
│                         │
│ ↑ +15 (+50%)            │ ← Verde se melhora
│ vs período anterior     │
└─────────────────────────┘
```

**Lógica de Cores:**
- Verde (text-success): Melhora
- Vermelho (text-destructive): Piora
- Cinza (text-muted-foreground): Sem mudança
- **Exceção**: Para "Atrasadas", menos é melhor (inverter cores)

---

### 3.3 TeamRankingChart

**Localização:** `src/components/features/dashboard/manager/team-ranking-chart.tsx`

**Props:**
```typescript
interface TeamRankingChartProps {
  members: Array<{
    userId: string
    name: string
    avatar?: string
    totalDeliveries: number
  }>
  maxDisplay?: number // Default: 5 (Top 5)
}
```

**Design:**
- Gráfico de barras horizontal
- Ordenado por `totalDeliveries` (descrescente)
- Badge especial para #1 (🏆 ou ícone Trophy)
- Cores das barras baseadas no volume:
  - Top 1: primary
  - Top 2-3: info
  - Demais: muted
- Link "Ver toda equipe" no rodapé (abre modal ou expande)

**Biblioteca:** Recharts ou Chart.js

**Exemplo de Dados:**
```tsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={sortedMembers} layout="vertical">
    <XAxis type="number" />
    <YAxis dataKey="name" type="category" width={120} />
    <Bar dataKey="totalDeliveries" fill="hsl(var(--primary))" />
  </BarChart>
</ResponsiveContainer>
```

---

### 3.4 DeliveryTrendChart

**Localização:** `src/components/features/dashboard/manager/delivery-trend-chart.tsx`

**Props:**
```typescript
interface DeliveryTrendChartProps {
  data: Array<{
    date: string       // ISO date
    deliveries: number
  }>
  highlightPeriod?: {
    start: string
    end: string
  }
}
```

**Design:**
- Gráfico de linha mostrando entregas ao longo do tempo
- Área sombreada para o período selecionado
- Tooltip ao passar mouse (data + quantidade)
- Eixo X: datas
- Eixo Y: número de entregas

**Granularidade baseada no filtro:**
- "Esta Semana": 7 pontos (um por dia)
- "Este Mês": 4 pontos (uma por semana) ou 30 pontos (um por dia)
- "Últimos 30 Dias": 30 pontos (um por dia)

---

### 3.5 TeamDetailsTable

**Localização:** `src/components/features/dashboard/manager/team-details-table.tsx`

**Props:**
```typescript
interface TeamDetailsTableProps {
  members: TeamMemberMetrics[]
  onMemberClick?: (userId: string) => void
}

interface TeamMemberMetrics {
  userId: string
  name: string
  avatar?: string
  totalDeliveries: number
  completionRate: number
  inProgress: number
  late: number
}
```

**Colunas:**
1. Membro (avatar + nome)
2. Entregas (número)
3. Taxa de Conclusão (%)
4. Em Andamento (número)
5. Atrasadas (número com alerta se > 0)

**Funcionalidades:**
- Ordenável por qualquer coluna (click no header)
- Click na linha abre modal com detalhes do membro
- Responsiva: em mobile, cada linha vira um card

**Design:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead onClick={() => sort('name')}>Membro</TableHead>
      <TableHead onClick={() => sort('deliveries')}>Entregas</TableHead>
      <TableHead onClick={() => sort('rate')}>Taxa %</TableHead>
      <TableHead onClick={() => sort('inProgress')}>Andamento</TableHead>
      <TableHead onClick={() => sort('late')}>Atrasadas</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {members.map(member => (
      <TableRow key={member.userId} onClick={() => onMemberClick(member.userId)}>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar>{member.avatar}</Avatar>
            {member.name}
          </div>
        </TableCell>
        <TableCell>{member.totalDeliveries}</TableCell>
        <TableCell>{member.completionRate}%</TableCell>
        <TableCell>{member.inProgress}</TableCell>
        <TableCell>
          {member.late > 0 ? (
            <Badge variant="destructive">{member.late}</Badge>
          ) : (
            member.late
          )}
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## 4. Lógica de Dados

### 4.1 Estrutura de Dados

**TeamMemberMetrics**:
```typescript
interface TeamMemberMetrics {
  // Identificação
  userId: string
  name: string
  avatar?: string

  // Métricas do período atual
  totalDeliveries: number        // Ações com status DONE
  completionRate: number         // (DONE / TOTAL) * 100
  inProgress: number             // Ações IN_PROGRESS
  late: number                   // Ações atrasadas (isLate = true)
  avgDaysToComplete: number      // Média de dias para concluir

  // Comparativos com período anterior
  deliveriesChange: number       // +15 ou -3 (diferença absoluta)
  deliveriesChangePercent: number // +50% ou -20%
  completionRateChange: number   // +5 ou -10 (pontos percentuais)
}
```

**TeamMetrics** (agregado):
```typescript
interface TeamMetrics {
  // Período atual
  totalDeliveries: number
  avgCompletionRate: number
  velocity: number               // ações/semana ou ações/mês
  totalLate: number
  totalMembers: number

  // Comparativos
  deliveriesChange: number
  deliveriesChangePercent: number
  velocityChange: number
  completionRateChange: number
}
```

---

### 4.2 Cálculo de Métricas

**Função:** `calculateTeamMetrics(actions: Action[], teamMembers: User[]): TeamMemberMetrics[]`

**Lógica:**

```typescript
function calculateTeamMetrics(
  currentPeriodActions: Action[],
  previousPeriodActions: Action[],
  teamMembers: User[]
): TeamMemberMetrics[] {
  return teamMembers.map(member => {
    // Ações do membro no período atual
    const currentActions = currentPeriodActions.filter(
      a => a.responsibleId === member.id
    )

    // Ações do membro no período anterior
    const previousActions = previousPeriodActions.filter(
      a => a.responsibleId === member.id
    )

    // Métricas atuais
    const totalDeliveries = currentActions.filter(a => a.status === 'DONE').length
    const total = currentActions.length
    const completionRate = total > 0 ? (totalDeliveries / total) * 100 : 0
    const inProgress = currentActions.filter(a => a.status === 'IN_PROGRESS').length
    const late = currentActions.filter(a => a.isLate).length

    // Métricas anteriores
    const previousDeliveries = previousActions.filter(a => a.status === 'DONE').length

    // Comparativos
    const deliveriesChange = totalDeliveries - previousDeliveries
    const deliveriesChangePercent = previousDeliveries > 0
      ? ((totalDeliveries - previousDeliveries) / previousDeliveries) * 100
      : totalDeliveries > 0 ? 100 : 0

    return {
      userId: member.id,
      name: member.name,
      avatar: member.avatar,
      totalDeliveries,
      completionRate,
      inProgress,
      late,
      deliveriesChange,
      deliveriesChangePercent,
      completionRateChange: 0, // TODO: calcular
    }
  })
}
```

**Edge Cases:**
1. **Período anterior = 0, atual > 0**: Mostrar "Novo!" ou badge especial
2. **Período anterior > 0, atual = 0**: Mostrar -100%
3. **Ambos = 0**: Não mostrar comparativo (ou mostrar "—")
4. **Divisão por zero**: Tratar com ternário

---

### 4.3 Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário seleciona período → "Esta Semana"               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Dashboard calcula datas usando date-presets.ts          │
│    - Período atual: 2026-01-05 a 2026-01-11                │
│    - Período anterior: 2025-12-29 a 2026-01-04             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Faz 2 chamadas paralelas à API                          │
│    GET /actions?teamId=X&dateFrom=...&dateTo=...&limit=1000│
│    GET /actions?teamId=X&dateFrom=...&dateTo=...&limit=1000│
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Processa dados no frontend                              │
│    - Agrupa por responsibleId                              │
│    - Calcula métricas individuais                          │
│    - Calcula métricas totais da equipe                     │
│    - Calcula comparativos (atual vs anterior)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Renderiza componentes                                   │
│    - Cards de métricas com comparativos                    │
│    - Gráfico de ranking ordenado                           │
│    - Gráfico de tendência                                  │
│    - Tabela detalhada                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Integração com Backend

### 5.1 Endpoints Utilizados

**Buscar ações da equipe (período atual)**:
```
GET /actions?teamId={teamId}&dateFrom={dateFrom}&dateTo={dateTo}&dateFilterType=createdAt&limit=1000
```

**Buscar ações da equipe (período anterior)**:
```
GET /actions?teamId={teamId}&dateFrom={dateFromPrevious}&dateTo={dateToPrevious}&dateFilterType=createdAt&limit=1000
```

**Notas:**
- `dateFilterType=createdAt`: Filtra por data de criação (pode ser alterado para `startDate` se preferir)
- `limit=1000`: Alto o suficiente para pegar todas as ações (ajustar conforme necessário)
- Backend já suporta esses filtros (implementados anteriormente)

### 5.2 Hook Customizado

**Localização:** `src/lib/hooks/use-team-metrics.ts`

```typescript
export function useTeamMetrics(teamId: string, preset: DatePreset) {
  const currentPeriod = getPresetById(preset)?.getRange()
  const previousPeriod = getPreviousPeriod(preset)

  // Buscar ações do período atual
  const currentQuery = useActions({
    teamId,
    dateFrom: currentPeriod.dateFrom,
    dateTo: currentPeriod.dateTo,
    dateFilterType: 'createdAt',
    limit: 1000,
  })

  // Buscar ações do período anterior
  const previousQuery = useActions({
    teamId,
    dateFrom: previousPeriod.dateFrom,
    dateTo: previousPeriod.dateTo,
    dateFilterType: 'createdAt',
    limit: 1000,
  })

  // Processar métricas quando ambos estiverem carregados
  const metrics = useMemo(() => {
    if (!currentQuery.data || !previousQuery.data) return null

    return calculateTeamMetrics(
      currentQuery.data.data,
      previousQuery.data.data,
      teamMembers // TODO: buscar membros da equipe
    )
  }, [currentQuery.data, previousQuery.data])

  return {
    metrics,
    isLoading: currentQuery.isLoading || previousQuery.isLoading,
    error: currentQuery.error || previousQuery.error,
  }
}
```

---

## 6. Design System e UI/UX

### 6.1 Cores Semânticas (conforme design-system.md)

- **Verde (success)**: Melhora, crescimento positivo
- **Vermelho (destructive)**: Piora, alertas, ações atrasadas
- **Azul (info)**: Neutro, em andamento
- **Roxo (primary)**: Ações principais, destaque
- **Amarelo (warning)**: Atenção, urgente
- **Cinza (muted)**: Secundário, sem mudança

### 6.2 Ícones (seguindo diretrizes)

**Quando usar:**
- Trophy (🏆): #1 do ranking
- TrendingUp (↑): Melhora
- TrendingDown (↓): Piora
- Clock: Atrasadas
- BarChart3: Gráficos e métricas

**Quando NÃO usar:**
- Não adicionar ícones redundantes em textos claros
- Evitar ícones decorativos sem função

### 6.3 Responsividade

**Mobile (<640px)**:
- Cards empilhados verticalmente
- Gráfico de ranking scrollável horizontalmente
- Tabela vira lista de cards
- Filtros em dropdown

**Tablet (640px - 1024px)**:
- Cards em 2 colunas
- Gráficos lado a lado
- Tabela compacta

**Desktop (>1024px)**:
- Cards em 4 colunas
- Gráficos lado a lado com mais espaço
- Tabela completa

### 6.4 Estados de Loading

1. **Skeleton nos cards**: Placeholder cinza animado
2. **Spinner nos gráficos**: Spinner centralizado
3. **Skeleton na tabela**: 3-5 linhas de placeholder

### 6.5 Estados Vazios

1. **Equipe sem membros**:
   - Ícone: UserPlus
   - Mensagem: "Adicione membros à equipe para começar"
   - Botão: "Convidar Membros"

2. **Sem entregas no período**:
   - Ícone: Sparkles
   - Mensagem: "Nenhuma entrega neste período. Motive a equipe!"
   - Botão: "Ver Todas as Ações"

---

## 7. Estrutura de Arquivos

```
src/
├── components/
│   ├── features/
│   │   └── dashboard/
│   │       ├── manager/
│   │       │   ├── manager-dashboard.tsx          # Componente principal
│   │       │   ├── team-metrics-cards.tsx         # Grid de cards com métricas
│   │       │   ├── team-ranking-chart.tsx         # Gráfico de ranking horizontal
│   │       │   ├── delivery-trend-chart.tsx       # Gráfico de linha temporal
│   │       │   └── team-details-table.tsx         # Tabela detalhada
│   │       └── shared/
│   │           ├── metric-card-with-comparison.tsx # Card reutilizável
│   │           ├── period-filter.tsx               # Filtro de período
│   │           └── period-indicator.tsx            # "Esta Semana vs Semana Passada"
│   └── ui/
│       └── (componentes shadcn/ui existentes)
│
├── lib/
│   ├── hooks/
│   │   └── use-team-metrics.ts                    # Hook para métricas da equipe
│   ├── utils/
│   │   ├── metrics-calculator.ts                  # Funções de cálculo
│   │   ├── period-comparator.ts                   # Lógica de comparação
│   │   └── date-presets.ts                        # (já existe)
│   └── types/
│       └── dashboard.ts                            # Types do dashboard
│
└── app/
    └── (protected)/
        └── companies/
            └── [companyId]/
                └── dashboard/
                    └── manager/
                        └── page.tsx                # Página do dashboard do gestor
```

---

## 8. Ordem de Implementação

### Fase 1: Fundação (Tarefas 1-2)

**Tarefa 1: Criar utilidades e types**
- `src/lib/types/dashboard.ts`: Definir interfaces (TeamMemberMetrics, TeamMetrics)
- `src/lib/utils/metrics-calculator.ts`: Funções de cálculo de métricas
- `src/lib/utils/period-comparator.ts`: Lógica de comparação de períodos

**Tarefa 2: Hook de dados**
- `src/lib/hooks/use-team-metrics.ts`: Hook para buscar e processar métricas
- Integrar com `useActions` existente
- Implementar lógica de dois períodos (atual + anterior)

### Fase 2: Componentes Compartilhados (Tarefas 3-4)

**Tarefa 3: Componentes de filtro e indicador**
- `src/components/features/dashboard/shared/period-filter.tsx`: Filtro de período
- `src/components/features/dashboard/shared/period-indicator.tsx`: Indicador de comparação
- Reutilizar `date-presets.ts`

**Tarefa 4: Card de métrica com comparativo**
- `src/components/features/dashboard/shared/metric-card-with-comparison.tsx`
- Lógica de cores (verde/vermelho) baseada em melhora/piora
- Suporte a inversão de lógica (menos é melhor para "Atrasadas")

### Fase 3: Componentes de Visualização (Tarefas 5-7)

**Tarefa 5: Grid de cards de métricas**
- `src/components/features/dashboard/manager/team-metrics-cards.tsx`
- 4 cards: Total Entregas, Taxa Conclusão, Velocidade, Atrasadas
- Responsivo (4 cols desktop, 2 cols tablet, 1 col mobile)

**Tarefa 6: Gráfico de ranking**
- `src/components/features/dashboard/manager/team-ranking-chart.tsx`
- Gráfico de barras horizontal (recharts)
- Badge especial para #1
- Link "Ver toda equipe"

**Tarefa 7: Gráfico de tendência**
- `src/components/features/dashboard/manager/delivery-trend-chart.tsx`
- Gráfico de linha temporal (recharts)
- Área sombreada para período selecionado
- Tooltip com detalhes

**Tarefa 8: Tabela detalhada**
- `src/components/features/dashboard/manager/team-details-table.tsx`
- Tabela ordenável
- Click na linha para detalhes
- Responsiva (cards em mobile)

### Fase 4: Integração (Tarefas 9-10)

**Tarefa 9: Componente principal**
- `src/components/features/dashboard/manager/manager-dashboard.tsx`
- Orquestrar todos os sub-componentes
- Gerenciar estado de filtros
- Loading states

**Tarefa 10: Página**
- `src/app/(protected)/companies/[companyId]/dashboard/manager/page.tsx`
- Integrar com roteamento Next.js
- Verificação de role (apenas Manager pode acessar)
- Meta tags e SEO

### Fase 5: Testes e Ajustes (Tarefa 11)

**Tarefa 11: Testes manuais e ajustes finais**
- Testar filtros de período
- Verificar cálculos de métricas
- Validar comparativos
- Testar responsividade
- Ajustar cores e espaçamentos

---

## 9. Bibliotecas e Dependências

### Necessárias

- **recharts**: Gráficos de ranking e tendência
  ```bash
  npm install recharts
  ```

### Já Disponíveis (Reutilizar)

- **shadcn/ui**: Button, Card, Table, Avatar, Badge
- **lucide-react**: Ícones
- **tailwindcss**: Estilização
- **react-query**: Chamadas à API (`useActions`)
- **date-presets.ts**: Filtros de período

---

## 10. Métricas de Sucesso

### KPIs Técnicos

- ✅ Tempo de carregamento < 2s
- ✅ Responsivo em todos os tamanhos de tela
- ✅ Cálculos de métricas precisos
- ✅ Comparativos corretos entre períodos

### KPIs de UX

- ✅ Gestor consegue identificar top performer em < 5s
- ✅ Gestor consegue ver tendência de melhora/piora rapidamente
- ✅ Filtro de período intuitivo e responsivo
- ✅ Tabela permite ordenação e navegação fácil

### KPIs de Negócio

- ✅ Aumento no engajamento de gestores com a plataforma
- ✅ Identificação mais rápida de membros que precisam suporte
- ✅ Motivação de equipe através de competição saudável

---

## 11. Próximos Passos (Futuro)

### Dashboard do Master

- Filtro de múltiplas equipes
- Comparativo entre equipes
- Métricas agregadas da empresa toda
- Ranking de equipes (não só indivíduos)

### Dashboard do Executor

- Foco no próprio desempenho
- Comparação com média da equipe
- Gamificação: badges, conquistas
- Metas pessoais

### Melhorias Incrementais

- Exportar relatórios em PDF
- Gráficos interativos (drill-down)
- Notificações de conquistas
- Integração com sistema de recompensas

---

## 12. Considerações de Segurança

1. **Autorização**: Verificar que usuário tem role `manager` e pertence à equipe
2. **Dados Sensíveis**: Não expor dados de outros gestores ou equipes não autorizadas
3. **Rate Limiting**: Considerar cache para evitar muitas chamadas à API
4. **Validação**: Validar teamId e companyId no backend

---

## 13. Notas de Implementação

### YAGNI Aplicado
- Não construir filtros complexos de data customizada (apenas presets)
- Não criar drill-downs detalhados por membro (pode vir depois)
- Não implementar exportação de relatórios (não solicitado)

### DRY Aplicado
- Reutilizar `date-presets.ts` para filtros
- Reutilizar `useActions` para chamadas API
- Reutilizar componentes shadcn/ui existentes
- Componente `MetricCardWithComparison` reutilizável

### Acessibilidade
- Labels descritivos em gráficos
- Tabela navegável por teclado
- Cores com contraste adequado (WCAG AA)
- Alt text em avatares

---

## Aprovações

- [x] Design revisado e aprovado
- [ ] Implementação pendente
- [ ] Testes pendentes
- [ ] Deploy pendente

**Data de Aprovação:** 2026-01-06
**Próximo Passo:** Criar plano de implementação detalhado
