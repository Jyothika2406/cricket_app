import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import AdminSettings from "@/models/AdminSettings"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        await dbConnect()

        const { amount, utrNumber, referenceNumber } = await req.json()

        // Validation
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "Valid amount is required" },
                { status: 400 }
            )
        }

        if (amount < 100) {
            return NextResponse.json(
                { success: false, message: "Minimum deposit amount is ₹100" },
                { status: 400 }
            )
        }

        // Get user
        const user = await User.findOne({ email: session.user.email })
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        // Get admin UPI ID
        const settings = await AdminSettings.findOne()
        const activeUpi = settings?.adminUpiIds?.find((upi: any) => upi.isActive)
        const adminUpiId = activeUpi?.upiId || "drnoelkmathew@okicici"

        // Create pending deposit transaction
        const transaction = await Transaction.create({
            userId: user._id,
            type: "deposit",
            amount: Number(amount),
            method: "UPI",
            status: "pending",
            utrNumber: utrNumber || "",
            referenceNumber: referenceNumber || "",
            adminUpiId,
            notes: `Deposit request of ₹${amount} via UPI`
        })

        return NextResponse.json({
            success: true,
            message: "Deposit request submitted successfully. Please wait for admin approval.",
            transaction: {
                _id: transaction._id,
                amount: transaction.amount,
                status: transaction.status,
                createdAt: transaction.createdAt
            }
        })

    } catch (error: any) {
        console.error("Deposit Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Deposit failed" },
            { status: 500 }
        )
    }
}
