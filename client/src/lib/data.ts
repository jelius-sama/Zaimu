import { createQuery } from "@tanstack/solid-query"
import type { CategorySummary, MonthlyData, Transaction } from "@/types"

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }
  return res.json()
}

export function useTransactions() {
  return createQuery(() => ({
    queryKey: ["transactions", 1],
    queryFn: async () => {
      const res = await fetchJSON<{ data: Transaction[] }>(
        `/api/transactions?page=1`
      )

      // backend sends ISO strings → convert to Date
      return res.data.map(txn => ({
        ...txn,
        date: new Date(txn.date),
        type: TransactionType(txn.type),
        method: TransactionMethod(txn.method),
      }))
    },
  }))
}

export const TTExpense = "expense" as const
export const TTIncome = "income" as const

export const TMCard = "card" as const
export const TMCash = "cash" as const
export const TMTransfer = "transfer" as const

export function TransactionType(x: any): string {
  return x === 0 ? TTExpense : TTIncome
}

export function TransactionMethod(x: any): string {
  return x === 0 ? TMCard : x === 1 ? TMTransfer : TMCash
}

export function useCategorySummary(year: number, month: number) {
  return createQuery(() => ({
    queryKey: ["category-summary", year, month],
    queryFn: () =>
      fetchJSON<{ data: CategorySummary[] }>(
        `/api/category_summery?year=${year}&month=${month}`
      ).then(res => res.data),
  }))
}

export function useMonthlyData(year: number) {
  return createQuery(() => ({
    queryKey: ["monthly-data", year],
    queryFn: () =>
      fetchJSON<{ data: MonthlyData[] }>(
        `/api/monthly_data?year=${year}`
      ).then(res => res.data),
  }))
}
