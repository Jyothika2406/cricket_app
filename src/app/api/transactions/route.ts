import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import Transaction from "@/models/Transaction";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        await dbConnect();
        
        const { userId } = await req.json();
        
        // If userId provided, use it, otherwise use session user
        let targetUserId = userId;
        
        if (!targetUserId && session?.user?.email) {
            const user = await User.findOne({ email: session.user.email });
            targetUserId = user?._id;
        }

        if (!targetUserId) {
            return NextResponse.json([], { status: 200 });
        }

        // Fetch all transactions for this user, sorted by newest first
        const transactions = await Transaction.find({ userId: targetUserId })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json(transactions, { status: 200 });
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        
        const user = await User.findOne({ email: session.user.email });
        
        if (!user) {
            return NextResponse.json([], { status: 200 });
        }

        const transactions = await Transaction.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        return NextResponse.json({ success: true, transactions }, { status: 200 });
    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}