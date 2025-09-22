import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, RefreshCw, Home, AlertCircle } from "lucide-react"
import { Fragment } from "react"
import { Link } from "react-router-dom"
import { PathBasedMetadata } from "@/contexts/metadata"
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

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10">
              <Bug className="size-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Oops!</h1>
              <h2 className="text-lg font-semibold text-foreground">Something went wrong</h2>
              <p className="text-muted-foreground text-balance">
                We encountered an unexpected error. This has been logged and our team has been notified.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="size-4" />
                Error Details
              </CardTitle>
              <CardDescription>{error?.message || "An unexpected error occurred"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error?.digest && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-xs font-mono text-muted-foreground">Error ID: {error.digest}</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                {reset && (
                  <Button onClick={reset}>
                    <RefreshCw className="mr-2 size-4" />
                    Try Again
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/">
                    <Home className="mr-2 size-4" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Fragment>
  )
}
