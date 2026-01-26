import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
    try {
        await dbConnect()
        
        const { userId, otp, email } = await req.json()

        // Find user
        let user
        if (userId) {
            user = await User.findById(userId)
        } else if (email) {
            user = await User.findOne({ email: email.toLowerCase() })
        }

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        // Check if OTP exists and is not expired
        if (!user.loginOtp || !user.loginOtpExpiry) {
            return NextResponse.json(
                { success: false, message: "No OTP found. Please request a new one." },
                { status: 400 }
            )
        }

        // Check OTP expiry
        if (new Date() > new Date(user.loginOtpExpiry)) {
            // Clear expired OTP
            await User.findByIdAndUpdate(user._id, {
                $unset: { loginOtp: 1, loginOtpExpiry: 1 }
            })
            return NextResponse.json(
                { success: false, message: "OTP has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Verify OTP
        if (user.loginOtp !== otp) {
            return NextResponse.json(
                { success: false, message: "Invalid OTP" },
                { status: 400 }
            )
        }

        // Clear OTP after successful verification
        await User.findByIdAndUpdate(user._id, {
            $unset: { loginOtp: 1, loginOtpExpiry: 1 }
        })

        // Return user data for session
        return NextResponse.json({
            success: true,
            message: "OTP verified successfully",
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                walletBalance: user.walletBalance,
                kycStatus: user.kycStatus,
                role: user.role,
                referralCode: user.referralCode,
                referralCount: user.referralCount || 0,
                referralEarnings: user.referralEarnings || 0,
            }
        })

    } catch (error: any) {
        console.error("OTP Verification Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Verification failed" },
            { status: 500 }
        )
    }
}
