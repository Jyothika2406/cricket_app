import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function POST(req: Request) {
    try {
        await dbConnect()
        
        const { name, email, phone, password } = await req.json()

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: "Name, email, and password are required" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() })
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User with this email already exists" },
                { status: 409 }
            )
        }

        // Check if phone already exists (if provided)
        if (phone) {
            const existingPhone = await User.findOne({ phone })
            if (existingPhone) {
                return NextResponse.json(
                    { success: false, message: "User with this phone number already exists" },
                    { status: 409 }
                )
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Generate referral code
        const referralCode = `REF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`

        // Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            walletBalance: 0,
            role: "user",
            kycStatus: "none",
            referralCode,
            referralCount: 0,
            referralEarnings: 0,
        })

        return NextResponse.json({
            success: true,
            message: "Registration successful! Please login.",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
            }
        })

    } catch (error: any) {
        console.error("Registration Error:", error)
        return NextResponse.json(
            { success: false, message: error.message || "Registration failed" },
            { status: 500 }
        )
    }
}
