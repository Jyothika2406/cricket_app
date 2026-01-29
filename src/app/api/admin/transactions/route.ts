import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
import { verifyAdmin } from "@/lib/admin-auth"

// Get all pending transactions
export async function GET(req: Request) {
    try {
        // Verify admin authorization
        const auth = await verifyAdmin()
        if (!auth.authorized) {
            return auth.error
        }

        await dbConnect()

        const url = new URL(req.url)
        const type = url.searchParams.get("type") // "deposit" or "withdraw" or "all"
        const status = url.searchParams.get("status") // "pending", "approved", etc.

        let query: any = {}
        
        if (type && type !== "all") {
            query.type = type
        } else {
            query.type = { $in: ["deposit", "withdraw"] }
        }
        
        if (status && status !== "all") {
            query.status = status
        }

        const transactions = await Transaction.find(query)
            .populate("userId", "name email phone walletBalance kycStatus")
            .populate("processedBy", "name email")
            .sort({ createdAt: -1 })
            .limit(100)

        return NextResponse.json({
            success: true,
            transactions
        })

    } catch (error: any) {
        console.error("Get Transactions Error:", error)
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

// Approve or reject transaction
export async function POST(req: Request) {
    try {
        // Verify admin authorization
        const auth = await verifyAdmin()
        if (!auth.authorized) {
            return auth.error
        }

        await dbConnect()

        const admin = auth.user

        const { transactionId, action, rejectionReason } = await req.json()

        if (!transactionId || !action) {
            return NextResponse.json(
                { success: false, message: "Transaction ID and action required" },
                { status: 400 }
            )
        }

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json(
                { success: false, message: "Invalid action" },
                { status: 400 }
            )
        }

        const transaction = await Transaction.findById(transactionId)
        if (!transaction) {
            return NextResponse.json(
                { success: false, message: "Transaction not found" },
                { status: 404 }
            )
        }

        if (transaction.status !== "pending") {
            return NextResponse.json(
                { success: false, message: "Transaction already processed" },
                { status: 400 }
            )
        }

        const user = await User.findById(transaction.userId)
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        if (action === "approve") {
            if (transaction.type === "deposit") {
                // Add amount to user wallet
                await User.findByIdAndUpdate(user._id, {
                    $inc: { walletBalance: transaction.amount }
                })
            } else if (transaction.type === "withdraw") {
                // Check if user has sufficient balance
                if (user.walletBalance < transaction.amount) {
                    return NextResponse.json(
                        { success: false, message: "User has insufficient balance" },
                        { status: 400 }
                    )
                }
                // Deduct amount from user wallet
                await User.findByIdAndUpdate(user._id, {
                    $inc: { walletBalance: -transaction.amount }
                })
            }

            // Update transaction status
            await Transaction.findByIdAndUpdate(transactionId, {
                status: "completed",
                processedBy: admin._id,
                processedAt: new Date()
            })

            return NextResponse.json({
                success: true,
                message: `${transaction.type} approved successfully`
            })

        } else if (action === "reject") {
            // Update transaction status
            await Transaction.findByIdAndUpdate(transactionId, {
                status: "rejected",
                processedBy: admin._id,
                processedAt: new Date(),
                rejectionReason: rejectionReason || "Rejected by admin"
            })

            return NextResponse.json({
                success: true,
                message: `${transaction.type} rejected`
            })
        }

    } catch (error: any) {
        console.error("Process Transaction Error:", error)
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
