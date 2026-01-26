import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Match from "@/models/Match";

export async function GET() {
    try {
        await dbConnect();
        // Fetch all matches that are 'live' or 'upcoming' (not completed)
        const matches = await Match.find({ 
            status: { $in: ['live', 'upcoming'] } 
        }).sort({ createdAt: -1 });

        // Return proper JSON so the frontend doesn't crash
        return NextResponse.json({ matches }, { status: 200 });
    } catch (error) {
        console.error("Database Error:", error);
        // Return an empty array instead of an error page
        return NextResponse.json({ matches: [] }, { status: 500 });
    }
}