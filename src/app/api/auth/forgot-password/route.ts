import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import mongoose from "mongoose";

// Simple Schema for OTP storage
const OtpSchema = new mongoose.Schema({
    email: String,
    otp: String,
    type: { type: String, default: "forgot-password" },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-deletes after 10 mins
});

// Prevent model overwrite error
const OtpModel = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        
        console.log("[FORGOT PASSWORD] Request for email:", email);

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 1. Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            console.log("[FORGOT PASSWORD] Connecting to MongoDB...");
            await mongoose.connect(process.env.MONGODB_URI!);
            console.log("[FORGOT PASSWORD] MongoDB connected");
        }

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log("[FORGOT PASSWORD] Generated OTP:", otp);

        // 3. Save OTP to MongoDB
        await OtpModel.findOneAndUpdate(
            { email, type: "forgot-password" },
            { otp, createdAt: new Date() },
            { upsert: true }
        );
        console.log("[FORGOT PASSWORD] OTP saved to database");

        // 4. Configure Email
        console.log("[FORGOT PASSWORD] Configuring email transporter...");
        console.log("[FORGOT PASSWORD] EMAIL_SERVER_USER:", process.env.EMAIL_SERVER_USER);
        
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });

        // 5. Send the Mail
        console.log("[FORGOT PASSWORD] Sending email to:", email);
        await transporter.sendMail({
            from: `"CricBet Skill Support" <${process.env.EMAIL_SERVER_USER}>`,
            to: email,
            subject: "Reset Your Password - CricBet Skill",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #f97316;">CRICBET <span style="background-color: #1a2234; color: white; padding: 2px 6px; border-radius: 4px;">SK<span style="color: #f97316;">I</span>LL</span> Password Reset</h2>
                <p>You requested to reset your password. Use the code below:</p>
                <h1 style="background: #eee; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
                <p>This code expires in 10 minutes.</p>
                <p style="font-size: 12px; color: #888;">If you didn't request this, please ignore this email.</p>
              </div>
            `,
        });
        
        console.log("[FORGOT PASSWORD] Email sent successfully!");

        return NextResponse.json({ success: true, message: "OTP sent successfully" });
    } catch (error: any) {
        console.error("[FORGOT PASSWORD] ERROR:", error);
        return NextResponse.json({ 
            error: error.message || "Failed to send OTP",
            details: error.toString()
        }, { status: 500 });
    }
}