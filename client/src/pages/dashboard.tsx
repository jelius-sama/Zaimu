import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTransactions, mockCategorySummary, monthlyData, formatCurrency } from "@/lib/mock-data"
import TrendingUp from "lucide-solid/icons/trending-up"
import ArrowUpRight from "lucide-solid/icons/arrow-up-right"
import ArrowDownLeft from "lucide-solid/icons/arrow-down-left"
import { useActiveTitle } from "@/contexts/config"
import { type JSXElement, createSignal, onMount, onCleanup } from "solid-js"
import { StaticMetadata } from "@/contexts/metadata"
import { Title } from "@/components/layout/title"
import { Chart as ChartJS, registerables } from 'chart.js'
import { DefaultChart as Chart } from 'solid-chartjs'

export default function Dashboard() {
  useActiveTitle({ title: "Dashboard", description: "Welcome back. Here's your financial overview" })

  let el!: HTMLDivElement;

  const [size, setSize] = createSignal({ width: 0, height: 0 });

  onMount(() => {
    ChartJS.register(...registerables)

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    ro.observe(el);

    onCleanup(() => ro.disconnect());
  });

  const currentMonth = mockTransactions.filter((t) => t.date.getMonth() === new Date().getMonth())
  const totalIncome = currentMonth.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = currentMonth.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
  const netIncome = totalIncome - totalExpenses

  const barChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.map(d => d.income),
        backgroundColor: 'hsl(var(--color-chart-1))',
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: monthlyData.map(d => d.expenses),
        backgroundColor: 'hsl(var(--color-chart-3))',
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: 'hsl(var(--muted-foreground))',
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          color: 'hsl(var(--border))',
          drawTicks: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          padding: 8
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: true,
          color: 'hsl(var(--border))',
          drawTicks: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          padding: 8
        },
        border: {
          display: false
        }
      }
    }
  }

  const pieChartData = {
    labels: mockCategorySummary.slice(0, 5).map(c => c.name),
    datasets: [{
      data: mockCategorySummary.slice(0, 5).map(c => c.total),
      backgroundColor: [
        'hsl(var(--color-chart-1))',
        'hsl(var(--color-chart-2))',
        'hsl(var(--color-chart-3))',
        'hsl(var(--color-chart-1))',
        'hsl(var(--color-chart-2))',
      ],
      borderWidth: 2,
      borderColor: 'hsl(var(--card))',
    }]
  }

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: {
          color: 'hsl(var(--muted-foreground))',
          usePointStyle: true,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'hsl(var(--card))',
        titleColor: 'hsl(var(--foreground))',
        bodyColor: 'hsl(var(--foreground))',
        borderColor: 'hsl(var(--border))',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return ` ${context.label}: ${formatCurrency(context.parsed)}`
          }
        }
      }
    }
  }

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
            <div style={{ height: '300px' }}>
              <Chart type="bar" data={barChartData} options={barChartOptions} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Top spending categories this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ height: '300px' }}>
              <Chart type="pie" data={pieChartData} options={pieChartOptions} />
            </div>
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
