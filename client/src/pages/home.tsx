import { StaticMetadata } from "@/contexts/metadata"
import { useActiveTitle } from "@/contexts/config"
import { Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  useActiveTitle("Home")

  return (
    <Fragment>
      <StaticMetadata />

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Welcome to Acme</h1>
            <p className="text-xl text-muted-foreground text-balance">
              Your modern React template with shadcn/ui components and best practices built-in.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start</CardTitle>
              <CardDescription>
                This template includes everything you need to build modern React applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <p className="text-sm text-muted-foreground">✓ Go in Server side</p>
                <p className="text-sm text-muted-foreground">✓ React with TypeScript</p>
                <p className="text-sm text-muted-foreground">✓ shadcn/ui components with design tokens</p>
              </div>
              <div className="flex gap-2">
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
