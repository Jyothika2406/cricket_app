import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"

// TEMPORARY: Make current user admin (remove after use)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Not logged in" }, { status: 401 })
    }

    await dbConnect()
    
    // Make the current logged-in user an admin
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { role: "admin" },
      { new: true }
    )

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${user.email} is now an admin!`,
      user: { email: user.email, role: user.role }
    })

  } catch (error: any) {
    console.error("Make admin error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
