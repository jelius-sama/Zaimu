import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTransactions, mockCategorySummary, monthlyData, formatCurrency } from "@/lib/mock-data"
import TrendingUp from "lucide-solid/icons/trending-up"
import ArrowUpRight from "lucide-solid/icons/arrow-up-right"
import ArrowDownLeft from "lucide-solid/icons/arrow-down-left"
import { useActiveTitle } from "@/contexts/config"
import { type JSXElement, For, createSignal, onMount, onCleanup } from "solid-js"
import { StaticMetadata } from "@/contexts/metadata"
import { Title } from "@/components/layout/title"

export default function Dashboard() {
  useActiveTitle({ title: "Dashboard", description: "Welcome back. Here's your financial overview" })
  const currentMonth = mockTransactions.filter((t) => t.date.getMonth() === new Date().getMonth())

  const totalIncome = currentMonth.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = currentMonth.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses

  const chartColors = {
    chart1: "hsl(var(--color-chart-1))",
    chart2: "hsl(var(--color-chart-2))",
    chart3: "hsl(var(--color-chart-3))",
  }
  let el!: HTMLDivElement;

  const [size, setSize] = createSignal({ width: 0, height: 0 });

  onMount(() => {
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    ro.observe(el);

    onCleanup(() => ro.disconnect());
  });

  return (
    <section class="p-4">
      <StaticMetadata />
      <Title />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          change="+5.2%"
          trend="up"
          icon={<ArrowUpRight class="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses)}
          change="-2.1%"
          trend="down"
          icon={<ArrowDownLeft class="w-5 h-5 text-red-600" />}
        />
        <MetricCard
          title="Net Income"
          value={formatCurrency(netIncome)}
          change={netIncome > 0 ? "+3.1%" : "-3.1%"}
          trend={netIncome > 0 ? "up" : "down"}
          icon={<TrendingUp class="w-5 h-5 text-accent" />}
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
            <CardDescription>Monthly comparison over the last 5 months</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChartComponent data={monthlyData} chartColors={chartColors} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Top spending categories this month</CardDescription>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={mockCategorySummary.slice(0, 5)} chartColors={chartColors} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader ref={el}>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your 5 most recent transactions</CardDescription>
        </CardHeader>
        <CardContent class="overflow-x-scroll">
          <div style={{ width: `${size().width}px` }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.slice(0, 5).map((txn) => (
                  <tr>
                    <td class="whitespace-nowrap">{txn.date.toLocaleDateString()}</td>
                    <td class="font-medium">{txn.merchant}</td>
                    <td>{txn.category}</td>
                    <td class={txn.type === "income" ? "text-green-600 font-semibold" : "text-foreground"}>
                      {txn.type === "income" ? "+" : "-"}
                      {formatCurrency(txn.amount)}
                    </td>
                    <td>
                      <span
                        class={`inline-block px-3 py-1 rounded-full text-xs font-medium ${txn.type === "income"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}
                      >
                        {txn.type === "income" ? "Income" : "Expense"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: JSXElement
}) {
  return (
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle class="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-foreground mb-2">{value}</div>
        <p class={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {change} from last month
        </p>
      </CardContent>
    </Card>
  )
}

function BarChartComponent(props: { data: any[]; chartColors: any }) {
  const maxValue = () => Math.max(...props.data.flatMap((d: any) => [d.income, d.expenses]))
  const chartHeight = 300
  const padding = { top: 20, right: 20, bottom: 50, left: 60 }
  const innerHeight = chartHeight - padding.top - padding.bottom
  const barWidth = 40

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
        <defs>
          <pattern id="grid" width="100" height="50" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" stroke-width="0.5" stroke-dasharray="3 3" />
          </pattern>
        </defs>

        <rect x={padding.left} y={padding.top} width={600 - padding.left - padding.right} height={innerHeight} fill="url(#grid)" />

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
            const incomeHeight = (innerHeight * item.income) / maxValue()
            const expensesHeight = (innerHeight * item.expenses) / maxValue()

            return (
              <g>
                <rect
                  x={x}
                  y={padding.top + innerHeight - incomeHeight}
                  width={barWidth}
                  height={incomeHeight}
                  fill={props.chartColors.chart1}
                  rx="8"
                  ry="8"
                  style="clip-path: inset(0 0 0 0 round 8px 8px 0 0)"
                />
                <rect
                  x={x + barWidth + 10}
                  y={padding.top + innerHeight - expensesHeight}
                  width={barWidth}
                  height={expensesHeight}
                  fill={props.chartColors.chart3}
                  rx="8"
                  ry="8"
                  style="clip-path: inset(0 0 0 0 round 8px 8px 0 0)"
                />
                <text
                  x={x + barWidth + 5}
                  y={chartHeight - padding.bottom + 20}
                  text-anchor="middle"
                  font-size="12"
                  fill="hsl(var(--muted-foreground))"
                >
                  {item.month}
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
          <div style={{ width: '12px', height: '12px', 'background-color': props.chartColors.chart1, 'border-radius': '2px' }} />
          <span style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}>Income</span>
        </div>
        <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', 'background-color': props.chartColors.chart3, 'border-radius': '2px' }} />
          <span style={{ 'font-size': '12px', color: 'hsl(var(--muted-foreground))' }}>Expenses</span>
        </div>
      </div>
    </div>
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
      color: Object.values(props.chartColors)[index % 3] as string,
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
