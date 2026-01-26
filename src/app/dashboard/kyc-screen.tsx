"use client"

/** 
 * KYC Page - Uses the KYCScreen component from components folder
 */
import { KYCScreen } from "@/components/kyc-screen"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

export default function KYCPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header with Back Button */}
            <div className="p-4 flex items-center gap-4 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full hover:bg-muted"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <h1 className="text-lg font-bold uppercase italic tracking-tighter">Identity Verification</h1>
            </div>

            {/* Main KYC Content */}
            <div className="max-w-md mx-auto p-4">
                <KYCScreen />
            </div>
        </div>
    )
}