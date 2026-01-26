import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Bet from "@/models/Bet";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { userId, questionId, questionText, selectedOption, amount, odds } = await req.json();

        // 1. Validation
        if (!userId || !questionId || !amount) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // 2. Check User Balance
        const user = await User.findById(userId);
        if (!user || user.walletBalance < amount) {
            return NextResponse.json({ message: "Insufficient Balance. Please add funds." }, { status: 400 });
        }

        // 3. Deduct Balance and Create Bet (Atomic Transaction)
        await User.findByIdAndUpdate(userId, {
            $inc: { walletBalance: -amount }
        });

        const newBet = await Bet.create({
            userId,
            questionId,
            questionText,
            selectedOption,
            amount,
            odds,
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            message: "Bet placed successfully!",
            newBalance: user.walletBalance - amount
        }, { status: 200 });

    } catch (error) {
        console.error("Bet Placement Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}