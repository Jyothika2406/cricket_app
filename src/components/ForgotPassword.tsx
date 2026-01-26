"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Mail, ShieldCheck, ArrowRight } from "lucide-react"

interface ForgotPasswordProps {
    onBack: () => void
    onSuccess: () => void
}

export default function ForgotPasswordScreen({ onBack, onSuccess }: ForgotPasswordProps) {
    const [step, setStep] = useState<"email" | "reset">("email")
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleRequestReset = () => {
        setIsLoading(true)
        // Simulate API call to send reset link/OTP
        setTimeout(() => {
            setStep("reset")
            setIsLoading(false)
        }, 1500)
    }

    const handleFinalReset = () => {
        setIsLoading(true)
        // Simulate password update
        setTimeout(() => {
            onSuccess() // Take them to the app or back to login
            setIsLoading(false)
        }, 1500)
    }

    return (
        <div className="h-full w-full bg-background p-6 flex flex-col text-foreground">
            {/* Header */}
            <div className="flex items-center mb-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <span className="ml-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Back to Login
                </span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col"
            >
                {step === "email" ? (
                    <>
                        <h1 className="text-3xl font-black italic uppercase text-green-500 mb-2">
                            Reset Password
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            Enter your email or phone. We'll send a recovery link.
                        </p>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-2">
                                <Label htmlFor="recovery-id">Email or Phone Number</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="recovery-id"
                                        placeholder="name@example.com"
                                        className="pl-10 h-12 bg-card border-border rounded-xl focus:border-green-500"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleRequestReset}
                                disabled={!email || isLoading}
                                className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-black italic uppercase rounded-xl text-lg shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"}
                                {!isLoading && <ArrowRight className="ml-2 w-5 h-5" />}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col text-center">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-black italic uppercase text-white mb-2">
                            Check Your Inbox
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            We've sent a secure link to <br />
                            <span className="text-green-500 font-bold">{email}</span>
                        </p>

                        <div className="space-y-4">
                            <Button
                                onClick={handleFinalReset}
                                className="w-full h-14 bg-card border border-border text-foreground font-black italic uppercase rounded-xl"
                            >
                                I've Reset My Password
                            </Button>
                            <button
                                onClick={() => setStep("email")}
                                className="text-sm font-bold text-muted-foreground uppercase tracking-tighter"
                            >
                                Didn't get the email? <span className="text-green-500">Resend</span>
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    )
}