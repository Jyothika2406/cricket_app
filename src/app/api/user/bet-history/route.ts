import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Bet from "@/models/Bet";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions); //
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const bets = await Bet.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json({ bets });
}