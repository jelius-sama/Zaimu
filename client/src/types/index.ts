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
