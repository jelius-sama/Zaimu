import { Title } from "@/components/layout/title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useActiveTitle } from "@/contexts/config"
import { StaticMetadata } from "@/contexts/metadata"
import { mockCategorySummary, formatCurrency } from "@/lib/mock-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockCategorySummary}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {mockCategorySummary.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={Object.values(chartColors)[index % 5]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Trends</CardTitle>
            <CardDescription>Last month vs this month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="category"
                  stroke="var(--color-muted-foreground)"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Legend />
                <Bar dataKey="last_month" fill={chartColors.chart2} name="Last Month" radius={[8, 8, 0, 0]} />
                <Bar dataKey="this_month" fill={chartColors.chart1} name="This Month" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
