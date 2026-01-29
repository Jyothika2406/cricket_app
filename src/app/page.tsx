"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SplashScreen } from "@/components/splash-screen"
import { Onboarding } from "@/components/onboarding"
import { AuthScreen } from "@/components/auth-screen"
import { useApp } from "@/contexts/app-context"

export default function Home() {
  const [step, setStep] = useState<"splash" | "onboarding" | "auth">("splash")
  const { isLoggedIn, user, login } = useApp()
  const { data: session, status } = useSession()
  const router = useRouter()

  // Role-Based Navigation Helper
  const handleRedirect = () => {
    const role = session?.user?.role || user?.role
    if (role === "admin") {
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  }

  // Check if user is authenticated (either via NextAuth session or local context)
  const isAuthenticated = status === "authenticated" || (isLoggedIn && user)

  useEffect(() => {
    // If NextAuth session exists but local context doesn't have user, sync it
    if (status === "authenticated" && session?.user && !isLoggedIn) {
      // Fetch full user data and sync to context
      fetch("/api/user/profile")
        .then(res => {
          if (res.status === 401) {
            // Not authenticated - ignore silently
            return null
          }
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
          return res.json()
        })
        .then(data => {
          if (data?.success && data?.user) {
            login(data.user)
          }
        })
        .catch(console.error)
    }
  }, [status, session, isLoggedIn])

  useEffect(() => {
    // IMMEDIATE CHECK: If already authenticated, redirect instantly
    if (isAuthenticated && status !== "loading") {
      handleRedirect()
      return
    }

    // SPLASH LOGIC
    if (step === "splash") {
      const timer = setTimeout(() => {
        if (status === "loading") {
          // Still loading session, wait
          return
        }
        if (isAuthenticated) {
          handleRedirect()
        } else {
          setStep("onboarding")
        }
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [step, isAuthenticated, status, router])

  // WATCHER: Detects login state changes
  useEffect(() => {
    if (isAuthenticated && status !== "loading") {
      handleRedirect()
    }
  }, [isAuthenticated, status])

  return (
    <div className="relative h-[100dvh] w-full flex flex-col overflow-hidden bg-background text-foreground">
      <AnimatePresence mode="wait">

        {/* SPLASH SCREEN */}
        {step === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-50"
          >
            <SplashScreen />
          </motion.div>
        )}

        {/* ONBOARDING SCREEN */}
        {step === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-40"
          >
            <Onboarding onComplete={() => setStep("auth")} />
          </motion.div>
        )}

        {/* AUTH (LOGIN) SCREEN */}
        {step === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 z-30"
          >
            <AuthScreen onComplete={handleRedirect} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}