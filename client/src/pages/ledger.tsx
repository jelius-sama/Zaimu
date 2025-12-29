import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, formatDate, useIsMobile } from "@/lib/utils"
import { useTransactions } from "@/lib/data"
import { createSignal, createMemo, For, Show, type Setter, Switch, Match, createEffect } from "solid-js"
import ChevronRight from "lucide-solid/icons/chevron-right"
import Search from "lucide-solid/icons/search"
import { TextFieldInput, TextField } from "@/components/ui/text-field"
import { useActiveTitle } from "@/contexts/config"
import { StaticMetadata } from "@/contexts/metadata"
import { Title } from "@/components/layout/title"
import assert from "assert"
import type { Transaction } from "@/types"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

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

// TODO: Improve visual looks of the drawer
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
                        <tr onClick={() => setSelectedTxn(txn as Transaction)} class="cursor-pointer">
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
        <Show when={selectedTxn()} fallback={<TransactionDetailCardFallback />}>
          {(txn) => <TransactionDetailCard selectedTxn={txn()} setSelectedTxn={setSelectedTxn} />}
        </Show>
      </div>
    </section>
  )
}

function TransactionDetailCardFallback() {
  const isMobile = useIsMobile()

  return (
    <Show when={!isMobile()}>
      <div class="lg:col-span-1">
        <Card class="h-full flex items-center justify-center">
          <CardContent class="text-center py-12">
            <p class="text-muted-foreground">Select a transaction to view details</p>
          </CardContent>
        </Card>
      </div>
    </Show>
  )
}

function TransactionDetailCard(props: { selectedTxn: Transaction; setSelectedTxn: Setter<Transaction | null> }) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = createSignal<boolean>(true)

  createEffect(() => {
    if (!isOpen()) {
      setTimeout(() => { props.setSelectedTxn(null) }, 300)
    }
  })

  const DetailCard = () => {
    return (
      <Card class={isMobile() ? "bg-transparent border-none" : "sticky top-20"}>
        <Show when={!isMobile()}>
          <CardHeader>
            <div class="flex items-center justify-between mb-4">
              <CardTitle class="text-lg">Transaction Details</CardTitle>
              <button onClick={() => props.setSelectedTxn(null)} class="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
          </CardHeader>
        </Show>
        <CardContent class="space-y-4">
          <div>
            <p class="text-xs font-semibold text-muted-foreground mb-1">MERCHANT</p>
            <p class="text-lg font-semibold text-foreground">{props.selectedTxn.merchant}</p>
          </div>

          <div>
            <p class="text-xs font-semibold text-muted-foreground mb-1">AMOUNT</p>
            <p
              class={`text-2xl font-bold ${props.selectedTxn.type === "income" ? "text-green-600" : "text-foreground"}`}
            >
              {props.selectedTxn.type === "income" ? "+" : "-"}
              {formatCurrency(props.selectedTxn.amount)}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 py-4 border-t border-border">
            <div>
              <p class="text-xs font-semibold text-muted-foreground mb-1">DATE</p>
              <p class="text-sm text-foreground">{formatDate(props.selectedTxn.date)}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-muted-foreground mb-1">TYPE</p>
              <p class="text-sm text-foreground capitalize">{props.selectedTxn.type}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 py-4 border-t border-b border-border">
            <div>
              <p class="text-xs font-semibold text-muted-foreground mb-1">CATEGORY</p>
              <p class="text-sm text-foreground">{props.selectedTxn.category}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-muted-foreground mb-1">METHOD</p>
              <p class="text-sm text-foreground capitalize">{props.selectedTxn.method}</p>
            </div>
          </div>

          <div>
            <p class="text-xs font-semibold text-muted-foreground mb-1">DESCRIPTION</p>
            <p class="text-sm text-foreground">{props.selectedTxn.description}</p>
          </div>

          <div>
            <p class="text-xs font-semibold text-muted-foreground mb-2">TAGS</p>
            <div class="flex flex-wrap gap-2">
              <For each={props.selectedTxn.tags}>
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
    )
  }

  return (
    <Switch>
      <Match when={!isMobile()}>
        <div class="lg:col-span-1">
          <DetailCard />
        </div>
      </Match>

      <Match when={isMobile()}>
        <Drawer open={isOpen()} onOpenChange={setIsOpen}>
          <DrawerContent class="mx-4">
            <DrawerHeader>
              <DrawerTitle>Transaction Details</DrawerTitle>
            </DrawerHeader>
            <DetailCard />
          </DrawerContent>
        </Drawer>
      </Match>
    </Switch>
  )
}
