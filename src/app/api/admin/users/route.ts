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

    const users = await User.find({}).select("-password").sort({ createdAt: -1 })

    return NextResponse.json({ success: true, users })

  } catch (error: any) {
    console.error("Admin users error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
