import { createSignal, Show, Index } from "solid-js"
import { Button } from "@/components/ui/button"
import { toast } from "solid-sonner"

interface OTPVerificationScreenProps {
    email: string
    password: string
    onComplete: VoidFunction
    onBanned: VoidFunction
}

export function OTPVerificationScreen({ email, password, onComplete, onBanned }: OTPVerificationScreenProps) {
    const [otp, setOtp] = createSignal(["", "", "", "", "", ""])
    const [isLoading, setIsLoading] = createSignal(false)
    const [error, setError] = createSignal("")
    let inputElements: Array<HTMLInputElement> = [];

    const sendNewOtp = async () => {
        let loadingToastId
        try {
            loadingToastId = toast.loading("Sending a new OTP...")

            const formData = new FormData()
            formData.set("email", email)
            formData.set("password", password)

            const res = await fetch("/api/sign_in", {
                method: "POST",
                body: formData,
                credentials: "include",
            })

            if (res.status === 403) {
                toast.dismiss(loadingToastId)
                toast.error("You are banned!")
                onBanned()
                return
            }

            if (res.status === 500) {
                toast.dismiss(loadingToastId)
                toast.error("Something went wrong!")
                return
            }

            if (res.ok) {
                toast.dismiss(loadingToastId)
                toast.success("A new OTP has been send!")
                return
            }

            toast.dismiss(loadingToastId)
            toast.error("Invalid credentials!")
        } catch (err) {
            toast.dismiss(loadingToastId)
            toast.error("You might want to check your internet connection!")
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (index: number, value: string) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return

        const newOtp = [...otp()]
        newOtp[index] = value

        setOtp(newOtp)
        setError("")

        // Auto-focus next input
        if (value && index < 5) {
            inputElements[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
            e.preventDefault()
            if (index > 0) {
                inputElements[index - 1]?.focus()
            }
            return
        }

        if (e.key === "ArrowRight") {
            e.preventDefault()
            if (index < inputElements.length - 1) {
                inputElements[index + 1]?.focus()
            }
            return
        }

        if (e.key === "Backspace" && !otp()[index] && index > 0) {
            inputElements[index - 1]?.focus()
        }
    }

    const handleSubmit = async (e: Event) => {
        e.preventDefault()

        const otpValue = otp().join("")
        if (otpValue.length !== 6) {
            setError("Please enter all 6 digits")
            return
        }

        setIsLoading(true)

        try {
            const formData = new FormData()
            formData.set("otp", otpValue)

            const res = await fetch("/api/verify_otp", {
                method: "POST",
                body: formData,
                credentials: "include",
            })

            if (res.status === 401) {
                setError("Invalid or expired code. Try again.")
                setOtp(["", "", "", "", "", ""])
                inputElements[0]?.focus()
                return
            }

            if (res.status === 403) {
                setError("You are banned.")

                onBanned()
                return
            }

            if (!res.ok) {
                setError("Something went wrong. Please try again.")
                return
            }

            // Success → auth cookie is now set
            onComplete()
        } catch {
            setError("You might want to check your internet connection.")
        } finally {
            setIsLoading(false)
        }
    }

    const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault()
        const digits = e.clipboardData
            ?.getData("text")
            .replace(/\D/g, "")
            .slice(0, 6)
            .split("")

        if (!digits?.length) return

        const next = ["", "", "", "", "", ""]
        digits.forEach((d, i) => (next[i] = d))
        setOtp(next)

        inputElements[digits.length - 1]?.focus()
    }

    return (
        <div class="flex items-center justify-center min-h-screen px-4 py-8 animate-in fade-in duration-500">
            <div class="w-full max-w-sm space-y-8">
                {/* Header */}
                <div class="space-y-3 text-center animate-in fade-in slide-in-from-top duration-700 delay-100">
                    <h1 class="text-4xl font-light tracking-tight text-pretty">Verify</h1>
                    <p class="text-sm text-muted-foreground font-light">Check your email for the code</p>
                    <p class="text-xs text-muted-foreground">{email}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} class="space-y-6 animate-in fade-in slide-in-from-top duration-700 delay-200">
                    {/* OTP Input Grid */}
                    <div class="space-y-4">
                        <label class="text-xs font-medium text-muted-foreground tracking-wide block">ENTER CODE</label>
                        <div class="flex gap-2 justify-center">
                            <Index each={otp()}>
                                {(digit, index) => (
                                    <input
                                        ref={el => inputElements[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        autocomplete={index === 0 ? "one-time-code" : undefined}
                                        pattern={index === 0 ? "[0-9]*" : undefined}
                                        maxLength={1}
                                        value={digit()}
                                        onPaste={handlePaste}
                                        onInput={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        class={`w-12 h-12 md:w-14 md:h-14 text-center text-2xl font-light border-2 rounded-lg transition-all duration-200 ${digit() ? "border-ring bg-primary/5 text-foreground" : "border-border bg-input text-foreground"
                                            } focus:border-ring focus:ring-2 focus:ring-ring/30 focus:outline-none animate-in fade-in scale-in duration-300`}
                                        disabled={isLoading()}
                                    />
                                )}
                            </Index>
                        </div>

                        {/* Error Message */}
                        {error && <p class="text-sm text-destructive text-center animate-in fade-in duration-200">{error()}</p>}
                    </div>

                    {/* Submit Button */}
                    <div class="pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading() || !otp().every((digit) => digit !== "")}
                            class="w-full h-11 bg-primary text-primary-foreground font-medium transition-all duration-200 active:scale-95"
                        >
                            <Show when={isLoading()} fallback={"Confirm"}>
                                <span class="flex items-center gap-2">
                                    <span class="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                                    Confirming...
                                </span>
                            </Show>
                        </Button>
                    </div>
                </form>

                {/* Footer Message */}
                <div class="space-y-3 text-center animate-in fade-in duration-700 delay-300">
                    <p class="text-xs text-muted-foreground font-light">Didn't receive it?</p>
                    <button
                        type="button"
                        disabled={isLoading()}
                        onClick={sendNewOtp}
                        class="text-xs text-ring hover:text-ring/80 transition-colors duration-200 font-medium"
                    >
                        Resend code
                    </button>
                </div>
            </div>
        </div>
    )
}
