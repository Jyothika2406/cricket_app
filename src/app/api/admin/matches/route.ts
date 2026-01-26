import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Match from "@/models/Match"

// GET all matches
export async function GET(req: NextRequest) {
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

    const matches = await Match.find({}).sort({ createdAt: -1 })

    return NextResponse.json({ success: true, matches })

  } catch (error: any) {
    console.error("Admin matches error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// CREATE new match
export async function POST(req: NextRequest) {
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

    const { title, team1, team2, startTime } = await req.json()

    if (!title || !team1 || !team2 || !startTime) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 })
    }

    const match = await Match.create({
      title,
      team1,
      team2,
      startTime: new Date(startTime),
      status: "upcoming",
      questions: []
    })

    return NextResponse.json({ success: true, match })

  } catch (error: any) {
    console.error("Create match error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
