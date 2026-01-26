import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { userId } = await params
    const { role } = await req.json()

    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role" }, { status: 400 })
    }

    await User.findByIdAndUpdate(userId, { role })

    return NextResponse.json({ success: true, message: "Role updated" })

  } catch (error: any) {
    console.error("Update role error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
