"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Shield, Loader2, CheckCircle, LogIn } from "lucide-react"

export default function MakeAdminPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleMakeAdmin = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/make-admin", { method: "POST" })
      const data = await res.json()
      setResult(data)
      
      // Automatically redirect to admin panel after 1.5 seconds
      if (data.success) {
        setTimeout(() => {
          router.push("/admin")
        }, 1500)
      }
    } catch (err) {
      setResult({ success: false, message: "Failed to connect" })
    } finally {
      setLoading(false)
    }
  }

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
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-2">Become Admin</h1>
        <p className="text-muted-foreground mb-6">
          {session ? `Logged in as: ${session.user?.email}` : "You need to login first"}
        </p>

        {/* Not logged in - show login buttons */}
        {!session && (
          <div className="space-y-3">
            <Button
              onClick={() => signIn("google", { callbackUrl: "/make-admin" })}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-xl"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login with Google
            </Button>
            <Button
              onClick={() => signIn("azure-ad", { callbackUrl: "/make-admin" })}
              variant="outline"
              className="w-full h-14 border-border text-foreground font-bold text-lg rounded-xl"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Login with Microsoft
            </Button>
          </div>
        )}

        {/* Logged in - show result or make admin button */}
        {session && (
          <>
            {result ? (
              <div className={`p-4 rounded-xl mb-4 ${
                result.success ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
              }`}>
                {result.success ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{result.message}</span>
                  </div>
                ) : (
                  <span>{result.message}</span>
                )}
              </div>
            ) : null}

            {result?.success ? (
              <a 
                href="/admin"
                className="block w-full bg-green-500 hover:bg-green-600 text-black font-bold py-4 rounded-xl transition-colors"
              >
                Go to Admin Panel →
              </a>
            ) : (
              <Button
                onClick={handleMakeAdmin}
                disabled={loading}
                className="w-full h-14 bg-green-500 hover:bg-green-600 text-black font-bold text-lg rounded-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  "Make Me Admin"
                )}
              </Button>
            )}
          </>
        )}

        <p className="text-xs text-muted-foreground mt-6">
          ⚠️ Remove this page after setting up admin accounts
        </p>
      </div>
    </div>
  )
}
