import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import AdminSettings from "@/models/AdminSettings"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    let settings = await AdminSettings.findOne()
    
    if (!settings) {
      // Create default settings
      settings = await AdminSettings.create({
        adminUpiIds: [],
        minBetAmount: 10,
        maxBetAmount: 100000,
        commissionPercent: 5
      })
    }

    return NextResponse.json({ success: true, settings })

  } catch (error: any) {
    console.error("Get settings error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { adminUpiIds, minBetAmount, maxBetAmount, commissionPercent } = await req.json()

    let settings = await AdminSettings.findOne()
    
    if (settings) {
      settings = await AdminSettings.findByIdAndUpdate(
        settings._id,
        { adminUpiIds, minBetAmount, maxBetAmount, commissionPercent },
        { new: true }
      )
    } else {
      settings = await AdminSettings.create({
        adminUpiIds,
        minBetAmount,
        maxBetAmount,
        commissionPercent
      })
    }

    return NextResponse.json({ success: true, settings })

  } catch (error: any) {
    console.error("Save settings error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
