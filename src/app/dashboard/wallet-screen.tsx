"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowUpRight,
  ArrowDownLeft,
  History,
  CreditCard,
  Copy,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ADMIN_UPI_ID = "drnoelkmathew@okicici"

export default function WalletScreen() {
  const { formatCurrency, user, setUser } = useApp()
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [utrNumber, setUtrNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [transactions, setTransactions] = useState<any[]>([])
  const [loadingTx, setLoadingTx] = useState(true)

  // Fetch Transactions
  useEffect(() => {
    fetchTransactions()
  }, [user?._id])

  const fetchTransactions = async () => {
    if (!user?._id) return
    setLoadingTx(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id }),
      })
      const data = await res.json()
      if (Array.isArray(data)) {
        setTransactions(data)
      } else {
        setTransactions([])
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err)
      setTransactions([])
    } finally {
      setLoadingTx(false)
    }
  }

  // Copy UPI ID
  const copyUpi = () => {
    navigator.clipboard.writeText(ADMIN_UPI_ID)
    alert("UPI ID Copied!")
  }

  // Handle Deposit Request
  const handleDeposit = async () => {
    setError("")
    setSuccess("")

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number(amount) < 100) {
      setError("Minimum deposit amount is ₹100")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          utrNumber,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Deposit request failed")
        return
      }

      setSuccess("Deposit request submitted! Waiting for admin approval.")
      setAmount("")
      setUtrNumber("")
      
      // Refresh transactions
      await fetchTransactions()

      setTimeout(() => {
        setDepositOpen(false)
        setSuccess("")
      }, 3000)

    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Handle Withdrawal Request
  const handleWithdraw = async () => {
    setError("")
    setSuccess("")

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (Number(amount) < 500) {
      setError("Minimum withdrawal amount is ₹500")
      return
    }

    if (Number(amount) > (user?.walletBalance || 0)) {
      setError("Insufficient balance")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/user/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Withdrawal request failed")
        return
      }

      setSuccess("Withdrawal request submitted! Waiting for admin approval.")
      setAmount("")
      
      // Refresh transactions
      await fetchTransactions()

      setTimeout(() => {
        setWithdrawOpen(false)
        setSuccess("")
      }, 3000)

    } catch (e: any) {
      setError(e.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  // Get pending transactions count
  const pendingDeposits = transactions.filter(t => t.type === "deposit" && t.status === "pending").length
  const pendingWithdrawals = transactions.filter(t => t.type === "withdraw" && t.status === "pending").length

  return (
    <div className="p-4 space-y-6 pb-20 text-foreground bg-background min-h-screen">
      {/* Wallet Card */}
      <div className="bg-green-600 p-6 rounded-[2rem] text-white shadow-2xl shadow-green-900/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <CreditCard className="w-24 h-24 rotate-12" />
        </div>
        <p className="text-xs uppercase tracking-widest font-bold opacity-80 mb-1">Total Balance</p>
        <h2 className="text-4xl font-black mb-6">{formatCurrency(user?.walletBalance || 0)}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/20 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] uppercase font-bold opacity-70 text-white/80">Pending Deposits</p>
            <p className="text-lg font-bold">{pendingDeposits}</p>
          </div>
          <div className="bg-black/20 p-3 rounded-2xl backdrop-blur-sm">
            <p className="text-[10px] uppercase font-bold opacity-70 text-white/80">Pending Withdrawals</p>
            <p className="text-lg font-bold">{pendingWithdrawals}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          className="h-14 rounded-2xl gap-2 font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90" 
          size="lg" 
          onClick={() => { setDepositOpen(true); setError(""); setSuccess("") }}
        >
          <ArrowDownLeft className="w-5 h-5" /> Deposit
        </Button>
        <Button
          variant="outline"
          className="h-14 rounded-2xl gap-2 font-bold border-border hover:bg-muted text-foreground bg-card"
          size="lg"
          onClick={() => { setWithdrawOpen(true); setError(""); setSuccess("") }}
        >
          <ArrowUpRight className="w-5 h-5" /> Withdraw
        </Button>
      </div>

      {/* Transactions List */}
      <section className="space-y-4">
        <h3 className="font-bold flex items-center gap-2 text-foreground">
          <History className="w-4 h-4 text-green-500" /> Recent Transactions
        </h3>
        <div className="space-y-3">
          {loadingTx ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 bg-card rounded-2xl border border-border">
              <History className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            transactions.slice(0, 10).map((tx) => (
              <TransactionItem key={tx._id} {...tx} formatCurrency={formatCurrency} />
            ))
          )}
        </div>
      </section>

      {/* DEPOSIT DIALOG - No QR, Only UPI ID */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="rounded-3xl max-w-sm bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Add Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            <div className="space-y-2 text-center">
              <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Step 1: Copy UPI ID & Pay</p>
              <div className="flex items-center gap-2 bg-background border border-border p-4 rounded-xl">
                <code className="flex-1 font-mono text-green-500 text-sm text-left">{ADMIN_UPI_ID}</code>
                <button onClick={copyUpi} className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Copy size={18} className="text-muted-foreground hover:text-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Pay using any UPI app (GPay, PhonePe, Paytm, etc.)</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Step 2: Enter Amount Paid</Label>
              <Input
                type="number"
                placeholder="Min ₹100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-xl bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">UTR/Reference Number (Optional)</Label>
              <Input
                type="text"
                placeholder="Enter UTR for faster verification"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                className="h-12 rounded-xl bg-background border-border text-foreground"
              />
            </div>

            <Button 
              onClick={handleDeposit} 
              disabled={loading} 
              className="w-full h-12 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : "I Have Paid"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your balance will be updated after admin verification (5-30 mins)
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* WITHDRAW DIALOG */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="rounded-3xl max-w-sm bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Withdraw Funds</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            <div className="bg-background/40 p-4 rounded-2xl border border-border">
              <p className="text-xs text-muted-foreground mb-1">Available to Withdraw</p>
              <p className="text-2xl font-bold text-green-500">{formatCurrency(user?.walletBalance || 0)}</p>
            </div>

            {/* KYC Warning */}
            {user?.kycStatus !== "verified" && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-3 rounded-xl text-sm">
                ⚠️ Complete KYC verification to enable withdrawals
              </div>
            )}

            <div className="space-y-2">
              <Label>Withdrawal Amount</Label>
              <Input
                type="number"
                placeholder="Min ₹500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 rounded-xl bg-background border-border text-foreground"
              />
            </div>

            <Button 
              onClick={handleWithdraw} 
              disabled={loading || user?.kycStatus !== "verified"} 
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</> : "Submit Request"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Withdrawals are processed within 24 hours after admin approval
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TransactionItem({ type, amount, method, createdAt, status, formatCurrency }: any) {
  const isDeposit = type === "deposit"
  const isWithdraw = type === "withdraw"

  const getStatusColor = () => {
    switch (status) {
      case "completed":
      case "approved":
        return "text-green-500"
      case "pending":
        return "text-yellow-500"
      case "rejected":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircle className="w-3 h-3" />
      case "pending":
        return <Clock className="w-3 h-3" />
      default:
        return null
    }
  }

  return (
    <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDeposit ? "bg-green-500/10 text-green-500" : isWithdraw ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"}`}>
          {isDeposit ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div>
          <p className="font-bold text-sm capitalize">{type}</p>
          <p className="text-[10px] text-muted-foreground">
            {createdAt ? new Date(createdAt).toLocaleDateString() : ""}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-black text-sm ${isDeposit ? "text-green-500" : "text-foreground"}`}>
          {isDeposit ? "+" : "-"}{formatCurrency(amount)}
        </p>
        <p className={`text-[10px] font-bold uppercase flex items-center gap-1 justify-end ${getStatusColor()}`}>
          {getStatusIcon()}
          {status}
        </p>
      </div>
    </div>
  )
}
