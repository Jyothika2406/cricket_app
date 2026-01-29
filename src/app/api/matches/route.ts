import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Match from "@/models/Match";
import { updateMatchStatuses, calculateMatchStatus } from "@/lib/match-utils";

export async function GET() {
    try {
        await dbConnect();
        
        // Update match statuses based on current time
        await updateMatchStatuses();
        
        // Fetch all matches that are 'live' or 'upcoming' (not completed)
        const matches = await Match.find({ 
            status: { $in: ['live', 'upcoming'] } 
        }).sort({ startTime: 1 });

        // Add computed fields for each match
        const matchesWithInfo = matches.map(match => {
            const matchObj = match.toObject();
            const realStatus = calculateMatchStatus(match.startTime, match.status);
            return {
                ...matchObj,
                realStatus,
                bettingAllowed: realStatus === 'upcoming' && new Date(match.startTime) > new Date()
            };
        });

        // Return proper JSON so the frontend doesn't crash
        return NextResponse.json({ matches: matchesWithInfo }, { status: 200 });
    } catch (error) {
        console.error("Database Error:", error);
        // Return an empty array instead of an error page
        return NextResponse.json({ matches: [] }, { status: 500 });
    }
}