import { Title } from "@/components/layout/title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveTitle } from "@/contexts/config"
import { StaticMetadata } from "@/contexts/metadata"
import { mockCategorySummary, formatCurrency } from "@/lib/mock-data"
import { For } from "solid-js"

export default function InsightsPage() {
  useActiveTitle({ title: "Insights", description: "Deep dive into your spending patterns and trends." })

  const topCategories = mockCategorySummary.slice(0, 5)

  const chartColors = {
    chart1: "hsl(var(--color-chart-1))",
    chart2: "hsl(var(--color-chart-2))",
    chart3: "hsl(var(--color-chart-3))",
    chart4: "hsl(var(--color-chart-4))",
    chart5: "hsl(var(--color-chart-5))",
  }

  const categoryTrends = [
    { category: "Groceries", last_month: 145, this_month: 152, change: 5 },
    { category: "Dining", last_month: 89, this_month: 31, change: -65 },
    { category: "Subscriptions", last_month: 13, this_month: 13, change: 0 },
    { category: "Transport", last_month: 156, this_month: 0, change: -100 },
    { category: "Fitness", last_month: 179, this_month: 179, change: 0 },
  ]

  return (
    <section class="p-4">
      <StaticMetadata />
      <Title />

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {topCategories.map((category) => (
          <Card>
            <CardContent class="pt-6">
              <p class="text-xs font-semibold text-muted-foreground mb-2 uppercase">{category.name}</p>
              <p class="text-xl font-bold text-foreground mb-2">{formatCurrency(category.total)}</p>
              <p class="text-xs text-muted-foreground">
                {category.count} transaction{category.count !== 1 ? "s" : ""}
              </p>
              <p class="text-xs font-medium text-accent mt-2">{category.percentage.toFixed(1)}% of total</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Spending Distribution</CardTitle>
            <CardDescription>All expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={mockCategorySummary} chartColors={chartColors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Trends</CardTitle>
            <CardDescription>Last month vs this month</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={categoryTrends} chartColors={chartColors} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Breakdown</CardTitle>
          <CardDescription>Complete spending by category this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            {mockCategorySummary.map((category) => (
              <div
                class="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
              >
                <div class="flex-1">
                  <p class="font-medium text-foreground">{category.name}</p>
                  <p class="text-sm text-muted-foreground">
                    {category.count} transaction{category.count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-foreground">{formatCurrency(category.total)}</p>
                  <p class="text-sm text-accent">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function PieChartComponent(props: { data: any[]; chartColors: any }) {
  const total = () => props.data.reduce((sum: number, item: any) => sum + item.total, 0)
  const radius = 100
  const centerX = 200
  const centerY = 150

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  let cumulativePercent = 0
  const slices = props.data.map((item: any, index: number) => {
    const percent = item.total / total()
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
    const startCumulative = cumulativePercent
    cumulativePercent += percent
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
    const largeArcFlag = percent > 0.5 ? 1 : 0

    const midPercent = startCumulative + percent / 2
    const [labelX, labelY] = getCoordinatesForPercent(midPercent)
    const labelPosX = centerX + labelX * (radius + 30)
    const labelPosY = centerY + labelY * (radius + 30)

    const pathData = [
      `M ${centerX + startX * radius} ${centerY + startY * radius}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${centerX + endX * radius} ${centerY + endY * radius}`,
      `L ${centerX} ${centerY}`,
    ].join(' ')

    return {
      path: pathData,
      color: Object.values(props.chartColors)[index % 5] as string,
      name: item.name,
      value: item.total,
      labelX: labelPosX,
      labelY: labelPosY,
    }
  })

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
        <For each={slices}>
          {(slice) => (
            <>
              <path
                d={slice.path}
                fill={slice.color}
                stroke="hsl(var(--card))"
                stroke-width="2"
              />
              <text
                x={slice.labelX}
                y={slice.labelY}
                text-anchor="middle"
                font-size="11"
                fill="hsl(var(--foreground))"
                font-weight="500"
              >
                {slice.name}
              </text>
            </>
          )}
        </For>
      </svg>
    </div>
  )
}

function BarChartComponent(props: { data: any[]; chartColors: any }) {
  const maxValue = () => Math.max(...props.data.flatMap((d: any) => [d.last_month, d.this_month]))
  const chartHeight = 300
  const padding = { top: 20, right: 20, bottom: 80, left: 60 }
  const innerHeight = chartHeight - padding.top - padding.bottom
  const barWidth = 35

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid-insights" width="100" height="40" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" stroke-width="0.5" stroke-dasharray="3 3" />
          </pattern>
        </defs>

        <rect x={padding.left} y={padding.top} width={600 - padding.left - padding.right} height={innerHeight} fill="url(#grid-insights)" />

        <For each={Array.from({ length: 6 })}>
          {(_, i) => {
            const y = padding.top + innerHeight * i() / 5
            const value = Math.round(maxValue() * (1 - i() / 5))
            return (
              <text
                x={padding.left - 10}
                y={y + 5}
                text-anchor="end"
                font-size="12"
                fill="hsl(var(--muted-foreground))"
              >
                {value}
              </text>
            )
          }}
        </For>

        <For each={props.data}>
          {(item: any, i) => {
            const barGroupWidth = (600 - padding.left - padding.right) / props.data.length
            const x = padding.left + barGroupWidth * i() + barGroupWidth / 2 - barWidth - 5
            const lastMonthHeight = (innerHeight * item.last_month) / maxValue()
            const thisMonthHeight = (innerHeight * item.this_month) / maxValue()

            return (
              <g>
                <rect
                  x={x}
                  y={padding.top + innerHeight - lastMonthHeight}
                  width={barWidth}
                  height={lastMonthHeight}
                  fill={props.chartColors.chart2}
                  rx="8"
                  ry="8"
                  style="clip-path: inset(0 0 0 0 round 8px 8px 0 0)"
                />
                <rect
                  x={x + barWidth + 10}
                  y={padding.top + innerHeight - thisMonthHeight}
                  width={barWidth}
                  height={thisMonthHeight}
                  fill={props.chartColors.chart1}
                  rx="8"
                  ry="8"
                  style="clip-path: inset(0 0 0 0 round 8px 8px 0 0)"
                />
                <text
                  x={x + barWidth + 5}
                  y={chartHeight - padding.bottom + 15}
                  text-anchor="end"
                  font-size="11"
                  fill="hsl(var(--muted-foreground))"
                  transform={`rotate(-45 ${x + barWidth + 5} ${chartHeight - padding.bottom + 15})`}
                >
                  {item.category}
                </text>
              </g>
            )
          }}
        </For>

        <line
          x1={padding.left}
          y1={padding.top + innerHeight}
          x2={600 - padding.right}
          y2={padding.top + innerHeight}
          stroke="hsl(var(--muted-foreground))"
          stroke-width="1"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + innerHeight}
          stroke="hsl(var(--muted-foreground))"
          stroke-width="1"
        />
      </svg>

      <div style={{ display: 'flex', 'justify-content': 'center', gap: '20px', 'margin-top': '10px' }}>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', 'background-color': props.chartColors.chart2, 'border-radius': '2px' }} />
          <span style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}>Last Month</span>
        </div>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', 'background-color': props.chartColors.chart1, 'border-radius': '2px' }} />
          <span style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}>This Month</span>
        </div>
      </div>
    </div>
  )
}
