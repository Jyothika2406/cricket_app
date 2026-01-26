import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Match from "@/models/Match"

// DELETE match
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
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

    const { matchId } = await params
    await Match.findByIdAndDelete(matchId)

    return NextResponse.json({ success: true, message: "Match deleted" })

  } catch (error: any) {
    console.error("Delete match error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// UPDATE match status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
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

    const { matchId } = await params
    const { status } = await req.json()

    if (!["upcoming", "live", "completed"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    const match = await Match.findByIdAndUpdate(matchId, { status }, { new: true })

    return NextResponse.json({ success: true, match })

  } catch (error: any) {
    console.error("Update match error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
