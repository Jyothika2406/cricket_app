"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wallet, ShieldCheck, LogOut, ChevronRight, User, Phone, Mail, Edit, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UserProfile {
  name: string
  email: string
  phone?: string
  walletBalance: number
  kycStatus: string
  referralCode: string
}

interface ProfilePageProps {
  onNavigate?: (screen: string) => void
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile")
      const data = await res.json()
      if (data.success && data.user) {
        setProfile(data.user)
        setEditName(data.user.name || "")
        setEditPhone(data.user.phone || "")
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchProfile()
        setEditMode(false)
      }
    } catch (err) {
      console.error("Failed to update profile:", err)
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-24">
      {/* HEADER SECTION */}
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-black font-black text-2xl">
          {profile?.name?.[0]?.toUpperCase() || "A"}
        </div>
        <div>
          <h1 className="text-xl font-black">{profile?.name || "User"}</h1>
          <p className="text-muted-foreground text-sm">{profile?.email}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* WALLET CARD */}
        <div className="bg-card p-6 rounded-[2rem] border border-border flex justify-between items-center">
          <div>
            <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Wallet Balance</p>
            <h2 className="text-3xl font-black">₹{(profile?.walletBalance || 0).toLocaleString()}</h2>
          </div>
          <Button 
            onClick={() => onNavigate?.("wallet")}
            className="bg-green-500 text-black font-bold rounded-xl px-6 h-12"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Deposit
          </Button>
        </div>

        {/* NAVIGATION LIST */}
        <div className="space-y-2">
          {/* KYC Link */}
          <button
            onClick={() => router.push("/dashboard/kyc")}
            className="w-full bg-card/50 p-5 rounded-2xl border border-border flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <ShieldCheck className={profile?.kycStatus === "verified" ? "text-green-500" : "text-blue-500"} />
              <div className="text-left">
                <span className="font-bold block">KYC Verification</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${
                  profile?.kycStatus === "verified" ? "text-green-500" : "text-yellow-500"
                }`}>
                  {profile?.kycStatus === "verified" ? "✓ Verified" : profile?.kycStatus === "pending" ? "⏳ Pending" : "Action Required"}
                </span>
              </div>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-foreground" />
          </button>

          {/* Personal Details */}
          <button 
            onClick={() => setDetailsOpen(true)}
            className="w-full bg-card/50 p-5 rounded-2xl border border-border flex items-center justify-between group active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <User className="text-muted-foreground" />
              <span className="font-bold">Personal Details</span>
            </div>
            <ChevronRight className="text-muted-foreground group-hover:text-foreground" />
          </button>
        </div>

        {/* Referral Code */}
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl">
          <p className="text-xs text-green-500 font-bold uppercase mb-1">Your Referral Code</p>
          <p className="text-xl font-black text-green-500 font-mono">{profile?.referralCode || "..."}</p>
        </div>

        {/* LOGOUT BUTTON */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-red-500 font-bold h-14 rounded-2xl mt-10 hover:bg-red-500/10 border border-red-500/20"
        >
          <LogOut className="mr-2" size={20} /> Logout
        </Button>
      </div>

      {/* Personal Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Personal Details
              {!editMode && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setEditMode(true)}
                  className="ml-auto text-green-500"
                >
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {editMode ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="bg-background border-border"
                  placeholder="+91 1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label>Email (cannot change)</Label>
                <Input
                  value={profile?.email || ""}
                  disabled
                  className="bg-background border-border opacity-50"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-border"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-green-500 text-black"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-bold">{profile?.name || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-bold">{profile?.email || "Not set"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-xl">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-bold">{profile?.phone || "Not set"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}