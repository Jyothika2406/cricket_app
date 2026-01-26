import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
    try {
        await dbConnect()
        
        const { email } = await req.json()

        if (!email) {
            return NextResponse.json(
                { success: false, message: "Email is required" },
                { status: 400 }
            )
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() })

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Store OTP
        await User.findByIdAndUpdate(user._id, {
            loginOtp: otp,
            loginOtpExpiry: otpExpiry
        })

        // Send OTP via email
        try {
            await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email, otp })
            })
        } catch (emailError) {
            console.error("Email sending failed:", emailError)
            return NextResponse.json(
                { success: false, message: "Failed to send OTP email" },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent to your email"
        })

    } catch (error: any) {
        console.error("Resend OTP Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Failed to resend OTP" },
            { status: 500 }
        )
    }
}
