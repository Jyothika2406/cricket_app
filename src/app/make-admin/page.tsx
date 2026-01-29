"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Shield, Loader2, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function MakeAdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-yellow-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
        
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left">
          <p className="text-yellow-400 text-sm mb-3">
            <strong>🔒 Security Notice:</strong>
          </p>
          <p className="text-muted-foreground text-sm mb-2">
            Admin promotion is no longer available through this page for security reasons.
          </p>
          <p className="text-muted-foreground text-sm">
            To become an admin:
          </p>
          <ol className="text-muted-foreground text-sm list-decimal list-inside mt-2 space-y-1">
            <li>Contact an existing administrator</li>
            <li>Or run the setup script (first-time only):<br/>
              <code className="text-xs bg-background px-2 py-1 rounded mt-1 inline-block">
                node scripts/create-first-admin.js
              </code>
            </li>
          </ol>
        </div>

        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full h-12 bg-green-500 hover:bg-green-600 text-black font-bold rounded-xl">
              Go to Dashboard
            </Button>
          </Link>
          
          <Link href="/login">
            <Button variant="outline" className="w-full h-12 border-border rounded-xl">
              Login
            </Button>
          </Link>
        </div>

        {session?.user?.role === "admin" && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
            <p className="text-green-400 text-sm">
              ✅ You are already an admin!
            </p>
            <Link href="/admin" className="text-green-500 hover:underline text-sm font-bold">
              Go to Admin Panel →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
