import { useActiveTitle } from "@/contexts/config"
import Fragment from "@/lib/fragment"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StaticMetadata } from "@/contexts/metadata"

export default function HomePage() {
  useActiveTitle("Home")

  return (
    <Fragment>
      <StaticMetadata />
      <div class="flex flex-1 flex-col gap-4 p-4">
        <div class="mx-auto max-w-2xl space-y-6">
          <div class="text-center space-y-4">
            <h1 class="text-4xl font-bold tracking-tight text-foreground">Welcome to Acme</h1>
            <p class="text-xl text-muted-foreground text-balance">
              Your modern SolidJS template with solid-ui components and best practices built-in.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                This template includes everything you need to build modern SolidJS applications.
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid gap-2">
                <p class="text-sm text-muted-foreground">✓ Go in Server side</p>
                <p class="text-sm text-muted-foreground">✓ SolidJS with TypeScript</p>
                <p class="text-sm text-muted-foreground">✓ solid-ui components with design tokens</p>
              </div>
              <div class="flex gap-2">
                <Button>Get Started</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Fragment>
  )
}
