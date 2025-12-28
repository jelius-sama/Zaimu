export interface Transaction {
  id: string
  date: Date
  merchant: string
  category: string
  description: string
  amount: number
  type: "expense" | "income"
  method: "card" | "transfer" | "cash"
  tags: string[]
}

export interface CategorySummary {
  name: string
  total: number
  count: number
  percentage: number
}

export interface MonthlyData {
  id: string;
  year: number;
  month: string;
  income: number;
  expenses: number;
}

// Realistic mock transaction data
export const mockTransactions: Transaction[] = [
  {
    id: "txn-001",
    date: new Date("2025-12-23"),
    merchant: "Whole Foods Market",
    category: "Groceries",
    description: "Weekly groceries",
    amount: 87.53,
    type: "expense",
    method: "card",
    tags: ["food", "weekly"],
  },
  {
    id: "txn-002",
    date: new Date("2025-12-22"),
    merchant: "Spotify",
    category: "Subscriptions",
    description: "Monthly subscription",
    amount: 12.99,
    type: "expense",
    method: "card",
    tags: ["recurring", "entertainment"],
  },
  {
    id: "txn-003",
    date: new Date("2025-12-22"),
    merchant: "TechCorp Inc.",
    category: "Salary",
    description: "Monthly salary deposit",
    amount: 5200.0,
    type: "income",
    method: "transfer",
    tags: ["recurring", "employment"],
  },
  {
    id: "txn-004",
    date: new Date("2025-12-21"),
    merchant: "Starbucks",
    category: "Dining",
    description: "Coffee",
    amount: 5.85,
    type: "expense",
    method: "card",
    tags: ["dining", "daily"],
  },
  {
    id: "txn-005",
    date: new Date("2025-12-21"),
    merchant: "Amazon",
    category: "Shopping",
    description: "USB-C cables (3-pack)",
    amount: 24.99,
    type: "expense",
    method: "card",
    tags: ["tech", "online"],
  },
  {
    id: "txn-006",
    date: new Date("2025-12-20"),
    merchant: "Equinox Gym",
    category: "Fitness",
    description: "Monthly membership",
    amount: 179.0,
    type: "expense",
    method: "card",
    tags: ["recurring", "health"],
  },
  {
    id: "txn-007",
    date: new Date("2025-12-20"),
    merchant: "Delta Airlines",
    category: "Travel",
    description: "Flight to San Francisco",
    amount: 342.5,
    type: "expense",
    method: "card",
    tags: ["travel", "business"],
  },
  {
    id: "txn-008",
    date: new Date("2025-12-19"),
    merchant: "Chipotle",
    category: "Dining",
    description: "Lunch",
    amount: 12.45,
    type: "expense",
    method: "card",
    tags: ["dining", "food"],
  },
  {
    id: "txn-009",
    date: new Date("2025-12-19"),
    merchant: "Freelance Project",
    category: "Income",
    description: "Web design project payment",
    amount: 800.0,
    type: "income",
    method: "transfer",
    tags: ["freelance", "side-income"],
  },
  {
    id: "txn-010",
    date: new Date("2025-12-18"),
    merchant: "Trader Joe's",
    category: "Groceries",
    description: "Weekly groceries",
    amount: 64.23,
    type: "expense",
    method: "card",
    tags: ["food", "weekly"],
  },
  {
    id: "txn-011",
    date: new Date("2025-12-18"),
    merchant: "FedEx",
    category: "Shipping",
    description: "Package shipping",
    amount: 18.75,
    type: "expense",
    method: "card",
    tags: ["shipping", "business"],
  },
  {
    id: "txn-012",
    date: new Date("2025-12-17"),
    merchant: "Rent Payment",
    category: "Housing",
    description: "Monthly rent",
    amount: 2100.0,
    type: "expense",
    method: "transfer",
    tags: ["recurring", "housing"],
  },
]

// Category summary for this month
export const mockCategorySummary: CategorySummary[] = [
  { name: "Housing", total: 2100.0, count: 1, percentage: 26.2 },
  { name: "Groceries", total: 151.76, count: 2, percentage: 1.9 },
  { name: "Dining", total: 18.3, count: 2, percentage: 0.2 },
  { name: "Subscriptions", total: 12.99, count: 1, percentage: 0.2 },
  { name: "Fitness", total: 179.0, count: 1, percentage: 2.2 },
  { name: "Travel", total: 342.5, count: 1, percentage: 4.3 },
  { name: "Shopping", total: 24.99, count: 1, percentage: 0.3 },
  { name: "Shipping", total: 18.75, count: 1, percentage: 0.2 },
]

// Monthly comparison data
export const monthlyData: Array<MonthlyData> = [
  { id: "aug-2025", year: 2025, month: "Aug", income: 6000, expenses: 3200 },
  { id: "sep-2025", year: 2025, month: "Sep", income: 6200, expenses: 3450 },
  { id: "oct-2025", year: 2025, month: "Oct", income: 6000, expenses: 3100 },
  { id: "nov-2025", year: 2025, month: "Nov", income: 6500, expenses: 3800 },
  { id: "dec-2025", year: 2025, month: "Dec", income: 6000, expenses: 2848 },
]

export function calculateCategorySummary(transactions: Transaction[]): CategorySummary[] {
  const categoryMap = new Map<string, { total: number; count: number }>()
  let totalExpenses = 0

  transactions.forEach((txn) => {
    if (txn.type === "expense") {
      totalExpenses += txn.amount
      const existing = categoryMap.get(txn.category) || { total: 0, count: 0 }
      categoryMap.set(txn.category, {
        total: existing.total + txn.amount,
        count: existing.count + 1,
      })
    }
  })

  return Array.from(categoryMap.entries())
    .map(([name, { total, count }]) => ({
      name,
      total,
      count,
      percentage: (total / totalExpenses) * 100,
    }))
    .sort((a, b) => b.total - a.total)
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}
