import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { Question } from "@/lib/models";

export async function GET() {
    await connectToDB();
    // Fetch only 'live' questions
    const questions = await Question.find({ status: "live" }).sort({ _id: -1 });
    return NextResponse.json({ questions });
}