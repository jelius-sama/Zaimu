import { Button } from "@/components/ui/button"
import Fragment from "@/lib/fragment"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AlertTriangle from "lucide-solid/icons/alert-triangle"
import Home from "lucide-solid/icons/home"
import ArrowLeft from "lucide-solid/icons/arrow-left"
import { A } from "@solidjs/router"
import { useActiveTitle } from "@/contexts/config"
import { PathBasedMetadata } from "@/contexts/metadata"

export default function NotFound() {
  useActiveTitle("Page Not Found")

  return (
    <Fragment>
      <PathBasedMetadata paths={["*", "#not_found"]} />

      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="mx-auto max-w-md space-y-6 text-center">
          <div class="space-y-4">
            <div class="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
              <AlertTriangle class="size-10 text-muted-foreground" />
            </div>
            <div class="space-y-2">
              <h1 class="text-4xl font-bold tracking-tight text-foreground">404</h1>
              <h2 class="text-xl font-semibold text-foreground">Page Not Found</h2>
              <p class="text-muted-foreground text-balance">
                Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL
                might be incorrect.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle class="text-base">What can you do?</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2 text-sm text-muted-foreground">
                <p>• Check the URL for typos</p>
                <p>• Go back to the previous page</p>
                <p>• Visit our homepage</p>
                <p>• Contact support if you think this is an error</p>
              </div>
              <div class="flex flex-col gap-2">
                <Button as={A} href="/">
                  <Home class="mr-2 size-4" />
                  Go Home
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft class="mr-2 size-4" />
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Fragment>
  )
}
