"use client"

import { useState, useEffect } from "react"
import { useApp } from "@/contexts/app-context"
import { History, TrendingUp, TrendingDown, Clock } from "lucide-react"

export default function BetHistoryScreen() {
  const { user, formatCurrency } = useApp()
  const [bets, setBets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?._id) return

    // Fetch user's betting history from the correct API
    fetch("/api/user/bet-history")
      .then((res) => res.json())
      .then((data) => {
        const bettingData = Array.isArray(data.bets) ? data.bets : []
        setBets(bettingData)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch bets", err)
        setLoading(false)
      })
  }, [user?._id])

  return (
    <div className="p-4 space-y-6 pb-24 bg-background min-h-screen text-foreground">
      <header>
        <h2 className="text-2xl font-black italic uppercase text-foreground">MY BETS</h2>
        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold">Track your predictions</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-muted-foreground text-sm">Loading history...</p>
        </div>
      ) : bets.length === 0 ? (
        <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
          <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground font-bold">No bets found</p>
          <p className="text-muted-foreground/70 text-xs mt-1">Start predicting matches to see them here!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bets.map((bet) => (
            <BetCard key={bet._id} bet={bet} formatCurrency={formatCurrency} />
          ))}
        </div>
      )}
    </div>
  )
}

function BetCard({ bet, formatCurrency }: { bet: any, formatCurrency: any }) {
  const isWon = bet.status === "won"
  const isPending = bet.status === "pending"

  return (
    <div className="bg-card border border-border p-5 rounded-2xl shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Market ID: {bet.questionId?.slice(-6) || "N/A"}</p>
          <p className="font-bold text-foreground text-sm leading-tight">{bet.questionText || "Match Prediction"}</p>
        </div>
        <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${isWon ? "bg-green-500/10 text-green-500" :
            isPending ? "bg-yellow-500/10 text-yellow-500" : "bg-red-500/10 text-red-500"
          }`}>
          {bet.status}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-4">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Selection</p>
          <p className="text-sm font-black text-foreground">{bet.selectedOption}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Wager</p>
          <p className="text-sm font-black text-foreground">{formatCurrency(bet.amount)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground uppercase font-bold">Payout</p>
          <p className={`text-sm font-black ${isWon ? "text-green-500" : "text-muted-foreground"}`}>
            {isWon ? formatCurrency(bet.payout) : isPending ? "Waiting..." : "₹0"}
          </p>
        </div>
      </div>
    </div>
  )
}