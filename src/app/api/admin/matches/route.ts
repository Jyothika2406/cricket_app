import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Match from "@/models/Match"
import { verifyAdmin } from "@/lib/admin-auth"
import { updateMatchStatuses, isMatchEditable } from "@/lib/match-utils"

// GET all matches
export async function GET(req: NextRequest) {
  try {
    // Verify admin authorization
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()
    
    // Update match statuses based on current time
    await updateMatchStatuses()

    const matches = await Match.find({}).sort({ createdAt: -1 })

    // Add editable flag to each match
    const matchesWithInfo = matches.map(match => ({
      ...match.toObject(),
      isEditable: isMatchEditable(match.startTime, match.status)
    }))

    return NextResponse.json({ success: true, matches: matchesWithInfo })

  } catch (error: any) {
    console.error("Admin matches error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// CREATE new match
export async function POST(req: NextRequest) {
  try {
    // Verify admin authorization
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()

    const { title, team1, team2, startTime } = await req.json()

    if (!title || !team1 || !team2 || !startTime) {
      return NextResponse.json({ success: false, message: "All fields required" }, { status: 400 })
    }

    // Validate that start time is in the future
    const matchStartTime = new Date(startTime)
    if (matchStartTime <= new Date()) {
      return NextResponse.json({ 
        success: false, 
        message: "Start time must be in the future" 
      }, { status: 400 })
    }

    const match = await Match.create({
      title,
      team1,
      team2,
      startTime: matchStartTime,
      status: "upcoming",
      questions: []
    })

    return NextResponse.json({ success: true, match })

  } catch (error: any) {
    console.error("Create match error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// UPDATE match
export async function PUT(req: NextRequest) {
  try {
    // Verify admin authorization
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()

    const { matchId, title, team1, team2, startTime, status } = await req.json()

    if (!matchId) {
      return NextResponse.json({ success: false, message: "Match ID required" }, { status: 400 })
    }

    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 })
    }

    // Check if match is editable (only upcoming matches can be edited)
    if (!isMatchEditable(match.startTime, match.status)) {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot edit match. Match has already started or is completed." 
      }, { status: 400 })
    }

    // Validate new start time if provided
    if (startTime) {
      const newStartTime = new Date(startTime)
      if (newStartTime <= new Date()) {
        return NextResponse.json({ 
          success: false, 
          message: "Start time must be in the future" 
        }, { status: 400 })
      }
      match.startTime = newStartTime
    }

    // Update allowed fields
    if (title) match.title = title
    if (team1) match.team1 = team1
    if (team2) match.team2 = team2
    
    // Only allow status change to 'completed' (not back to upcoming from live)
    if (status === 'completed') {
      match.status = status
    }

    await match.save()

    return NextResponse.json({ success: true, match })

  } catch (error: any) {
    console.error("Update match error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE match
export async function DELETE(req: NextRequest) {
  try {
    // Verify admin authorization
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()

    const { searchParams } = new URL(req.url)
    const matchId = searchParams.get('matchId')

    if (!matchId) {
      return NextResponse.json({ success: false, message: "Match ID required" }, { status: 400 })
    }

    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 })
    }

    // Only allow deletion of upcoming matches
    if (!isMatchEditable(match.startTime, match.status)) {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot delete match. Match has already started or is completed." 
      }, { status: 400 })
    }

    await Match.findByIdAndDelete(matchId)

    return NextResponse.json({ success: true, message: "Match deleted successfully" })

  } catch (error: any) {
    console.error("Delete match error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
