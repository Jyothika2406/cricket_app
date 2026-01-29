import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Match from "@/models/Match"
import Bet from "@/models/Bet"
import Transaction from "@/models/Transaction"
import { verifyAdmin } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  try {
    // Verify admin authorization
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()

    // Get all stats
    const totalUsers = await User.countDocuments()
    const pendingKYC = await User.countDocuments({ kycStatus: "pending" })
    const totalMatches = await Match.countDocuments()
    const liveMatches = await Match.countDocuments({ status: "live" })
    const totalBets = await Bet.countDocuments()
    
    // Get transaction stats
    const depositAgg = await Transaction.aggregate([
      { $match: { type: "deposit", status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    const withdrawAgg = await Transaction.aggregate([
      { $match: { type: "withdraw", status: "approved" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ])
    
    const stats = {
      totalUsers,
      totalMatches,
      liveMatches,
      totalBets,
      pendingKYC,
      totalDeposits: depositAgg[0]?.total || 0,
      totalWithdrawals: withdrawAgg[0]?.total || 0,
    }

    return NextResponse.json({ success: true, stats })

  } catch (error: any) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
