"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Loader2, 
  CheckCircle,
  XCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  User,
  RefreshCw
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Transaction {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
    phone?: string
    walletBalance: number
  }
  type: "deposit" | "withdraw"
  amount: number
  method: string
  status: "pending" | "approved" | "completed" | "rejected"
  utrNumber?: string
  referenceNumber?: string
  withdrawalDetails?: {
    bankAccountNumber?: string
    ifscCode?: string
    bankName?: string
    upiId?: string
    accountHolderName?: string
  }
  createdAt: string
  processedAt?: string
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"pending" | "all">("pending")
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdraw">("all")
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    fetchTransactions()
  }, [filter, typeFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== "all") params.set("type", typeFilter)
      if (filter !== "all") params.set("status", filter)

      const res = await fetch(`/api/admin/transactions?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setTransactions(data.transactions)
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (txId: string) => {
    setProcessing(txId)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: txId, action: "approve" }),
      })

      const data = await res.json()
      if (data.success) {
        await fetchTransactions()
      } else {
        alert(data.message || "Failed to approve")
      }
    } catch (err) {
      console.error("Failed to approve:", err)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async () => {
    if (!selectedTx) return
    
    setProcessing(selectedTx._id)
    try {
      const res = await fetch("/api/admin/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactionId: selectedTx._id, 
          action: "reject",
          rejectionReason: rejectReason 
        }),
      })

      const data = await res.json()
      if (data.success) {
        await fetchTransactions()
        setRejectOpen(false)
        setRejectReason("")
        setSelectedTx(null)
      } else {
        alert(data.message || "Failed to reject")
      }
    } catch (err) {
      console.error("Failed to reject:", err)
    } finally {
      setProcessing(null)
    }
  }

  const openRejectDialog = (tx: Transaction) => {
    setSelectedTx(tx)
    setRejectOpen(true)
  }

  const pendingCount = transactions.filter(t => t.status === "pending").length
  const depositPending = transactions.filter(t => t.type === "deposit" && t.status === "pending").length
  const withdrawPending = transactions.filter(t => t.type === "withdraw" && t.status === "pending").length

  const filteredTransactions = transactions.filter(t => {
    if (filter === "pending" && t.status !== "pending") return false
    if (typeFilter !== "all" && t.type !== typeFilter) return false
    return true
  })

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Manage deposits and withdrawals</p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" className="border-border gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/20 p-4">
          <p className="text-xs text-yellow-500 font-bold uppercase">Pending</p>
          <p className="text-2xl font-black text-foreground">{pendingCount}</p>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20 p-4">
          <p className="text-xs text-green-500 font-bold uppercase">Deposits Pending</p>
          <p className="text-2xl font-black text-foreground">{depositPending}</p>
        </Card>
        <Card className="bg-red-500/10 border-red-500/20 p-4">
          <p className="text-xs text-red-500 font-bold uppercase">Withdrawals Pending</p>
          <p className="text-2xl font-black text-foreground">{withdrawPending}</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          className={filter === "pending" ? "bg-green-500 text-black" : "border-border"}
          size="sm"
        >
          Pending
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-green-500 text-black" : "border-border"}
          size="sm"
        >
          All
        </Button>
        <div className="w-px bg-border mx-2" />
        <Button
          variant={typeFilter === "all" ? "default" : "outline"}
          onClick={() => setTypeFilter("all")}
          className={typeFilter === "all" ? "bg-blue-500 text-white" : "border-border"}
          size="sm"
        >
          All Types
        </Button>
        <Button
          variant={typeFilter === "deposit" ? "default" : "outline"}
          onClick={() => setTypeFilter("deposit")}
          className={typeFilter === "deposit" ? "bg-green-500 text-black" : "border-border"}
          size="sm"
        >
          Deposits
        </Button>
        <Button
          variant={typeFilter === "withdraw" ? "default" : "outline"}
          onClick={() => setTypeFilter("withdraw")}
          className={typeFilter === "withdraw" ? "bg-red-500 text-white" : "border-border"}
          size="sm"
        >
          Withdrawals
        </Button>
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Transactions</h3>
          <p className="text-muted-foreground">
            {filter === "pending" ? "No pending transactions" : "No transactions found"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => (
            <Card key={tx._id} className="bg-card border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === "deposit" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                    {tx.type === "deposit" ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground capitalize">{tx.type}</h3>
                    <p className="text-2xl font-black text-foreground">₹{tx.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  {tx.status === "pending" && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                  {tx.status === "completed" && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  )}
                  {tx.status === "rejected" && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-bold flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="bg-background rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">User Details</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Name</p>
                    <p className="text-foreground font-bold">{tx.userId?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Email</p>
                    <p className="text-foreground">{tx.userId?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Phone</p>
                    <p className="text-foreground">{tx.userId?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Current Balance</p>
                    <p className="text-green-500 font-bold">₹{(tx.userId?.walletBalance || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              {tx.type === "deposit" && tx.utrNumber && (
                <div className="bg-background/50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-muted-foreground">UTR Number</p>
                  <p className="text-foreground font-mono">{tx.utrNumber}</p>
                </div>
              )}

              {tx.type === "withdraw" && tx.withdrawalDetails && (
                <div className="bg-background/50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Withdrawal To</p>
                  {tx.withdrawalDetails.upiId ? (
                    <p className="text-foreground font-mono">UPI: {tx.withdrawalDetails.upiId}</p>
                  ) : tx.withdrawalDetails.bankAccountNumber ? (
                    <div className="text-sm">
                      <p className="text-foreground">A/C: {tx.withdrawalDetails.bankAccountNumber}</p>
                      <p className="text-muted-foreground">IFSC: {tx.withdrawalDetails.ifscCode}</p>
                      <p className="text-muted-foreground">{tx.withdrawalDetails.bankName}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No payment details</p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {tx.status === "pending" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(tx._id)}
                    disabled={processing === tx._id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold"
                  >
                    {processing === tx._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => openRejectDialog(tx)}
                    disabled={processing === tx._id}
                    variant="outline"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-muted-foreground text-sm">
              Are you sure you want to reject this {selectedTx?.type} of ₹{selectedTx?.amount?.toLocaleString()}?
            </p>
            <div className="space-y-2">
              <Label>Rejection Reason (Optional)</Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason..."
                className="bg-background border-border"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setRejectOpen(false)}
                variant="outline"
                className="flex-1 border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={!!processing}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Reject"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
