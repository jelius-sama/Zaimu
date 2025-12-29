import { createSignal, Match, Switch } from "solid-js"
import { SignInScreen } from "@/components/layout/sign-in"
import { OTPVerificationScreen } from "@/components/layout/otp-verification"

export default function Auth({ validateStatus }: { validateStatus: VoidFunction }) {
  const [screen, setScreen] = createSignal<"signin" | "otp">("signin")
  const [creds, setCreds] = createSignal<{ email: string; password: string }>({ email: "", password: "" })

  const handleSignInComplete = (userEmail: string, userPassword: string) => {
    setCreds({ email: userEmail, password: userPassword })
    setScreen("otp")
  }

  return (
    <main class="w-full min-h-screen bg-background text-foreground">
      <Switch>
        <Match when={screen() === "signin"}>
          <SignInScreen onComplete={handleSignInComplete} onBanned={validateStatus} />
        </Match>
        <Match when={screen() === "otp"}>
          <OTPVerificationScreen email={creds().email} password={creds().password} onComplete={validateStatus} onBanned={validateStatus} />
        </Match>
      </Switch>
    </main>
  )
}
