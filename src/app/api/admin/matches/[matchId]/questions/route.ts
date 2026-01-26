import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Match from "@/models/Match"

// Add question to match
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { matchId } = await params
    const { text, options } = await req.json()

    if (!text || !options || options.length < 2) {
      return NextResponse.json({ success: false, message: "Invalid question data" }, { status: 400 })
    }

    const match = await Match.findByIdAndUpdate(
      matchId,
      {
        $push: {
          questions: {
            text,
            options,
            status: "open"
          }
        }
      },
      { new: true }
    )

    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, match })

  } catch (error: any) {
    console.error("Add question error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
