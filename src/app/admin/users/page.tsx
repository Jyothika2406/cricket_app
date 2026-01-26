"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { 
  Search, 
  Users, 
  Loader2, 
  Shield,
  ShieldCheck,
  Ban,
  MoreVertical,
  Mail,
  Wallet
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  _id: string
  name: string
  email: string
  role: "user" | "admin"
  walletBalance: number
  kycStatus: "none" | "pending" | "verified" | "rejected"
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (err) {
      console.error("Failed to fetch users:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to make this user an admin?")) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      })

      if (res.ok) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, role: "admin" } : u
        ))
      }
    } catch (err) {
      console.error("Failed to update role:", err)
    }
  }

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm("Are you sure you want to remove admin privileges?")) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "user" }),
      })

      if (res.ok) {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, role: "user" } : u
        ))
      }
    } catch (err) {
      console.error("Failed to update role:", err)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getKYCBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <span className="px-2 py-0.5 bg-green-500/20 text-green-500 rounded text-xs font-bold">Verified</span>
      case "pending":
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs font-bold">Pending</span>
      case "rejected":
        return <span className="px-2 py-0.5 bg-red-500/20 text-red-500 rounded text-xs font-bold">Rejected</span>
      default:
        return <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-bold">None</span>
    }
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all registered users</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-10 w-64 bg-card border-border rounded-xl"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <Card className="bg-card border-border p-12 text-center">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">No Users Found</h3>
          <p className="text-muted-foreground">
            {search ? "Try a different search term" : "No users have registered yet"}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-6 gap-4 px-6 py-3 bg-card rounded-xl text-xs text-muted-foreground uppercase font-bold">
            <div className="col-span-2">User</div>
            <div>Role</div>
            <div>KYC Status</div>
            <div>Balance</div>
            <div>Actions</div>
          </div>

          {/* User Rows */}
          {filteredUsers.map((user) => (
            <Card key={user._id} className="bg-card border-border p-4 md:p-6">
              <div className="md:grid md:grid-cols-6 md:gap-4 md:items-center space-y-4 md:space-y-0">
                {/* User Info */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-black font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{user.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <span className="md:hidden text-xs text-muted-foreground uppercase mr-2">Role:</span>
                  {user.role === "admin" ? (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-500 rounded text-xs font-bold uppercase">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs font-bold uppercase">
                      User
                    </span>
                  )}
                </div>

                {/* KYC */}
                <div>
                  <span className="md:hidden text-xs text-muted-foreground uppercase mr-2">KYC:</span>
                  {getKYCBadge(user.kycStatus)}
                </div>

                {/* Balance */}
                <div>
                  <span className="md:hidden text-xs text-muted-foreground uppercase mr-2">Balance:</span>
                  <span className="text-foreground font-bold flex items-center gap-1">
                    <Wallet className="w-4 h-4 text-green-500" />
                    ₹{user.walletBalance?.toLocaleString() || 0}
                  </span>
                </div>

                {/* Actions */}
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      {user.role !== "admin" ? (
                        <DropdownMenuItem 
                          onClick={() => handleMakeAdmin(user._id)}
                          className="text-purple-500 focus:text-purple-500 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2" />
                          Make Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => handleRemoveAdmin(user._id)}
                          className="text-yellow-500 focus:text-yellow-500 cursor-pointer"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Remove Admin
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
