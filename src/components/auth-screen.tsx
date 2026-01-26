"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronLeft, MessageCircle, User, Lock, Phone, Mail, Loader2 } from "lucide-react"
import { signIn } from "next-auth/react"
import { useApp } from "@/contexts/app-context"

// --- INTERNAL ICONS ---
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 23 23" width="24" height="24" {...props}>
      <path fill="#f35325" d="M1 1h10v10H1z" />
      <path fill="#81bc06" d="M12 1h10v10H12z" />
      <path fill="#05a6f0" d="M1 12h10v10H1z" />
      <path fill="#ffba08" d="M12 12h10v10H12z" />
    </svg>
  )
}

type AuthMode = "login" | "signup"

export function AuthScreen({ onComplete }: { onComplete?: () => void }) {
  const [mode, setMode] = useState<AuthMode>("login")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  })

  const { language, setLanguage, login } = useApp()
  const router = useRouter()

  const clearError = () => setError("")

  // Handle Login - directly sign in without OTP
  const handleLoginAPI = async () => {
    clearError()
    if (!formData.email || !formData.password) {
      setError("Please fill all fields")
      return
    }
    
    setIsLoading(true)
    try {
      // Use NextAuth signIn directly
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError(result.error || "Invalid credentials")
        setIsLoading(false)
        return
      }

      // Navigate to dashboard
      if (onComplete) {
        onComplete()
      } else {
        router.push("/dashboard")
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Signup with validation
  const handleSignupAPI = async () => {
    clearError()
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill all required fields")
      return
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Registration failed")
        setIsLoading(false)
        return
      }

      // Auto login after signup using NextAuth directly
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        setError("Account created! Please login.")
        setMode("login")
      } else {
        // Navigate to dashboard
        if (onComplete) {
          onComplete()
        } else {
          router.push("/dashboard")
        }
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Social Login
  const handleOAuthLogin = async (provider: "google" | "microsoft") => {
    setIsLoading(true)
    const providerId = provider === "microsoft" ? "azure-ad" : "google"
    await signIn(providerId, { callbackUrl: "/dashboard" })
  }

  return (
    <div className="h-full w-full bg-background p-6 flex flex-col text-foreground min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {mode !== "login" ? (
          <Button variant="ghost" size="icon" onClick={() => { setMode("login"); clearError() }} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-500/20 text-green-500 bg-green-500/10">
            <MessageCircle className="w-4 h-4" fill="currentColor" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Support</span>
          </div>
        )}
        <button onClick={() => setLanguage(language === "en" ? "hi" : "en")}>
          <p className="text-xs text-muted-foreground uppercase font-bold hover:text-foreground transition-colors">
            {language === "en" ? "English 🇬🇧" : "हिंदी 🇮🇳"}
          </p>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* --- LOGIN VIEW --- */}
        {mode === "login" && (
          <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 flex flex-col">
            <div className="flex items-center gap-0 mb-2">
              <span className="text-3xl font-black italic tracking-tight text-orange-500">CRICBET</span>
              <span className="bg-[#1a2234] text-white text-lg font-black px-2 py-0.5 rounded ml-1">
                SK<span className="text-orange-500">I</span>LL
              </span>
            </div>
            <p className="text-muted-foreground mb-8">Welcome back! Login to continue.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Enter email" 
                    type="email"
                    className="pl-10 bg-card border-border rounded-xl h-12 text-foreground" 
                    value={formData.email} 
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearError() }} 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Password</Label>
                  <button onClick={() => router.push("/forgot-password")} className="text-xs text-green-500 font-bold hover:underline">FORGOT?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 bg-card border-border rounded-xl h-12 text-foreground" 
                    value={formData.password} 
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearError() }} 
                  />
                </div>
              </div>
              <Button onClick={handleLoginAPI} className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-black italic uppercase rounded-xl text-lg mt-2" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> LOADING...</> : "ENTER"}
              </Button>
            </div>

            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground font-bold">Or continue with</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button onClick={() => handleOAuthLogin("google")} variant="outline" className="bg-card border-border hover:bg-muted text-foreground h-12 rounded-xl gap-2" disabled={isLoading}>
                  <GoogleIcon className="w-5 h-5" /> <span className="font-semibold">Google</span>
                </Button>
                <Button onClick={() => handleOAuthLogin("microsoft")} variant="outline" className="bg-card border-border hover:bg-muted text-foreground h-12 rounded-xl gap-2" disabled={isLoading}>
                  <MicrosoftIcon className="w-5 h-5" /> <span className="font-semibold">Microsoft</span>
                </Button>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-auto pb-2">
              New here? <button onClick={() => { setMode("signup"); clearError() }} className="text-green-500 font-bold hover:underline">CREATE ACCOUNT</button>
            </p>
          </motion.div>
        )}

        {/* --- SIGNUP VIEW --- */}
        {mode === "signup" && (
          <motion.div key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col">
            <h1 className="text-4xl font-black italic uppercase text-foreground mb-2">JOIN US</h1>
            <p className="text-muted-foreground mb-8">Create your betting account.</p>
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Full Name *" className="pl-10 bg-card border-border rounded-xl h-12 text-foreground" value={formData.name} onChange={(e) => { setFormData({ ...formData, name: e.target.value }); clearError() }} />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Email Address *" type="email" className="pl-10 bg-card border-border rounded-xl h-12 text-foreground" value={formData.email} onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearError() }} />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Phone Number (Optional)" className="pl-10 bg-card border-border rounded-xl h-12 text-foreground" value={formData.phone} onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); clearError() }} />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                <Input type="password" placeholder="Create Password * (min 6 chars)" className="pl-10 bg-card border-border rounded-xl h-12 text-foreground" value={formData.password} onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearError() }} />
              </div>
              <Button onClick={handleSignupAPI} className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black italic uppercase rounded-xl text-lg mt-4" disabled={isLoading}>
                {isLoading ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> CREATING...</> : "CONTINUE"}
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-auto pt-6">
              Already have an account? <button onClick={() => { setMode("login"); clearError() }} className="text-green-500 font-bold hover:underline">LOGIN</button>
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
