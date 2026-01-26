import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET user profile
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        await dbConnect()

        const user = await User.findOne({ email: session.user.email })
            .select("name email phone walletBalance kycStatus kycData referralCode referralCount referralEarnings darkMode language currency notifications")
        
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                walletBalance: user.walletBalance,
                kycStatus: user.kycStatus,
                kycData: user.kycData,
                referralCode: user.referralCode,
                referralCount: user.referralCount || 0,
                referralEarnings: user.referralEarnings || 0,
                darkMode: user.darkMode !== false, // Default to true
                language: user.language || "en",
                currency: user.currency || "INR",
                notifications: user.notifications !== false,
            }
        })

    } catch (error: any) {
        console.error("Profile Error:", error)
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}

// PUT - Update user profile
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            )
        }

        await dbConnect()

        const { name, phone, darkMode, language, currency, notifications } = await req.json()

        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (phone !== undefined) updateData.phone = phone
        if (darkMode !== undefined) updateData.darkMode = darkMode
        if (language !== undefined) updateData.language = language
        if (currency !== undefined) updateData.currency = currency
        if (notifications !== undefined) updateData.notifications = notifications

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: updateData },
            { new: true }
        )

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated",
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                darkMode: user.darkMode,
                language: user.language,
                currency: user.currency,
                notifications: user.notifications,
            }
        })

    } catch (error: any) {
        console.error("Profile Update Error:", error)
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        )
    }
}
