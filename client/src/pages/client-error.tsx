import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Bug from "lucide-solid/icons/bug"
import RefreshCw from "lucide-solid/icons/refresh-cw"
import Home from "lucide-solid/icons/home"
import AlertCircle from "lucide-solid/icons/alert-circle"
import Fragment from "@/lib/fragment"
import { PathBasedMetadata } from "@/contexts/metadata"
import { A } from "@solidjs/router"
import { useActiveTitle } from "@/contexts/config"

interface ClientErrorProps {
  error?: Error & { digest?: string }
  reset?: () => void
}

export default function ClientError({ error, reset }: ClientErrorProps) {
  useActiveTitle("Client Error")

  return (
    <Fragment>
      <PathBasedMetadata paths={["*", "#client_error"]} />

      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="mx-auto max-w-md space-y-6 text-center">
          <div class="space-y-4">
            <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
              <Bug class="size-10 text-destructive" />
            </div>
            <div class="space-y-2">
              <h1 class="text-2xl font-bold tracking-tight text-foreground">Oops!</h1>
              <h2 class="text-lg font-semibold text-foreground">Something went wrong</h2>
              <p class="text-muted-foreground text-balance">
                We encountered an unexpected error. This has been logged and our team has been notified.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle class="text-base flex items-center gap-2">
                <AlertCircle class="size-4" />
                Error Details
              </CardTitle>
              <CardDescription>{error?.message || "An unexpected error occurred"}</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              {error?.digest && (
                <div class="rounded-md bg-muted p-3">
                  <p class="text-xs font-mono text-muted-foreground">Error ID: {error.digest}</p>
                </div>
              )}
              <div class="flex flex-col gap-2">
                {reset && (
                  <Button onClick={reset}>
                    <RefreshCw class="mr-2 size-4" />
                    Try Again
                  </Button>
                )}
                <Button variant="outline" as={A} href="/">
                  <Home class="mr-2 size-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Fragment>
  )
}
