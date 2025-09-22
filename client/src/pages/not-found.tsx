import { Button } from "@/components/ui/button"
import { Fragment } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { PathBasedMetadata } from "@/contexts/metadata"
import { useActiveTitle } from "@/contexts/config"

export default function NotFound() {
  useActiveTitle("Page Not Found")

  return (
    <Fragment>
      <PathBasedMetadata paths={["*", "#not_found"]} />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto max-w-md space-y-6 text-center">
          <div className="space-y-4">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
              <AlertTriangle className="size-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">404</h1>
              <h2 className="text-xl font-semibold text-foreground">Page Not Found</h2>
              <p className="text-muted-foreground text-balance">
                Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL
                might be incorrect.
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">What can you do?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check the URL for typos</p>
                <p>• Go back to the previous page</p>
                <p>• Visit our homepage</p>
                <p>• Contact support if you think this is an error</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link to="/">
                    <Home className="mr-2 size-4" />
                    Go Home
                  </Link>
                </Button>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="mr-2 size-4" />
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
