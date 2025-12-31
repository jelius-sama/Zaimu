import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions, useMonthlyData, useCategorySummary, TTExpense, TTIncome } from "@/lib/data"
import { type Transaction } from "@/types"
import { formatCurrency } from "@/lib/utils"
import TrendingUp from "lucide-solid/icons/trending-up"
import ArrowUpRight from "lucide-solid/icons/arrow-up-right"
import ArrowDownLeft from "lucide-solid/icons/arrow-down-left"
import { useActiveTitle } from "@/contexts/config"
import { type JSXElement, onMount, createMemo } from "solid-js"
import { StaticMetadata } from "@/contexts/metadata"
import { Title } from "@/components/layout/title"
import { Chart as ChartJS, registerables } from 'chart.js'
import { DefaultChart as Chart } from 'solid-chartjs'
import { appState } from "@/contexts/app"
import { Show } from "solid-js"
import assert from "assert"

// Helper function to get computed CSS variable
function getCSSVariable(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim()
}

type TrendType = "up" | "down" | "neutral" | "new"

export default function Dashboard() {
  const date = new Date()
  useActiveTitle({ title: "Dashboard", description: "Welcome back. Here's your financial overview" })
  const transactions = useTransactions()
  const monthlyData = useMonthlyData(date.getUTCFullYear())
  const categorySummary = useCategorySummary(date.getUTCFullYear(), date.getUTCMonth() + 1)

  return (
    <Show
      when={
        !transactions.isLoading &&
        !monthlyData.isLoading &&
        !categorySummary.isLoading
      }
      fallback={<></>}
    >
      <DashboardContent
        transactions={transactions}
        monthlyData={monthlyData}
        categorySummary={categorySummary}
      />
    </Show>
  )
}

