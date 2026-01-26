import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

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

    // Get stats
    const totalUsers = await User.countDocuments()
    const pendingKYC = await User.countDocuments({ kycStatus: "pending" })
    
    // For matches and bets, we'll need the Match and Bet models
    // For now, return placeholder values
    const stats = {
      totalUsers,
      totalMatches: 0,
      totalBets: 0,
      pendingKYC,
      totalDeposits: 0,
      totalWithdrawals: 0,
    }

    return NextResponse.json({ success: true, stats })

  } catch (error: any) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
