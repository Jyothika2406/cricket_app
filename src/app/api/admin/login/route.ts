import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
    try {
        await dbConnect()
        
        const { phone, email } = await req.json()

        if (!phone && !email) {
            return NextResponse.json(
                { success: false, message: "Phone or email is required" },
                { status: 400 }
            )
        }

        // Find admin user
        let admin
        if (phone) {
            admin = await User.findOne({ phone, role: "admin" })
        } else if (email) {
            admin = await User.findOne({ email: email.toLowerCase(), role: "admin" })
        }

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Admin account not found" },
                { status: 404 }
            )
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Store OTP
        await User.findByIdAndUpdate(admin._id, {
            loginOtp: otp,
            loginOtpExpiry: otpExpiry
        })

        // Send OTP via email
        if (admin.email) {
            try {
                await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/send-otp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: admin.email, otp })
                })
            } catch (emailError) {
                console.error("Email sending failed:", emailError)
            }
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent to your registered email",
            adminId: admin._id.toString(),
            email: admin.email ? admin.email.substring(0, 3) + "***@***" : null
        })

    } catch (error: any) {
        console.error("Admin Login Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Login failed" },
            { status: 500 }
        )
    }
}