function DashboardContent({ transactions, monthlyData, categorySummary }: { transactions: ReturnType<typeof useTransactions>, monthlyData: ReturnType<typeof useMonthlyData>, categorySummary: ReturnType<typeof useCategorySummary> }) {
  onMount(() => {
    ChartJS.register(...registerables)
  });

  assert(transactions.data != null && transactions.data != undefined)
  assert(monthlyData.data != null && monthlyData.data != undefined)
  assert(categorySummary.data != null && categorySummary.data != undefined)

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const previousMonthDate = new Date(currentYear, currentMonth - 1, 1)
  const previousMonth = previousMonthDate.getMonth()
  const previousYear = previousMonthDate.getFullYear()

  const currentMonthTransactions = createMemo<Array<Transaction>>(() =>
    transactions.data.filter(
      (t) =>
        t.date.getMonth() === currentMonth &&
        t.date.getFullYear() === currentYear
    ) as Array<Transaction>
  )

  const previousMonthTransactions = createMemo<Array<Transaction>>(() =>
    transactions.data.filter(
      (t) =>
        t.date.getMonth() === previousMonth &&
        t.date.getFullYear() === previousYear
    ) as Array<Transaction>
  )

  const sumByType = (list: Transaction[], type: Transaction["type"]) =>
    list
      .filter((t) => t.type === type)
      .reduce((sum, t) => sum + t.amount, 0)

  const percentChange = (current: number, previous: number): { value: number; trend: TrendType } => {
    // New activity - no previous data
    if (previous === 0 && current === 0) {
      return { value: 0, trend: "neutral" }
    }
    if (previous === 0) {
      return { value: 0, trend: "new" }
    }

    const change = ((current - previous) / previous) * 100

    // Neutral - no change
    if (Math.abs(change) < 0.01) {
      return { value: 0, trend: "neutral" }
    }

    return { value: change, trend: change >= 0 ? "up" : "down" }
  }

  const totalIncome = createMemo(() =>
    sumByType(currentMonthTransactions(), TTIncome)
  )

  const totalExpenses = createMemo(() =>
    sumByType(currentMonthTransactions(), TTExpense)
  )

  const netIncome = createMemo(() =>
    totalIncome() - totalExpenses()
  )

  const prevTotalIncome = createMemo(() =>
    sumByType(previousMonthTransactions(), TTIncome)
  )

  const prevTotalExpenses = createMemo(() =>
    sumByType(previousMonthTransactions(), TTExpense)
  )

  const prevNetIncome = createMemo(() =>
    prevTotalIncome() - prevTotalExpenses()
  )

  const incomeChangeData = createMemo(() =>
    percentChange(totalIncome(), prevTotalIncome())
  )

  const expensesChangeData = createMemo(() => {
    const result = percentChange(totalExpenses(), prevTotalExpenses())
    // Invert the trend for expenses (down is good, up is bad)
    if (result.trend === "up") return { ...result, trend: "down" as TrendType }
    if (result.trend === "down") return { ...result, trend: "up" as TrendType }
    return result
  })

  const netIncomeChangeData = createMemo(() =>
    percentChange(netIncome(), prevNetIncome())
  )

  // Compute colors from CSS variables
  const chartColors = createMemo(() => ({
    chart1: `hsl(${getCSSVariable('--chart-1')})`,
    chart2: `hsl(${getCSSVariable('--chart-2')})`,
    chart3: `hsl(${getCSSVariable('--chart-3')})`,
    mutedForeground: `hsl(${getCSSVariable('--muted-foreground')})`,
    card: `hsl(${getCSSVariable('--card')})`,
    foreground: `hsl(${getCSSVariable('--foreground')})`,
    border: `hsl(${getCSSVariable('--border')})`,
  }))

  const barChartData = createMemo(() => ({
    labels: monthlyData.data.map(d => d.month),
    datasets: [
      {
        label: 'Income',
        data: monthlyData.data.map(d => d.income),
        backgroundColor: chartColors().chart1,
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: monthlyData.data.map(d => d.expenses),
        backgroundColor: chartColors().chart3,
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
          padding: 8
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

  const pieChartData = createMemo(() => ({
    labels: categorySummary.data.slice(0, 5).map(c => c.name),
    datasets: [{
      data: categorySummary.data.slice(0, 5).map(c => c.total),
      backgroundColor: [
        chartColors().chart1,
        chartColors().chart2,
        chartColors().chart3,
        chartColors().chart1,
        chartColors().chart2,
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
          padding: 10,
          font: {
            size: 11
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

  return (
    <section class="p-4">
      <StaticMetadata />
      <Title />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Income"
          value={formatCurrency(totalIncome())}
          change={incomeChangeData().trend === "new" ? "New activity" : `${incomeChangeData().value.toFixed(1)}%`}
          trend={incomeChangeData().trend}
          icon={<ArrowUpRight class="w-5 h-5 text-green-600" />}
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(totalExpenses())}
          change={expensesChangeData().trend === "new" ? "New activity" : `${expensesChangeData().value.toFixed(1)}%`}
          trend={expensesChangeData().trend}
          icon={<ArrowDownLeft class="w-5 h-5 text-red-600" />}
        />
        <MetricCard
          title="Net Income"
          value={formatCurrency(netIncome())}
          change={netIncomeChangeData().trend === "new" ? "New activity" : `${netIncomeChangeData().value.toFixed(1)}%`}
          trend={netIncomeChangeData().trend}
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
              <Chart type="bar" data={barChartData()} options={barChartOptions()} />
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
              <Chart type="pie" data={pieChartData()} options={pieChartOptions()} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your 5 most recent transactions</CardDescription>
        </CardHeader>
        <CardContent class="w-full overflow-x-scroll">
          <div style={{ width: `calc(${appState.screen.width}px - ${1 * 2}rem - ${1.5 * 2}rem - ${1 * 2}px)` }}>
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
                {transactions.data.slice(0, 5).map((txn) => (
                  <tr>
                    <td class="whitespace-nowrap">{txn.date.toLocaleDateString()}</td>
                    <td class="font-medium">{txn.merchant}</td>
                    <td>{txn.category}</td>
                    <td class={txn.type === TTIncome ? "text-green-600 font-semibold" : "text-foreground"}>
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
                        {txn.type === TTIncome ? "Income" : "Expense"}
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
  trend: TrendType
  icon: JSXElement
}) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600"
      case "down":
        return "text-red-600"
      case "neutral":
        return "text-muted-foreground"
      case "new":
        return "text-blue-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getTrendText = () => {
    switch (trend) {
      case "neutral":
        return "No change from last month"
      case "new":
        return change
      default:
        return `${change} from last month`
    }
  }

  return (
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle class="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-foreground mb-2">{value}</div>
        <p class={`text-xs font-medium ${getTrendColor()}`}>
          {getTrendText()}
        </p>
      </CardContent>
    </Card>
  )
}
