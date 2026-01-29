"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Zap, Trophy, Clock, Loader2, Wallet, Shield, Lock } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { CountdownTimer } from "@/components/countdown-timer"

interface Match {
  _id: string
  title: string
  team1: string
  team2: string
  startTime: string
  status: "upcoming" | "live" | "completed"
  bettingAllowed?: boolean
  questions: {
    _id: string
    text: string
    options: { text: string; odds: number }[]
    status: "open" | "closed" | "settled"
  }[]
}

interface HomeScreenProps {
  onNavigate?: (screen: string) => void
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const { data: session } = useSession()
  const { user, setUser } = useApp()
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [betDialogOpen, setBetDialogOpen] = useState(false)
  const [selectedBet, setSelectedBet] = useState<{
    matchId: string
    questionId: string
    questionText: string
    optionIndex: number
    optionText: string
    odds: number
  } | null>(null)
  const [betAmount, setBetAmount] = useState("")
  const [placing, setPlacing] = useState(false)

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch("/api/matches")
        if (res.ok) {
          const data = await res.json()
          setMatches(data.matches || [])
        }
      } catch (error) {
        console.error("Error loading matches", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMatches()
    // Refresh every 30 seconds
    const interval = setInterval(fetchMatches, 30000)
    return () => clearInterval(interval)
  }, [])

  const openBetDialog = (
    matchId: string,
    questionId: string,
    questionText: string,
    optionIndex: number,
    optionText: string,
    odds: number
  ) => {
    setSelectedBet({ matchId, questionId, questionText, optionIndex, optionText, odds })
    setBetAmount("")
    setBetDialogOpen(true)
  }

  const handlePlaceBet = async () => {
    if (!selectedBet || !betAmount) return

    const amount = Number(betAmount)
    if (isNaN(amount) || amount < 10) {
      alert("Minimum bet is ₹10")
      return
    }

    if (user && amount > user.walletBalance) {
      alert("Insufficient balance")
      return
    }

    setPlacing(true)
    try {
      const res = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: selectedBet.matchId,
          questionId: selectedBet.questionId,
          selectedOption: selectedBet.optionIndex,
          amount,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        alert(`✅ Bet placed! Potential win: ₹${(amount * selectedBet.odds).toFixed(0)}`)
        setBetDialogOpen(false)
        // Update user balance
        if (user) {
          setUser({ ...user, walletBalance: user.walletBalance - amount })
        }
      } else {
        alert("❌ " + (data.message || "Failed to place bet"))
      }
    } catch (error) {
      alert("Network Error")
    } finally {
      setPlacing(false)
    }
  }

  const potentialWin = selectedBet && betAmount 
    ? (Number(betAmount) * selectedBet.odds).toFixed(0)
    : "0"

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Wallet Balance */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-green-100 text-xs uppercase">Wallet Balance</p>
            <p className="text-2xl font-bold text-white">₹{user?.walletBalance?.toLocaleString() || 0}</p>
          </div>
        </div>
        <Button size="sm" className="bg-white text-green-700 hover:bg-green-50 font-bold" onClick={() => onNavigate?.("wallet")}>
          Add Money
        </Button>
      </div>

      {/* Admin Panel Button - Only for admins */}
      {session?.user?.role === "admin" && (
        <Link href="/admin">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-purple-100 text-xs uppercase">You are Admin</p>
                <p className="text-lg font-bold text-white">Go to Admin Panel →</p>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 text-white shadow-lg">
        <div className="relative z-10">
          <Badge className="mb-2 bg-yellow-500 text-black hover:bg-yellow-400">Featured</Badge>
          <h1 className="text-2xl font-black italic">LIVE BETTING</h1>
          <p className="text-yellow-100 text-sm mb-4">Place bets on live matches</p>
        </div>
        <Trophy className="absolute right-[-10px] bottom-[-20px] h-32 w-32 text-white/10 rotate-12" />
      </div>

      {/* Live Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-yellow-500">
          <Zap className="h-5 w-5 fill-current" />
          <h2 className="text-sm font-bold tracking-wider uppercase">Live Matches</h2>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-2xl border border-border">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No live matches right now.</p>
            <p className="text-muted-foreground/70 text-sm">Check back later!</p>
          </div>
        ) : (
          matches.map((match) => {
            // Check if betting is allowed (only for upcoming matches that haven't started)
            const matchStartTime = new Date(match.startTime)
            const now = new Date()
            const isBettingAllowed = match.status === "upcoming" && matchStartTime > now
            
            return (
            <Card key={match._id} className="bg-card border-border overflow-hidden">
              <div className="bg-muted px-4 py-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground">{match.title}</h3>
                  <p className="text-xs text-muted-foreground">{match.team1} vs {match.team2}</p>
                </div>
                <CountdownTimer 
                  startTime={match.startTime} 
                  status={match.status}
                  onStatusChange={() => {
                    // Refresh matches when status changes
                    setMatches(prev => prev.map(m => 
                      m._id === match._id ? { ...m, status: "live" as const } : m
                    ))
                  }}
                />
              </div>
              
              <CardContent className="p-4 space-y-4">
                {/* Show betting closed message for live/completed matches */}
                {!isBettingAllowed && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-sm font-medium">
                      {match.status === "live" ? "Betting closed - Match is LIVE" : "Betting closed - Match completed"}
                    </p>
                  </div>
                )}
                
                {match.questions.filter(q => q.status === "open").length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No open betting questions</p>
                ) : (
                  match.questions.filter(q => q.status === "open").map((q) => (
                    <div key={q._id} className="bg-background rounded-xl p-4 space-y-3">
                      <p className="font-medium text-foreground">{q.text}</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {q.options.map((opt, idx) => (
                          <Button
                            key={idx}
                            onClick={() => isBettingAllowed && openBetDialog(match._id, q._id, q.text, idx, opt.text, opt.odds)}
                            variant="outline"
                            disabled={!isBettingAllowed}
                            className={`h-14 border-border transition-all flex flex-col items-start justify-center px-4 ${
                              isBettingAllowed 
                                ? "bg-card hover:bg-muted hover:border-green-500 cursor-pointer" 
                                : "bg-muted/50 cursor-not-allowed opacity-60"
                            }`}
                          >
                            <span className="font-bold text-foreground text-sm">{opt.text}</span>
                            <span className="text-xs font-mono text-green-500">@{opt.odds}x</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )})
        )}
      </div>

      {/* Bet Dialog */}
      <Dialog open={betDialogOpen} onOpenChange={setBetDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Place Your Bet</DialogTitle>
          </DialogHeader>
          
          {selectedBet && (
            <div className="space-y-4 py-4">
              <div className="bg-background rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Question</p>
                <p className="text-foreground font-medium">{selectedBet.questionText}</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-sm text-green-400 mb-1">Your Selection</p>
                <div className="flex items-center justify-between">
                  <p className="text-foreground font-bold">{selectedBet.optionText}</p>
                  <span className="text-green-500 font-mono">@{selectedBet.odds}x</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase font-bold">Bet Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="h-14 pl-8 bg-background border-border rounded-xl text-foreground text-lg"
                  />
                </div>
                <div className="flex gap-2">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(String(amt))}
                      className="flex-1 py-2 bg-muted rounded-lg text-xs font-bold text-muted-foreground hover:bg-accent"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-muted rounded-xl p-4 flex items-center justify-between">
                <span className="text-muted-foreground">Potential Win</span>
                <span className="text-2xl font-bold text-green-500">₹{potentialWin}</span>
              </div>

              <Button
                onClick={handlePlaceBet}
                disabled={placing || !betAmount}
                className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl"
              >
                {placing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Placing Bet...
                  </>
                ) : (
                  `Place Bet - ₹${betAmount || 0}`
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}