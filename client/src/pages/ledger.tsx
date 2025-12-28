import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useTransactions } from "@/lib/data"
import { createSignal, createMemo, For, Show } from "solid-js"
import ChevronRight from "lucide-solid/icons/chevron-right"
import Search from "lucide-solid/icons/search"
import { TextFieldInput, TextField } from "@/components/ui/text-field"
import { useActiveTitle } from "@/contexts/config"
import { StaticMetadata } from "@/contexts/metadata"
import { Title } from "@/components/layout/title"
import assert from "assert"
import type { Transaction } from "@/types"

export default function Ledger() {
  useActiveTitle({ title: "Ledger", description: "Complete transaction history and details." })
  const transactions = useTransactions()

  return (
    <Show
      when={!transactions.isLoading}
      fallback={<></>}
    >
      <LedgerContent
        transactions={transactions}
      />
    </Show>
  )
}

function LedgerContent({ transactions }: { transactions: ReturnType<typeof useTransactions> }) {
  assert(transactions.data != null && transactions.data != undefined)

  const [selectedTxn, setSelectedTxn] = createSignal<Transaction | null>(null)
  const [searchQuery, setSearchQuery] = createSignal("")

  const filteredTransactions = createMemo(() =>
    transactions.data.filter(
      (txn) =>
        txn.merchant.toLowerCase().includes(searchQuery().toLowerCase()) ||
        txn.category.toLowerCase().includes(searchQuery().toLowerCase()) ||
        txn.description.toLowerCase().includes(searchQuery().toLowerCase()),
    )
  )

  return (
    <section class="p-4">
      <StaticMetadata />
      <Title />

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <Card>
            <CardHeader>
              <TextField class="flex flex-row items-center gap-2">
                <Search class="w-4 h-4 text-muted-foreground" />
                <TextFieldInput
                  placeholder="Search transactions..."
                  value={searchQuery()}
                  onInput={(e: any) => setSearchQuery(e.target.value)}
                  class="border-0 bg-transparent focus:ring-0 pl-0"
                />
              </TextField>
            </CardHeader>
            <CardContent>
              <div class="overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Merchant</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredTransactions()}>
                      {(txn) => (
                        <tr onClick={() => setSelectedTxn(txn)} class="cursor-pointer">
                          <td class="whitespace-nowrap text-sm text-muted-foreground">{formatDate(txn.date)}</td>
                          <td class="font-medium">{txn.merchant}</td>
                          <td class="text-sm">{txn.category}</td>
                          <td class={txn.type === "income" ? "text-green-600 font-semibold" : ""}>
                            {txn.type === "income" ? "+" : "-"}
                            {formatCurrency(txn.amount)}
                          </td>
                          <td class="text-right">
                            <ChevronRight class="w-4 h-4 text-muted-foreground" />
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedTxn() ? (
          <div class="lg:col-span-1">
            <Card class="sticky top-20">
              <CardHeader>
                <div class="flex items-center justify-between mb-4">
                  <CardTitle class="text-lg">Transaction Details</CardTitle>
                  <button onClick={() => setSelectedTxn(null)} class="text-muted-foreground hover:text-foreground">
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent class="space-y-4">
                <div>
                  <p class="text-xs font-semibold text-muted-foreground mb-1">MERCHANT</p>
                  <p class="text-lg font-semibold text-foreground">{selectedTxn()!.merchant}</p>
                </div>

                <div>
                  <p class="text-xs font-semibold text-muted-foreground mb-1">AMOUNT</p>
                  <p
                    class={`text-2xl font-bold ${selectedTxn()!.type === "income" ? "text-green-600" : "text-foreground"}`}
                  >
                    {selectedTxn()!.type === "income" ? "+" : "-"}
                    {formatCurrency(selectedTxn()!.amount)}
                  </p>
                </div>

                <div class="grid grid-cols-2 gap-4 py-4 border-t border-border">
                  <div>
                    <p class="text-xs font-semibold text-muted-foreground mb-1">DATE</p>
                    <p class="text-sm text-foreground">{formatDate(selectedTxn()!.date)}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-muted-foreground mb-1">TYPE</p>
                    <p class="text-sm text-foreground capitalize">{selectedTxn()!.type}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
                  <div>
                    <p class="text-xs font-semibold text-muted-foreground mb-1">CATEGORY</p>
                    <p class="text-sm text-foreground">{selectedTxn()!.category}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-muted-foreground mb-1">METHOD</p>
                    <p class="text-sm text-foreground capitalize">{selectedTxn()!.method}</p>
                  </div>
                </div>

                <div>
                  <p class="text-xs font-semibold text-muted-foreground mb-1">DESCRIPTION</p>
                  <p class="text-sm text-foreground">{selectedTxn()!.description}</p>
                </div>

                <div>
                  <p class="text-xs font-semibold text-muted-foreground mb-2">TAGS</p>
                  <div class="flex flex-wrap gap-2">
                    <For each={selectedTxn()!.tags}>
                      {(tag) => (
                        <span
                          class="inline-block px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-medium"
                        >
                          {tag}
                        </span>
                      )}
                    </For>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div class="lg:col-span-1">
            <Card class="h-full flex items-center justify-center">
              <CardContent class="text-center py-12">
                <p class="text-muted-foreground">Select a transaction to view details</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  )
}
