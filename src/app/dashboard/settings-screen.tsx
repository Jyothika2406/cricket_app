"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { Lock, Globe, Coins, ChevronRight, Bell, Moon, Shield, Loader2, Sun } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

// FIXED: Export Default
export default function SettingsScreen() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, currency, setCurrency, t, user } = useApp()
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  
  // Notification settings
  const [notifications, setNotifications] = useState(true)
  const [darkModeLoading, setDarkModeLoading] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    fetchUserPreferences()
  }, [session])

  const fetchUserPreferences = async () => {
    try {
      const res = await fetch("/api/user/profile")
      const data = await res.json()
      if (data.success && data.user) {
        // Sync theme from database
        const savedTheme = data.user.darkMode !== false ? "dark" : "light"
        setTheme(savedTheme)
        // Sync language and currency from database
        if (data.user.language) setLanguage(data.user.language)
        if (data.user.currency) setCurrency(data.user.currency)
        if (data.user.notifications !== undefined) setNotifications(data.user.notifications)
      }
    } catch (err) {
      console.error("Failed to fetch preferences:", err)
    }
  }

  const handleDarkModeToggle = async (enabled: boolean) => {
    setDarkModeLoading(true)
    
    // Apply theme using next-themes
    setTheme(enabled ? "dark" : "light")
    
    // Save to database
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode: enabled }),
      })
    } catch (err) {
      console.error("Failed to save dark mode preference:", err)
    } finally {
      setDarkModeLoading(false)
    }
  }

  const handleLanguageChange = async (newLanguage: "en" | "hi") => {
    setLanguage(newLanguage)
    setLanguageOpen(false)
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLanguage }),
      })
    } catch (err) {
      console.error("Failed to save language preference:", err)
    }
  }

  const handleCurrencyChange = async (newCurrency: string) => {
    setCurrency(newCurrency)
    setCurrencyOpen(false)
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: newCurrency }),
      })
    } catch (err) {
      console.error("Failed to save currency preference:", err)
    }
  }

  const handleNotificationsChange = async (enabled: boolean) => {
    setNotifications(enabled)
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifications: enabled }),
      })
    } catch (err) {
      console.error("Failed to save notifications preference:", err)
    }
  }

  const isDarkMode = theme === "dark"

  const handlePasswordChange = async () => {
    setPasswordError("")
    setPasswordSuccess("")
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required")
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }
    
    setPasswordLoading(true)
    
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        setPasswordError(data.message || "Failed to change password")
        return
      }
      
      setPasswordSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      
      setTimeout(() => {
        setPasswordOpen(false)
        setPasswordSuccess("")
      }, 2000)
    } catch (err) {
      setPasswordError("Network error. Please try again.")
    } finally {
      setPasswordLoading(false)
    }
  }

  // Prevent flash of incorrect theme
  if (!mounted) {
    return (
      <div className="p-4 space-y-6">
        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 text-foreground">
      <div>
        <h2 className="text-2xl font-bold">{t("settings")}</h2>
        <p className="text-sm text-muted-foreground">Manage your app preferences</p>
      </div>

      <div className="space-y-3">
        <SettingItem icon={Lock} label={t("changePassword")} value="••••••••" onClick={() => setPasswordOpen(true)} />
        <SettingItem
          icon={Globe}
          label={t("language")}
          value={language === "en" ? "English" : "हिंदी"}
          onClick={() => setLanguageOpen(true)}
        />
        <SettingItem icon={Coins} label={t("currency")} value={currency} onClick={() => setCurrencyOpen(true)} />
        
        {/* Toggle Settings */}
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground">
              <Bell className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm">Push Notifications</span>
          </div>
          <Switch checked={notifications} onCheckedChange={handleNotificationsChange} />
        </div>
        
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            </div>
            <div>
              <span className="font-bold text-sm block">Dark Mode</span>
              <span className="text-[10px] text-muted-foreground">{isDarkMode ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {darkModeLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
            <Switch checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
          </div>
        </div>
        
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-sm block">Two-Factor Auth</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Coming Soon</span>
            </div>
          </div>
          <Switch disabled />
        </div>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="rounded-3xl max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t("changePassword")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {passwordError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm">
                {passwordSuccess}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold">Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="h-12 bg-background border-border rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold">New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="h-12 bg-background border-border rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold">Confirm Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="h-12 bg-background border-border rounded-xl"
              />
            </div>
            <Button
              onClick={handlePasswordChange}
              disabled={passwordLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl"
            >
              {passwordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Language Dialog */}
      <Dialog open={languageOpen} onOpenChange={setLanguageOpen}>
        <DialogContent className="rounded-3xl max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t("language")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <RadioGroup
              value={language}
              onValueChange={(value) => handleLanguageChange(value as "en" | "hi")}
            >
              <div className="flex items-center space-x-3 bg-background p-4 rounded-2xl border border-border">
                <RadioGroupItem value="en" id="lang-en" className="border-foreground text-primary" />
                <Label htmlFor="lang-en" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-bold">English</span>
                  <span className="text-2xl">🇬🇧</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background p-4 rounded-2xl border border-border">
                <RadioGroupItem value="hi" id="lang-hi" className="border-foreground text-primary" />
                <Label htmlFor="lang-hi" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-bold">हिंदी</span>
                  <span className="text-2xl">🇮🇳</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Currency Dialog */}
      <Dialog open={currencyOpen} onOpenChange={setCurrencyOpen}>
        <DialogContent className="rounded-3xl max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{t("currency")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <RadioGroup
              value={currency}
              onValueChange={handleCurrencyChange}
            >
              <div className="flex items-center space-x-3 bg-background p-4 rounded-2xl border border-border">
                <RadioGroupItem value="INR" id="curr-inr" className="border-foreground text-primary" />
                <Label htmlFor="curr-inr" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-bold">Indian Rupee</span>
                  <span className="text-xl">₹</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background p-4 rounded-2xl border border-border">
                <RadioGroupItem value="USD" id="curr-usd" className="border-foreground text-primary" />
                <Label htmlFor="curr-usd" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-bold">US Dollar</span>
                  <span className="text-xl">$</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background p-4 rounded-2xl border border-border">
                <RadioGroupItem value="EUR" id="curr-eur" className="border-foreground text-primary" />
                <Label htmlFor="curr-eur" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-bold">Euro</span>
                  <span className="text-xl">€</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 bg-background p-4 rounded-2xl border border-border">
                <RadioGroupItem value="GBP" id="curr-gbp" className="border-foreground text-primary" />
                <Label htmlFor="curr-gbp" className="flex items-center gap-2 cursor-pointer flex-1">
                  <span className="font-bold">British Pound</span>
                  <span className="text-xl">£</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SettingItem({ icon: Icon, label, value, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-muted"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{value}</span>}
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  )
}
