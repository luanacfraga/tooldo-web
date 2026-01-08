'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ExecutorDashboardDoneTrendPoint } from '@/lib/types/executor-dashboard'

function toChartData(input: {
  current: ExecutorDashboardDoneTrendPoint[]
  previous: ExecutorDashboardDoneTrendPoint[]
}) {
  const map = new Map<string, { date: string; current?: number; previous?: number }>()

  input.current.forEach((p) => {
    map.set(p.date, { date: p.date, current: p.done })
  })
  input.previous.forEach((p) => {
    const existing = map.get(p.date)
    map.set(p.date, { date: p.date, current: existing?.current, previous: p.done })
  })

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function ExecutorDoneTrendChart(props: {
  current: ExecutorDashboardDoneTrendPoint[]
  previous: ExecutorDashboardDoneTrendPoint[]
  className?: string
}) {
  const data = toChartData({ current: props.current, previous: props.previous })

  return (
    <Card className={cn(props.className)}>
      <CardHeader>
        <CardTitle>Minha evolução</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                try {
                  return format(parseISO(String(value)), 'dd/MM', { locale: ptBR })
                } catch {
                  return String(value)
                }
              }}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              labelFormatter={(value) => {
                try {
                  return format(parseISO(String(value)), "dd 'de' MMM", { locale: ptBR })
                } catch {
                  return String(value)
                }
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="current"
              name="Período atual"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="previous"
              name="Período anterior"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              dot={false}
              strokeDasharray="6 6"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}


