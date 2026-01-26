"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Trophy, DollarSign, Shield, TrendingUp, Clock, Plus, ArrowUpRight, Activity, Zap } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalUsers: number
  totalMatches: number
  totalBets: number
  pendingKYC: number
  totalDeposits: number
  totalWithdrawals: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats")
        const data = await res.json()
        if (data.success) {
          setStats(data.stats)
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "from-blue-500 to-blue-600", change: "+12%" },
    { label: "Live Matches", value: stats?.totalMatches || 0, icon: Trophy, color: "from-green-500 to-emerald-600", change: "+3" },
    { label: "Total Bets", value: stats?.totalBets || 0, icon: TrendingUp, color: "from-purple-500 to-violet-600", change: "+28%" },
    { label: "Pending KYC", value: stats?.pendingKYC || 0, icon: Shield, color: "from-yellow-500 to-orange-500", change: "Review" },
    { label: "Deposits", value: `₹${(stats?.totalDeposits || 0).toLocaleString()}`, icon: DollarSign, color: "from-emerald-500 to-teal-600", change: "+₹15K" },
    { label: "Withdrawals", value: `₹${(stats?.totalWithdrawals || 0).toLocaleString()}`, icon: Clock, color: "from-red-500 to-rose-600", change: "5 pending" },
  ]

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your betting platform</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/matches">
            <Button className="bg-green-500 hover:bg-green-600 text-black font-bold gap-2">
              <Plus className="w-4 h-4" />
              New Match
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-card/50 border-border overflow-hidden group hover:border-muted-foreground/30 transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-foreground">
                {loading ? (
                  <span className="inline-block w-20 h-8 bg-muted animate-pulse rounded" />
                ) : stat.value}
              </p>
            </div>
            <div className={`h-1 bg-gradient-to-r ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h2 className="text-xl font-bold text-foreground">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard 
            title="Create Match" 
            description="Add new betting match"
            href="/admin/matches"
            icon={Plus}
            gradient="from-green-500/20 to-emerald-500/20"
            iconColor="text-green-500"
          />
          <QuickActionCard 
            title="Review KYC" 
            description="Pending verifications"
            href="/admin/kyc"
            icon={Shield}
            gradient="from-yellow-500/20 to-orange-500/20"
            iconColor="text-yellow-500"
            badge={stats?.pendingKYC}
          />
          <QuickActionCard 
            title="Manage Users" 
            description="View all users"
            href="/admin/users"
            icon={Users}
            gradient="from-blue-500/20 to-indigo-500/20"
            iconColor="text-blue-500"
          />
          <QuickActionCard 
            title="Settings" 
            description="UPI & configurations"
            href="/admin/settings"
            icon={Activity}
            gradient="from-purple-500/20 to-violet-500/20"
            iconColor="text-purple-500"
          />
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View All <ArrowUpRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        <Card className="bg-card/50 border-border p-8">
          <div className="text-center text-muted-foreground">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Activity feed coming soon</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

function QuickActionCard({ title, description, href, icon: Icon, gradient, iconColor, badge }: {
  title: string
  description: string
  href: string
  icon: any
  gradient: string
  iconColor: string
  badge?: number
}) {
  return (
    <Link href={href}>
      <Card className={`relative bg-gradient-to-br ${gradient} border-border p-6 hover:border-muted-foreground/30 transition-all cursor-pointer group h-full`}>
        {badge && badge > 0 && (
          <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        <div className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="font-bold text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Card>
    </Link>
  )
}