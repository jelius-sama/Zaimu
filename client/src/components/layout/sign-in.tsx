import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { TextFieldInput, TextField, TextFieldLabel } from "@/components/ui/text-field"
import { toast } from "solid-sonner"

interface SignInScreenProps {
    onComplete: (email: string, password: string) => void
    onBanned: VoidFunction
}

export function SignInScreen({ onComplete, onBanned }: SignInScreenProps) {
    const [email, setEmail] = createSignal("")
    const [password, setPassword] = createSignal("")
    const [isLoading, setIsLoading] = createSignal(false)

    const handleSubmit = async (e: Event) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.set("email", email())
            formData.set("password", password())

            const res = await fetch("/api/sign_in", {
                method: "POST",
                body: formData,
                credentials: "include",
            })

            if (res.status === 403) {
                toast.error("You are banned!")
                onBanned()
                return
            }

            if (res.status === 500) {
                toast.error("Something went wrong!")
                return
            }

            if (res.ok) {
                onComplete(email(), password())
                return
            }

            toast.error("Invalid credentials!")
        } catch (err) {
            toast.error("You might want to check your internet connection!")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div class="flex items-center justify-center min-h-screen px-4 py-8 animate-in fade-in duration-500">
            <div class="w-full max-w-sm space-y-8">
                {/* Header */}
                <div class="space-y-3 text-center animate-in fade-in slide-in-from-top duration-700 delay-100">
                    <h1 class="text-4xl font-light tracking-tight text-pretty">Authenticate</h1>
                    <p class="text-sm text-muted-foreground font-light">Enter your credentials to continue</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} class="space-y-5 animate-in fade-in slide-in-from-top duration-700 delay-200">
                    {/* Email Input */}
                    <TextField class="space-y-2">
                        <TextFieldLabel for="email" class="text-xs font-medium text-muted-foreground tracking-wide">
                            EMAIL
                        </TextFieldLabel>
                        <TextFieldInput
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email()}
                            onInput={(e) => setEmail(e.currentTarget.value)}
                            required
                            class="h-11 bg-input text-foreground placeholder:text-muted-foreground border-border transition-all duration-200 focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                    </TextField>

                    {/* Password Input */}
                    <TextField class="space-y-2">
                        <TextFieldLabel for="password" class="text-xs font-medium text-muted-foreground tracking-wide">
                            PASSWORD
                        </TextFieldLabel>
                        <TextFieldInput
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password()}
                            onInput={(e) => setPassword(e.currentTarget.value)}
                            required
                            class="h-11 bg-input text-foreground placeholder:text-muted-foreground border-border transition-all duration-200 focus:ring-2 focus:ring-ring focus:border-transparent"
                        />
                    </TextField>

                    {/* Submit Button */}
                    <div class="pt-4">
                        <Button
                            type="submit"
                            disabled={isLoading() || !email() || !password()}
                            class="w-full h-11 font-medium transition-all duration-200"
                        >
                            <Show fallback="Continue" when={isLoading()}>
                                <span class="flex items-center gap-2">
                                    <span class="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                                    Verifying...
                                </span>
                            </Show>
                        </Button>
                    </div>
                </form>

                {/* Footer Message */}
                <div class="text-center animate-in fade-in duration-700 delay-300">
                    <p class="text-xs text-muted-foreground font-light leading-relaxed">
                        Your connection is secure and private
                    </p>
                </div>
            </div>
        </div>
    )
}
