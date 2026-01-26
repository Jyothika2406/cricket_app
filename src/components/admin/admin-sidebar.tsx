"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useState } from "react"
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Shield, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Settings,
  Home,
  Wallet,
  ArrowLeftRight
} from "lucide-react"

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/matches", icon: Trophy, label: "Matches & Bets" },
    { href: "/admin/transactions", icon: ArrowLeftRight, label: "Transactions" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/kyc", icon: Shield, label: "KYC Approvals" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <>
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 p-4 flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-0">
          <span className="text-base font-black italic tracking-tight text-orange-500">CRICBET</span>
          <span className="bg-[#1a2234] text-white text-[10px] font-black px-1 py-0.5 rounded ml-0.5">
            SK<span className="text-orange-500">I</span>LL
          </span>
          <span className="ml-2 text-xs text-muted-foreground font-medium">Admin</span>
        </div>
      </header>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-72 bg-background border-r border-border/50
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0">
              <span className="text-xl font-black italic tracking-tight text-orange-500">CRICBET</span>
              <span className="bg-[#1a2234] text-white text-xs font-black px-1.5 py-0.5 rounded ml-0.5">
                SK<span className="text-orange-500">I</span>LL
              </span>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Admin Panel</p>
            </div>
            <button 
              className="lg:hidden text-muted-foreground hover:text-foreground p-2 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium px-4 mb-2">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative
                  ${isActive 
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold shadow-lg shadow-green-500/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium px-4 mb-2">Quick Links</p>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <Home className="w-5 h-5" />
              <span>User Dashboard</span>
            </Link>
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border/50 bg-card/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold">
              {user?.name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user?.name || "Admin"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-1 rounded-full uppercase font-bold whitespace-nowrap">
              Admin
            </span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Spacer for mobile header */}
      <div className="lg:hidden h-16" />
    </>
  )
}