import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Transaction from "@/models/Transaction"
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

        const { amount, paymentMethod, bankAccountNumber, ifscCode, bankName, upiId } = await req.json()

        // Validation
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, message: "Valid amount is required" },
                { status: 400 }
            )
        }

        if (amount < 500) {
            return NextResponse.json(
                { success: false, message: "Minimum withdrawal amount is ₹500" },
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

        // Check KYC status - must have bank OR UPI verified
        const hasVerifiedBankOrUpi = user.kycStatus === "verified" && 
            (user.kycData?.bankVerified || user.kycData?.upiVerified)

        if (!hasVerifiedBankOrUpi) {
            return NextResponse.json(
                { success: false, message: "Please complete KYC verification (Bank or UPI) before withdrawing" },
                { status: 403 }
            )
        }

        // Check balance
        if (amount > user.walletBalance) {
            return NextResponse.json(
                { success: false, message: "Insufficient balance" },
                { status: 400 }
            )
        }

        // Check for pending withdrawals
        const pendingWithdrawal = await Transaction.findOne({
            userId: user._id,
            type: "withdraw",
            status: "pending"
        })

        if (pendingWithdrawal) {
            return NextResponse.json(
                { success: false, message: "You already have a pending withdrawal request. Please wait for it to be processed." },
                { status: 400 }
            )
        }

        // Determine withdrawal details
        let withdrawalDetails: any = {}
        
        if (paymentMethod === "bank") {
            withdrawalDetails = {
                bankAccountNumber: bankAccountNumber || user.kycData?.bankAccountNumber,
                ifscCode: ifscCode || user.kycData?.ifscCode,
                bankName: bankName || user.kycData?.bankName,
                accountHolderName: user.kycData?.fullName || user.name
            }
        } else if (paymentMethod === "upi") {
            withdrawalDetails = {
                upiId: upiId || user.kycData?.upiId,
                accountHolderName: user.kycData?.fullName || user.name
            }
        } else {
            // Use default from KYC
            if (user.kycData?.upiVerified && user.kycData?.upiId) {
                withdrawalDetails = {
                    upiId: user.kycData.upiId,
                    accountHolderName: user.kycData?.fullName || user.name
                }
            } else if (user.kycData?.bankVerified) {
                withdrawalDetails = {
                    bankAccountNumber: user.kycData.bankAccountNumber,
                    ifscCode: user.kycData.ifscCode,
                    bankName: user.kycData.bankName,
                    accountHolderName: user.kycData?.fullName || user.name
                }
            }
        }

        // Create pending withdrawal transaction (don't deduct balance yet)
        const transaction = await Transaction.create({
            userId: user._id,
            type: "withdraw",
            amount: Number(amount),
            method: paymentMethod?.toUpperCase() || "UPI",
            status: "pending",
            withdrawalDetails,
            notes: `Withdrawal request of ₹${amount}`
        })

        return NextResponse.json({
            success: true,
            message: "Withdrawal request submitted successfully. Please wait for admin approval.",
            transaction: {
                _id: transaction._id,
                amount: transaction.amount,
                status: transaction.status,
                createdAt: transaction.createdAt
            }
        })

    } catch (error: any) {
        console.error("Withdrawal Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Withdrawal failed" },
            { status: 500 }
        )
    }
}
