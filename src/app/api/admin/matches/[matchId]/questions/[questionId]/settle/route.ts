import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import Match from "@/models/Match"
import Bet from "@/models/Bet"

// Settle a question (mark correct answer and process bets)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string; questionId: string }> }
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

    const { matchId, questionId } = await params
    const { correctOption } = await req.json()

    if (correctOption === undefined || correctOption === null) {
      return NextResponse.json({ success: false, message: "Correct option required" }, { status: 400 })
    }

    // Get the match and question
    const match = await Match.findById(matchId)
    if (!match) {
      return NextResponse.json({ success: false, message: "Match not found" }, { status: 404 })
    }

    const question = match.questions.find((q: any) => q._id.toString() === questionId)
    if (!question) {
      return NextResponse.json({ success: false, message: "Question not found" }, { status: 404 })
    }

    const correctOptionText = question.options[correctOption]?.text

    // Update the question status and correct option
    await Match.findOneAndUpdate(
      { 
        _id: matchId,
        "questions._id": questionId 
      },
      {
        $set: {
          "questions.$.status": "settled",
          "questions.$.correctOption": correctOption
        }
      }
    )

    // Process all bets for this question
    const bets = await Bet.find({ 
      matchId, 
      questionId,
      status: "pending"
    })

    let totalWinners = 0
    let totalLosers = 0
    let totalPayout = 0

    for (const bet of bets) {
      const isWinner = bet.selectedOption === correctOptionText

      if (isWinner) {
        // Winner - credit winnings to wallet
        const payout = bet.amount * bet.odds
        
        await User.findByIdAndUpdate(bet.userId, {
          $inc: { walletBalance: payout }
        })

        await Bet.findByIdAndUpdate(bet._id, {
          status: "won",
          payout: payout
        })

        totalWinners++
        totalPayout += payout
      } else {
        // Loser - money already deducted, just update status
        await Bet.findByIdAndUpdate(bet._id, {
          status: "lost",
          payout: 0
        })

        totalLosers++
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Question settled. ${totalWinners} winners, ${totalLosers} losers.`,
      stats: {
        totalBets: bets.length,
        winners: totalWinners,
        losers: totalLosers,
        totalPayout
      }
    })

  } catch (error: any) {
    console.error("Settle question error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
