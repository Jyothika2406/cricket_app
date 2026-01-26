import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
    try {
        await dbConnect()
        
        const { adminId, otp } = await req.json()

        if (!adminId || !otp) {
            return NextResponse.json(
                { success: false, message: "Admin ID and OTP are required" },
                { status: 400 }
            )
        }

        // Find admin with OTP fields
        const admin = await User.findById(adminId).select("+loginOtp +loginOtpExpiry")

        if (!admin || admin.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Admin not found" },
                { status: 404 }
            )
        }

        // Check if OTP exists
        if (!admin.loginOtp || !admin.loginOtpExpiry) {
            return NextResponse.json(
                { success: false, message: "No OTP found. Please request a new one." },
                { status: 400 }
            )
        }

        // Check OTP expiry
        if (new Date() > new Date(admin.loginOtpExpiry)) {
            await User.findByIdAndUpdate(admin._id, {
                $unset: { loginOtp: 1, loginOtpExpiry: 1 }
            })
            return NextResponse.json(
                { success: false, message: "OTP has expired. Please request a new one." },
                { status: 400 }
            )
        }

        // Verify OTP
        if (admin.loginOtp !== otp) {
            return NextResponse.json(
                { success: false, message: "Invalid OTP" },
                { status: 400 }
            )
        }

        // Clear OTP after successful verification
        await User.findByIdAndUpdate(admin._id, {
            $unset: { loginOtp: 1, loginOtpExpiry: 1 }
        })

        // Return admin data for session
        return NextResponse.json({
            success: true,
            message: "OTP verified successfully",
            admin: {
                _id: admin._id.toString(),
                name: admin.name,
                email: admin.email,
                role: admin.role,
            }
        })

    } catch (error: any) {
        console.error("Admin OTP Verification Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Verification failed" },
            { status: 500 }
        )
    }
}
