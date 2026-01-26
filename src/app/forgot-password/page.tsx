"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, Lock, KeyRound, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type Step = "email" | "otp" | "password" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.success) {
        setStep("otp")
      } else {
        setError(data.message || data.error || "Failed to send OTP")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter 6-digit OTP")
      return
    }
    setError("")
    setStep("password")
  }

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      })

      const data = await res.json()

      if (data.success) {
        setStep("success")
      } else {
        setError(data.message || data.error || "Failed to reset password")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="bg-card border border-border rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-0 mb-2">
              <span className="text-2xl font-black italic tracking-tight text-orange-500">CRICBET</span>
              <span className="bg-[#1a2234] text-white text-sm font-black px-1.5 py-0.5 rounded ml-0.5">
                SK<span className="text-orange-500">I</span>LL
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {step === "email" && "Forgot Password"}
              {step === "otp" && "Verify OTP"}
              {step === "password" && "New Password"}
              {step === "success" && "Success!"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "otp" && "Enter the 6-digit code sent to your email"}
              {step === "password" && "Create a new secure password"}
              {step === "success" && "Your password has been reset"}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step: Email */}
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-14 pl-12 bg-background border-border rounded-xl text-foreground"
                  />
                </div>
              </div>
              <Button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </div>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">6-Digit Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    className="h-14 pl-12 bg-background border-border rounded-xl text-foreground text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>
              </div>
              <Button
                onClick={handleVerifyOtp}
                className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl"
              >
                Verify Code
              </Button>
              <button 
                onClick={handleSendOtp}
                className="w-full text-sm text-muted-foreground hover:text-green-500 transition-colors"
              >
                Didn't receive code? Resend
              </button>
            </div>
          )}

          {/* Step: New Password */}
          {step === "password" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 pl-12 bg-background border-border rounded-xl text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs uppercase font-bold">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 pl-12 bg-background border-border rounded-xl text-foreground"
                  />
                </div>
              </div>
              <Button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </div>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <div>
                <p className="text-foreground font-bold mb-2">Password Reset Complete!</p>
                <p className="text-muted-foreground text-sm">You can now login with your new password</p>
              </div>
              <Button
                onClick={() => router.push("/")}
                className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl"
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* Progress Dots */}
          {step !== "success" && (
            <div className="flex justify-center gap-2 mt-8">
              {["email", "otp", "password"].map((s, i) => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    step === s ? "bg-green-500" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
