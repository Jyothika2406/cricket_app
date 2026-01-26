"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// FIX: Now importing from the SAME folder (./)
import { type Language, type Currency, type TranslationKey, translations } from "./i18n"

interface User {
  _id: string
  name: string
  email?: string
  phone?: string
  avatar?: string
  walletBalance: number
  kycStatus: "pending" | "verified" | "none"
}

interface AppContextType {
  user: User | null
  setUser: (user: User | null) => void
  language: Language
  setLanguage: (lang: Language) => void
  currency: Currency
  setCurrency: (curr: Currency) => void
  balance: number
  setBalance: (balance: number) => void
  isLoggedIn: boolean
  login: (userData: any) => Promise<void>
  logout: () => void
  t: (key: TranslationKey) => string
  formatCurrency: (amount: number) => string
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [language, setLanguage] = useState<Language>("en")
  const [currency, setCurrency] = useState<Currency>("INR")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const balance = user?.walletBalance || 0

  const setBalance = (newAmount: number) => {
    if (user) {
      const updatedUser = { ...user, walletBalance: newAmount }
      setUser(updatedUser)
      localStorage.setItem("app-user", JSON.stringify(updatedUser))
    }
  }

  const t = (key: TranslationKey): string => {
    if (!translations || !translations[language]) return key as string
    const langData = translations[language]
    // @ts-ignore
    return langData[key] || key
  }

  const formatCurrency = (amount: number): string => {
    const formatter = new Intl.NumberFormat(language === "hi" ? "en-IN" : "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    })
    return formatter.format(amount)
  }

  useEffect(() => {
    const savedLang = localStorage.getItem("app-language") as Language
    const savedCurr = localStorage.getItem("app-currency") as Currency
    const savedUser = localStorage.getItem("app-user")

    if (savedLang) setLanguage(savedLang)
    if (savedCurr) setCurrency(savedCurr)

    if (savedUser && savedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setIsLoggedIn(true)
      } catch (err) {
        localStorage.removeItem("app-user")
      }
    }
  }, [])

  const login = async (userData: any) => {
    if (!userData) {
      console.error("Login failed: invalid user object")
      return
    }
    const kycStatus = userData?.kyc?.status ?? userData?.kycStatus ?? "none"
    const walletBalance = userData?.walletBalance ?? userData?.balance ?? 50000

    const finalUser: User = {
      _id: userData._id || "temp-id",
      name: userData.name || "User",
      email: userData.email,
      phone: userData.phone,
      avatar: userData.avatar,
      walletBalance: walletBalance,
      kycStatus,
    }

    setUser(finalUser)
    setIsLoggedIn(true)
    localStorage.setItem("app-user", JSON.stringify(finalUser))
  }

  const logout = () => {
    setUser(null)
    setIsLoggedIn(false)
    localStorage.removeItem("app-user")
    window.location.href = "/"
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        language,
        setLanguage: (lang) => {
          setLanguage(lang)
          localStorage.setItem("app-language", lang)
        },
        currency,
        setCurrency: (curr) => {
          setCurrency(curr)
          localStorage.setItem("app-currency", curr)
        },
        balance,
        setBalance,
        isLoggedIn,
        login,
        logout,
        t,
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}