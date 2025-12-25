import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createEffect, createSignal } from "solid-js"
import Bell from "lucide-solid/icons/bell"
import Lock from "lucide-solid/icons/lock"
import Palette from "lucide-solid/icons/palette"
import Database from "lucide-solid/icons/database"
import Download from "lucide-solid/icons/download"
import LogOut from "lucide-solid/icons/log-out"
import { useActiveTitle } from "@/contexts/config"
import { StaticMetadata } from "@/contexts/metadata"
import { useColorMode } from "@kobalte/core"
import { Switch, SwitchControl, SwitchThumb } from "@/components/ui/switch"
import { Title } from "@/components/layout/title"

export default function SettingsPage() {
  useActiveTitle({ title: "Settings", description: "Manage your Zaimu preferences and configuration." })

  const color = useColorMode()
  const [darkMode, setDarkMode] = createSignal(color.colorMode() === "dark" ? true : false)
  const [emailNotifications, setEmailNotifications] = createSignal(true)
  const [monthlyDigest, setMonthlyDigest] = createSignal(true)

  createEffect(() => {
    if (darkMode()) {
      color.setColorMode("dark")
    } else {
      color.setColorMode("light")
    }
  })

  return (
    <section class="p-4">
      <StaticMetadata />
      <Title />

      <Card class="mb-6">
        <CardHeader>
          <div class="flex items-center gap-3">
            <Palette class="w-5 h-5 text-accent" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how Zaimu looks and feels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <SettingRow
            label="Dark Mode"
            description="Use dark theme for reduced eye strain"
            value={darkMode}
            onChange={setDarkMode}
          />
        </CardContent>
      </Card>

      <Card class="mb-6">
        <CardHeader>
          <div class="flex items-center gap-3">
            <Bell class="w-5 h-5 text-accent" />
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Control how you receive alerts and updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <SettingRow
            label="Email Notifications"
            description="Receive notifications about large transactions"
            value={emailNotifications}
            onChange={setEmailNotifications}
          />
          <SettingRow
            label="Monthly Digest"
            description="Get a summary of your spending each month"
            value={monthlyDigest}
            onChange={setMonthlyDigest}
          />
        </CardContent>
      </Card>

      <Card class="mb-6">
        <CardHeader>
          <div class="flex items-center gap-3">
            <Lock class="w-5 h-5 text-accent" />
            <div>
              <CardTitle>Data & Privacy</CardTitle>
              <CardDescription>Manage your data and privacy preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between py-3 border-t border-border first:border-0">
            <div>
              <p class="font-medium text-foreground">Data Encryption</p>
              <p class="text-sm text-muted-foreground">All data is encrypted at rest</p>
            </div>
            <span class="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium">
              Enabled
            </span>
          </div>
          <div class="flex items-center justify-between py-3 border-t border-border">
            <div>
              <p class="font-medium text-foreground">Server Location</p>
              <p class="text-sm text-muted-foreground">Self-hosted on your infrastructure</p>
            </div>
            <span class="text-sm text-accent font-medium">Local</span>
          </div>
        </CardContent>
      </Card>

      <Card class="mb-6">
        <CardHeader>
          <div class="flex items-center gap-3">
            <Database class="w-5 h-5 text-accent" />
            <div>
              <CardTitle>Database</CardTitle>
              <CardDescription>Manage your data storage and backups</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between py-3">
            <div>
              <p class="font-medium text-foreground">Database Status</p>
              <p class="text-sm text-muted-foreground">Last backup: 2 hours ago</p>
            </div>
            <span class="inline-block px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium">
              Healthy
            </span>
          </div>
          <div class="flex gap-3 pt-4 border-t border-border">
            <Button variant="outline" size="sm" class="gap-2 bg-transparent">
              <Download class="w-4 h-4" />
              Export Data
            </Button>
            <Button variant="outline" size="sm">
              Create Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div class="flex items-center gap-3">
            <LogOut class="w-5 h-5 text-accent" />
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account and authentication</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <Button variant="outline" class="w-full bg-transparent">
              Change Password
            </Button>
            <Button variant="destructive" class="w-full">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

function SettingRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description: string
  value: () => boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div class="flex items-center justify-between py-3 border-t border-border first:border-0">
      <div>
        <p class="font-medium text-foreground">{label}</p>
        <p class="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={value()} onChange={onChange} class="flex items-center space-x-2">
        <SwitchControl>
          <SwitchThumb />
        </SwitchControl>
      </Switch>
    </div>
  )
}
