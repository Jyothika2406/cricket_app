import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Match from "@/models/Match";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { title, text } = await req.json();
        const newMatch = await Match.create({
            title,
            status: "live",
            questions: [{
                text,
                options: [{ name: "Yes", odds: 1.9 }, { name: "No", odds: 1.9 }],
                status: "open"
            }]
        });
        return NextResponse.json({ success: true, match: newMatch });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
}