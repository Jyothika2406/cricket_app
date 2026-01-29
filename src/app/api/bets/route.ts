import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Match from "@/models/Match"
import Bet from "@/models/Bet"
import { isBettingAllowed, updateMatchStatuses } from "@/lib/match-utils"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    // Update match statuses first
    await updateMatchStatuses()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const { matchId, questionId, selectedOption, amount } = await req.json()

    // Validate inputs
    if (!matchId || !questionId || selectedOption === undefined || !amount) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (amount < 10) {
      return NextResponse.json({ success: false, message: "Minimum bet is ₹10" }, { status: 400 })
    }

    if (amount > user.walletBalance) {
      return NextResponse.json({ success: false, message: "Insufficient balance" }, { status: 400 })
    }

    // Get match and question details
    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 })
    }

    // CRITICAL: Check if betting is allowed for this match
    if (!isBettingAllowed(match.startTime, match.status)) {
      return NextResponse.json({ 
        success: false, 
        message: "Betting is closed. Match has started or is completed." 
      }, { status: 400 })
    }

    const question = match.questions.find((q: any) => q._id.toString() === questionId)
    if (!question) {
      return NextResponse.json({ success: false, message: "Question not found" }, { status: 404 })
    }

    if (question.status !== "open") {
      return NextResponse.json({ success: false, message: "Betting is closed for this question" }, { status: 400 })
    }

    const selectedOpt = question.options[selectedOption]
    if (!selectedOpt) {
      return NextResponse.json({ success: false, message: "Invalid option" }, { status: 400 })
    }

    const odds = selectedOpt.odds
    const potentialWin = amount * odds

    // Create bet
    const bet = await Bet.create({
      userId: user._id,
      matchId,
      questionId,
      questionText: question.text,
      selectedOption: selectedOpt.text,
      amount,
      odds,
      potentialWin,
      status: "pending"
    })

    // Deduct from wallet
    await User.findByIdAndUpdate(user._id, {
      $inc: { walletBalance: -amount }
    })

    return NextResponse.json({
      success: true,
      message: "Bet placed successfully",
      bet: {
        id: bet._id,
        amount,
        odds,
        potentialWin,
        question: question.text,
        selectedOption: selectedOpt.text
      }
    })

  } catch (error: any) {
    console.error("Place bet error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// Get user's bets
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const bets = await Bet.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate('matchId', 'title team1 team2')

    return NextResponse.json({ success: true, bets })

  } catch (error: any) {
    console.error("Get bets error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
