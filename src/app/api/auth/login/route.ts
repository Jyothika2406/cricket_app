import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        await dbConnect()
        
        const { email, password } = await req.json()

        // Validation
        if (!email || !password) {
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            )
        }

        // Find user with password
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password")

        // Check if user exists
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User does not exist" },
                { status: 404 }
            )
        }

        // Check if password exists (user may have registered via OAuth)
        if (!user.password) {
            return NextResponse.json(
                { success: false, message: "Please login with Google or Microsoft" },
                { status: 400 }
            )
        }

        // Validate password
        const isValidPassword = await bcrypt.compare(password, user.password)
        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, message: "Invalid credentials" },
                { status: 401 }
            )
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Store OTP in user document
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
        }

        return NextResponse.json({
            success: true,
            message: "OTP sent to your email",
            requiresOtp: true,
            userId: user._id.toString()
        })

    } catch (error: any) {
        console.error("Login Validation Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Login failed" },
            { status: 500 }
        )
    }
}
