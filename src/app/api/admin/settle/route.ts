import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Bet from "@/models/Bet";
import Match from "@/models/Match";

const ADMIN_1_ID = "6970c12481778b43a93fde52"; // Sri Venkata Lalitha Jyothika Nookala
const ADMIN_2_ID = "PARTNER_ADMIN_ID_HERE"; // Put your partner's ID here

export async function POST(req: Request) {
    await dbConnect();
    const { questionId, winningOption } = await req.json();

    const bets = await Bet.find({ questionId, status: "pending" });
    let totalAdminProfit = 0;

    for (const bet of bets) {
        const user = await User.findById(bet.userId);
        if (bet.selectedOption === winningOption) {
            user.walletBalance += (bet.amount * 1.9); // Pay winnings
            bet.status = "won";
            await user.save();
        } else {
            totalAdminProfit += bet.amount; // Collect losses
            bet.status = "lost";
        }
        await bet.save();
    }

    // SPLIT PROFIT 50/50 BETWEEN BOTH ADMINS
    if (totalAdminProfit > 0) {
        const split = totalAdminProfit / 2;
        await User.findByIdAndUpdate(ADMIN_1_ID, { $inc: { walletBalance: split } });
        await User.findByIdAndUpdate(ADMIN_2_ID, { $inc: { walletBalance: split } });
    }

    await Match.updateOne({ "questions._id": questionId }, { $set: { "questions.$.status": "settled", status: "finished" } });

    return NextResponse.json({ message: `Settled! ₹${totalAdminProfit / 2} added to both admins.` });
}