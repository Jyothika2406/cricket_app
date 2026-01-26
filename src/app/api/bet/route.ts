import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await dbConnect();

        // Find User
        const user = await User.findOne({ email: session.user.email });

        // Get History safely
        const history = user?.bettingHistory ? user.bettingHistory.reverse() : [];

        return NextResponse.json({ history }, { status: 200 });
    } catch (error) {
        console.error("History Error:", error);
        return NextResponse.json({ message: "Server Error" }, { status: 500 });
    }
}