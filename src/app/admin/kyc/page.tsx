"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Shield, 
  Loader2, 
  CheckCircle,
  XCircle,
  User,
  FileText,
  Clock
} from "lucide-react"

interface KYCRequest {
  _id: string
  name: string
  email: string
  kycStatus: "pending" | "verified" | "rejected"
  kycData: {
    fullName: string
    panNumber?: string
    aadhaarNumber?: string
    bankAccountNumber?: string
    ifscCode?: string
    bankName?: string
  }
  createdAt: string
  updatedAt: string
}

export default function KYCPage() {
  const [requests, setRequests] = useState<KYCRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"pending" | "all">("pending")
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchKYCRequests()
  }, [])

  const fetchKYCRequests = async () => {
    try {
      const res = await fetch("/api/admin/kyc")
      const data = await res.json()
      if (data.success) {
        setRequests(data.requests)
      }
    } catch (err) {
      console.error("Failed to fetch KYC requests:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    setProcessing(userId)
    try {
      const res = await fetch("/api/admin/kyc/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "verified" }),
      })

      if (res.ok) {
        setRequests(requests.map(r => 
          r._id === userId ? { ...r, kycStatus: "verified" } : r
        ))
      }
    } catch (err) {
      console.error("Failed to approve KYC:", err)
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: string) => {
    const reason = prompt("Enter rejection reason (optional):")
    
    setProcessing(userId)
    try {
      const res = await fetch("/api/admin/kyc/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: "rejected", reason }),
      })

      if (res.ok) {
        setRequests(requests.map(r => 
          r._id === userId ? { ...r, kycStatus: "rejected" } : r
        ))
      }
    } catch (err) {
      console.error("Failed to reject KYC:", err)
    } finally {
      setProcessing(null)
    }
  }

  const filteredRequests = filter === "pending" 
    ? requests.filter(r => r.kycStatus === "pending")
    : requests

  const pendingCount = requests.filter(r => r.kycStatus === "pending").length

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">KYC Approvals</h1>
          <p className="text-muted-foreground">Review and approve user verification requests</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            className={filter === "pending" ? "bg-green-500 text-black" : "border-border"}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-green-500 text-black" : "border-border"}
          >
            All
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No KYC Requests</h3>
          <p className="text-muted-foreground">
            {filter === "pending" ? "No pending verifications" : "No KYC submissions yet"}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request._id} className="bg-card border-border p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold text-lg">
                    {request.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{request.name}</h3>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-xs text-muted-foreground/60">
                        Submitted {new Date(request.updatedAt || request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  {request.kycStatus === "verified" && (
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                  {request.kycStatus === "rejected" && (
                    <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-bold flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      Rejected
                    </span>
                  )}
                  {request.kycStatus === "pending" && (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* KYC Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-background rounded-xl p-4 mb-4">
                {request.kycData?.fullName && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Full Name</p>
                    <p className="text-foreground flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground/60" />
                      {request.kycData.fullName}
                    </p>
                  </div>
                )}
                {request.kycData?.panNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">PAN Number</p>
                    <p className="text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground/60" />
                      {request.kycData.panNumber}
                    </p>
                  </div>
                )}
                {request.kycData?.aadhaarNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Aadhaar Number</p>
                    <p className="text-foreground flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground/60" />
                      {request.kycData.aadhaarNumber}
                    </p>
                  </div>
                )}
                {request.kycData?.bankAccountNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Bank Account</p>
                    <p className="text-foreground">{request.kycData.bankAccountNumber}</p>
                  </div>
                )}
                {request.kycData?.ifscCode && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">IFSC Code</p>
                    <p className="text-foreground">{request.kycData.ifscCode}</p>
                  </div>
                )}
                {request.kycData?.bankName && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Bank Name</p>
                    <p className="text-foreground">{request.kycData.bankName}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {request.kycStatus === "pending" && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleApprove(request._id)}
                    disabled={processing === request._id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold"
                  >
                    {processing === request._id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(request._id)}
                    disabled={processing === request._id}
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
    </div>
  )
}
