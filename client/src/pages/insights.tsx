import { Title } from "@/components/layout/title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveTitle } from "@/contexts/config"
import { StaticMetadata } from "@/contexts/metadata"
import { useCategorySummary } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"
import { Chart as ChartJS, registerables } from 'chart.js'
import { DefaultChart as Chart } from 'solid-chartjs'
import { onMount, createMemo, Show } from "solid-js"
import assert from "assert"

// Helper function to get computed CSS variable
function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

export default function Insights() {
  const date = new Date()
  useActiveTitle({ title: "Insights", description: "Deep dive into your spending patterns and trends." })
  const categorySummary = useCategorySummary(date.getUTCFullYear(), date.getUTCMonth() + 1)

  return (
    <Show
      when={!categorySummary.isLoading}
      fallback={<></>}
    >
      <InsightsContent
        categorySummary={categorySummary}
      />
    </Show>

  )
}

// TODO: Update some static data in charts.
function InsightsContent({ categorySummary }: { categorySummary: ReturnType<typeof useCategorySummary> }) {
  onMount(() => {
    ChartJS.register(...registerables)
  })

  assert(categorySummary.data != null && categorySummary.data != undefined)

  const topCategories = categorySummary.data.slice(0, 5)

  // Compute colors from CSS variables
  const chartColors = createMemo(() => ({
    chart1: `hsl(${getCSSVariable('--chart-1')})`,
    chart2: `hsl(${getCSSVariable('--chart-2')})`,
    chart3: `hsl(${getCSSVariable('--chart-3')})`,
    chart4: `hsl(${getCSSVariable('--chart-4')})`,
    chart5: `hsl(${getCSSVariable('--chart-5')})`,
    mutedForeground: `hsl(${getCSSVariable('--muted-foreground')})`,
    card: `hsl(${getCSSVariable('--card')})`,
    foreground: `hsl(${getCSSVariable('--foreground')})`,
    border: `hsl(${getCSSVariable('--border')})`,
  }))

  const categoryTrends = [
    { category: "Groceries", last_month: 145, this_month: 152, change: 5 },
    { category: "Dining", last_month: 89, this_month: 31, change: -65 },
    { category: "Subscriptions", last_month: 13, this_month: 13, change: 0 },
    { category: "Transport", last_month: 156, this_month: 0, change: -100 },
    { category: "Fitness", last_month: 179, this_month: 179, change: 0 },
  ]

  const pieChartData = createMemo(() => ({
    labels: categorySummary.data.map(c => c.name),
    datasets: [{
      data: categorySummary.data.map(c => c.total),
      backgroundColor: [
        chartColors().chart1,
        chartColors().chart2,
        chartColors().chart3,
        chartColors().chart4,
        chartColors().chart5,
        chartColors().chart1,
        chartColors().chart2,
        chartColors().chart3,
        chartColors().chart4,
        chartColors().chart5,
      ],
      borderWidth: 2,
      borderColor: chartColors().card,
    }]
  }))

  const pieChartOptions = createMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: chartColors().mutedForeground,
          usePointStyle: true,
          padding: 8,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        backgroundColor: chartColors().card,
        titleColor: chartColors().foreground,
        bodyColor: chartColors().foreground,
        borderColor: chartColors().border,
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return ` ${context.label}: ${formatCurrency(context.parsed)}`
          }
        }
      }
    }
  }))

  const barChartData = createMemo(() => ({
    labels: categoryTrends.map(d => d.category),
    datasets: [
      {
        label: 'Last Month',
        data: categoryTrends.map(d => d.last_month),
        backgroundColor: chartColors().chart2,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'This Month',
        data: categoryTrends.map(d => d.this_month),
        backgroundColor: chartColors().chart1,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }))

  const barChartOptions = createMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: chartColors().mutedForeground,
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: chartColors().card,
        titleColor: chartColors().foreground,
        bodyColor: chartColors().foreground,
        borderColor: chartColors().border,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: chartColors().border,
          drawTicks: false,
        },
        ticks: {
          color: chartColors().mutedForeground,
          padding: 8,
          maxRotation: 45,
          minRotation: 45
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: true,
          color: chartColors().border,
          drawTicks: false,
        },
        ticks: {
          color: chartColors().mutedForeground,
          padding: 8
        },
        border: {
          display: false
        }
      }
    }
  }))

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
            <div style={{ height: '300px' }}>
              <Chart type="pie" data={pieChartData()} options={pieChartOptions()} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Trends</CardTitle>
            <CardDescription>Last month vs this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Chart type="bar" data={barChartData()} options={barChartOptions()} />
            </div>
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
            {categorySummary.data.map((category) => (
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
