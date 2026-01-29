import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { verifyAdmin } from "@/lib/admin-auth"

export async function GET(req: NextRequest) {
  try {
    // Verify admin authorization
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()

    const users = await User.find({}).select("-password").sort({ createdAt: -1 })

    return NextResponse.json({ success: true, users })

  } catch (error: any) {
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
