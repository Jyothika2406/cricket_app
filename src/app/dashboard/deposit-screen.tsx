"use client"

import { useState } from "react"
import { Copy, ShieldCheck, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ADMIN_UPI_ID = "drnoelkmathew@okicici"

export default function DepositScreen() {
    const [amount, setAmount] = useState("")
    const [utrNumber, setUtrNumber] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const copyUpi = () => {
        navigator.clipboard.writeText(ADMIN_UPI_ID)
        alert("UPI ID Copied to Clipboard!")
    }

    const handleSubmit = async () => {
        setError("")
        setSuccess("")

        if (!amount || Number(amount) <= 0) {
            setError("Please enter a valid amount")
            return
        }

        if (Number(amount) < 100) {
            setError("Minimum deposit amount is ₹100")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/user/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: Number(amount),
                    utrNumber,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.message || "Deposit request failed")
                return
            }

            setSuccess("Deposit request submitted successfully! Your balance will be updated after admin verification.")
            setAmount("")
            setUtrNumber("")
        } catch (e: any) {
            setError(e.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4 space-y-6 pb-24 bg-background min-h-screen text-foreground">
            <h2 className="text-2xl font-black italic uppercase">ADD FUNDS</h2>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {success}
                </div>
            )}

            <div className="bg-card border border-border rounded-3xl p-6 space-y-6">
                <div className="space-y-4">
                    <p className="text-muted-foreground text-sm text-center">Pay to the UPI ID below using any UPI app</p>

                    {/* UPI ID Display */}
                    <div className="space-y-3">
                        <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest text-center">ADMIN UPI ID</p>
                        <div className="flex items-center gap-2 bg-background border border-border p-4 rounded-xl">
                            <span className="flex-1 font-mono text-green-500 text-lg">{ADMIN_UPI_ID}</span>
                            <button onClick={copyUpi} className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg">
                                <Copy size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase font-bold">Amount Paid (₹)</Label>
                        <Input
                            type="number"
                            placeholder="Min ₹100"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-12 rounded-xl bg-background border-border text-foreground text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs uppercase font-bold">UTR / Reference Number (Optional)</Label>
                        <Input
                            type="text"
                            placeholder="For faster verification"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            className="h-12 rounded-xl bg-background border-border text-foreground"
                        />
                    </div>

                    <Button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full h-14 rounded-xl bg-green-500 hover:bg-green-600 text-black font-bold text-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            "Submit Deposit Request"
                        )}
                    </Button>
                </div>
            </div>

            <div className="flex items-start gap-3 bg-card/50 p-4 rounded-2xl border border-border">
                <ShieldCheck className="text-green-500 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Your deposit will be verified by admin and credited to your wallet within 5-30 minutes. For any issues, contact support.
                </p>
            </div>
        </div>
    )
}