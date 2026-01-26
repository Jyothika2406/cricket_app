"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Trophy, Gift, Check, Loader2 } from "lucide-react"

interface UserData {
  referralCode: string
  referralCount: number
  referralEarnings: number
}

export default function ReferScreen() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const REFERRAL_BONUS = 500 // ₹500 per referral

  useEffect(() => {
    fetchUserData()
  }, [session])

  const fetchUserData = async () => {
    try {
      const res = await fetch("/api/user/profile")
      const data = await res.json()
      if (data.success && data.user) {
        setUserData({
          referralCode: data.user.referralCode || "LOADING...",
          referralCount: data.user.referralCount || 0,
          referralEarnings: data.user.referralEarnings || 0,
        })
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = async () => {
    if (!userData?.referralCode) return
    try {
      await navigator.clipboard.writeText(userData.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = userData.referralCode
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareViaWhatsApp = () => {
    if (!userData?.referralCode) return
    
    const appUrl = typeof window !== "undefined" ? window.location.origin : ""
    const message = `🏏 Join CricBet Skill - India's #1 Cricket Betting App!\n\n🎁 Use my referral code: ${userData.referralCode}\n💰 Get ₹${REFERRAL_BONUS} bonus on signup!\n\n📲 Download now: ${appUrl}\n\nStart winning today! 🏆`
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const shareNative = async () => {
    if (!userData?.referralCode) return
    
    const appUrl = typeof window !== "undefined" ? window.location.origin : ""
    const shareData = {
      title: "CricBet Skill - Refer & Earn",
      text: `Join CricBet Skill with my referral code: ${userData.referralCode} and get ₹${REFERRAL_BONUS} bonus!`,
      url: appUrl,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or share failed, fallback to WhatsApp
        shareViaWhatsApp()
      }
    } else {
      shareViaWhatsApp()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="text-center py-6">
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
          <Gift className="w-12 h-12 text-green-500" />
          <div className="absolute -top-1 -right-1 bg-yellow-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-background">
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Refer & Earn ₹{REFERRAL_BONUS}</h2>
        <p className="text-muted-foreground text-sm px-8">
          Share the winning experience with friends and earn rewards for every signup.
        </p>
      </div>

      <div className="bg-card/50 p-6 rounded-[2rem] space-y-4 border border-green-500/20">
        <p className="text-xs text-center font-bold text-muted-foreground uppercase tracking-widest">
          Your Referral Code
        </p>
        <div className="flex gap-2">
          <div className="flex-1 bg-background rounded-2xl border border-dashed border-green-500/50 flex items-center justify-center font-mono font-black text-xl tracking-widest py-4 text-green-500">
            {userData?.referralCode || "LOADING..."}
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={copyReferralCode}
            className="w-14 h-auto rounded-2xl bg-card border-border hover:bg-muted text-foreground"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
        {copied && (
          <p className="text-center text-green-500 text-sm">Referral code copied!</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card p-4 rounded-3xl text-center border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Total Referrals</p>
          <p className="text-2xl font-black text-foreground">{userData?.referralCount || 0}</p>
        </div>
        <div className="bg-card p-4 rounded-3xl text-center border border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Earned Rewards</p>
          <p className="text-2xl font-black text-green-500">₹{(userData?.referralEarnings || 0).toLocaleString()}</p>
        </div>
      </div>

      <Button 
        onClick={shareViaWhatsApp}
        className="w-full h-14 rounded-2xl gap-2 text-lg font-bold shadow-xl shadow-green-900/20 bg-green-500 hover:bg-green-600 text-black"
      >
        <Share2 className="w-5 h-5" /> Share via WhatsApp
      </Button>

      <Button 
        onClick={shareNative}
        variant="outline"
        className="w-full h-12 rounded-2xl gap-2 font-bold border-border text-foreground hover:bg-muted"
      >
        <Share2 className="w-4 h-4" /> More Share Options
      </Button>

      <section className="pt-4 text-foreground">
        <h4 className="font-bold mb-4">How it works?</h4>
        <div className="space-y-4">
          {[
            { step: 1, text: "Share your code with friends" },
            { step: 2, text: "They register & complete KYC" },
            { step: 3, text: "You both get rewarded instantly" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center font-bold text-xs border border-green-500/20">
                {item.step}
              </div>
              <p className="text-sm font-medium text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
