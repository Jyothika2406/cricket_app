"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/contexts/app-context"
import { Shield, CheckCircle, Clock, XCircle, Upload, Loader2, CreditCard, Smartphone, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type KYCStatus = "none" | "pending" | "submitted" | "verified" | "rejected"

export function KYCScreen() {
  const { user, setUser } = useApp()
  const [mounted, setMounted] = useState(false)
  const [kycStatus, setKycStatus] = useState<KYCStatus>("none")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Form fields - Identity
  const [fullName, setFullName] = useState("")
  const [pan, setPan] = useState("")
  const [aadhaar, setAadhaar] = useState("")

  // Form fields - Bank Account
  const [bankAccount, setBankAccount] = useState("")
  const [ifsc, setIfsc] = useState("")
  const [bankName, setBankName] = useState("")

  // Form fields - UPI
  const [upiId, setUpiId] = useState("")

  // Verification states
  const [bankVerified, setBankVerified] = useState(false)
  const [upiVerified, setUpiVerified] = useState(false)

  // Mount check to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    if (user) {
      setKycStatus(user.kycStatus || "none")
      setFullName(user.name || "")
    }
  }, [user])

  // Real-time status polling
  useEffect(() => {
    if (!mounted) return
    
    if (kycStatus === "submitted" || kycStatus === "pending") {
      const interval = setInterval(async () => {
        try {
          const res = await fetch("/api/user/kyc/status")
          if (res.ok) {
            const data = await res.json()
            setKycStatus(data.status)
            setBankVerified(data.bankVerified || false)
            setUpiVerified(data.upiVerified || false)
            if (data.status === "verified" || data.status === "rejected") {
              if (user) {
                setUser({ ...user, kycStatus: data.status })
              }
              clearInterval(interval)
            }
          }
        } catch (err) {
          console.error("Failed to poll KYC status", err)
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [kycStatus, user, setUser, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    // Validation
    if (!fullName || !pan || !aadhaar) {
      setError("Full Name, PAN and Aadhaar are required")
      setLoading(false)
      return
    }

    if (pan.length !== 10) {
      setError("PAN must be 10 characters")
      setLoading(false)
      return
    }

    if (aadhaar.length !== 12) {
      setError("Aadhaar must be 12 digits")
      setLoading(false)
      return
    }

    // Must have either Bank OR UPI
    const hasBankDetails = bankAccount && ifsc
    const hasUpiDetails = upiId

    if (!hasBankDetails && !hasUpiDetails) {
      setError("Please provide either Bank Account OR UPI ID for withdrawals")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/user/kyc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName, 
          pan, 
          aadhaar, 
          bankAccount, 
          ifsc,
          bankName,
          upiId 
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Submission failed")
        return
      }

      setSuccess("KYC submitted successfully! Verification in progress...")
      setKycStatus("pending")
      
      if (user) {
        setUser({ ...user, kycStatus: "pending" })
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const renderStatusBadge = () => {
    switch (kycStatus) {
      case "verified":
        return (
          <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-xl">
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold uppercase text-sm">Verified</span>
          </div>
        )
      case "submitted":
      case "pending":
        return (
          <div className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-xl">
            <Clock className="w-5 h-5 animate-pulse" />
            <span className="font-bold uppercase text-sm">Under Review</span>
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl">
            <XCircle className="w-5 h-5" />
            <span className="font-bold uppercase text-sm">Rejected</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-xl">
            <Shield className="w-5 h-5" />
            <span className="font-bold uppercase text-sm">Not Verified</span>
          </div>
        )
    }
  }

  // Show loading until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }

  // Already verified view
  if (kycStatus === "verified") {
    return (
      <div className="space-y-6 text-center py-10">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-black text-foreground">KYC Verified</h3>
        <p className="text-muted-foreground text-sm">Your identity has been successfully verified. You have full access to all features.</p>
        
        <div className="flex flex-col gap-2 items-center">
          {renderStatusBadge()}
          
          <div className="flex gap-2 mt-4">
            {bankVerified && (
              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold">
                <CreditCard className="w-3 h-3" /> Bank Verified
              </div>
            )}
            {upiVerified && (
              <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-bold">
                <Smartphone className="w-3 h-3" /> UPI Verified
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Pending/Submitted view
  if (kycStatus === "submitted" || kycStatus === "pending") {
    return (
      <div className="space-y-6 text-center py-10">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
        </div>
        <h3 className="text-2xl font-black text-foreground">Verification in Progress</h3>
        <p className="text-muted-foreground text-sm">Your documents are being reviewed. This usually takes 1-24 hours.</p>
        {renderStatusBadge()}
        <p className="text-xs text-muted-foreground/60">Auto-refreshing status...</p>
      </div>
    )
  }

  // Rejected view
  if (kycStatus === "rejected") {
    return (
      <div className="space-y-6">
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-xl font-black text-foreground">Verification Failed</h3>
          <p className="text-muted-foreground text-sm mt-2">Please resubmit with correct documents.</p>
        </div>
        <Button 
          onClick={() => setKycStatus("none")} 
          className="w-full h-12 bg-green-500 text-black font-bold rounded-xl"
        >
          Resubmit Documents
        </Button>
      </div>
    )
  }

  // Form view
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-500" />
        </div>
        <h3 className="text-xl font-black text-foreground">Identity Verification</h3>
        <p className="text-muted-foreground text-sm mt-2">Complete KYC to unlock withdrawals</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Identity Section */}
      <div className="space-y-4 bg-card/50 p-4 rounded-2xl border border-border">
        <h4 className="font-bold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-500" /> Identity Details
        </h4>
        
        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Full Name (as per ID) *</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter full name"
            className="h-12 bg-background border-border rounded-xl text-foreground"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">PAN Number *</Label>
          <Input
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            maxLength={10}
            className="h-12 bg-background border-border rounded-xl text-foreground uppercase"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Aadhaar Number *</Label>
          <Input
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
            placeholder="123456789012"
            maxLength={12}
            className="h-12 bg-background border-border rounded-xl text-foreground"
            disabled={loading}
          />
        </div>
      </div>

      {/* Payment Details - Required for Withdrawal */}
      <div className="space-y-4">
        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-4 py-3 rounded-xl text-sm">
          ⚠️ Provide Bank Account OR UPI ID (at least one required for withdrawals)
        </div>

        <Tabs defaultValue="bank" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card rounded-xl">
            <TabsTrigger value="bank" className="data-[state=active]:bg-green-500 data-[state=active]:text-black rounded-lg">
              <CreditCard className="w-4 h-4 mr-2" /> Bank Account
            </TabsTrigger>
            <TabsTrigger value="upi" className="data-[state=active]:bg-green-500 data-[state=active]:text-black rounded-lg">
              <Smartphone className="w-4 h-4 mr-2" /> UPI ID
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="bank" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Bank Account Number</Label>
              <Input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="Account number"
                className="h-12 bg-background border-border rounded-xl text-foreground"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">IFSC Code</Label>
              <Input
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="SBIN0001234"
                className="h-12 bg-background border-border rounded-xl text-foreground uppercase"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Bank Name</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="State Bank of India"
                className="h-12 bg-background border-border rounded-xl text-foreground"
                disabled={loading}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="upi" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase font-bold tracking-wider">UPI ID</Label>
              <Input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                placeholder="yourname@upi"
                className="h-12 bg-background border-border rounded-xl text-foreground"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-muted-foreground">Enter your UPI ID linked to your bank account (GPay, PhonePe, Paytm, etc.)</p>
          </TabsContent>
        </Tabs>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-black text-lg rounded-xl"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Submitting...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5 mr-2" />
            Submit for Verification
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground/60 text-center">
        Your data is encrypted and securely stored. We comply with all data protection regulations.
      </p>
    </form>
  )
}
