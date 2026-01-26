import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        // UPDATED: Matching your .env variable names
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST, // smtp.gmail.com
            port: Number(process.env.EMAIL_SERVER_PORT), // 587
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_SERVER_USER, // svljyothikanookala@gmail.com
                pass: process.env.EMAIL_SERVER_PASSWORD, // vjxkaultjvasnmcx
            },
        });

        await transporter.sendMail({
            from: `"CricBet Skill Support" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: `Verification Code: ${otp}`,
            html: `
        <div style="background-color: #000; color: #fff; padding: 20px; font-family: sans-serif;">
          <h1 style="color: #f97316;">CRICBET <span style="background-color: #1a2234; color: white; padding: 2px 6px; border-radius: 4px;">SK<span style="color: #f97316;">I</span>LL</span></h1>
          <p>Your verification code is:</p>
          <h2 style="letter-spacing: 4px; font-size: 32px;">${otp}</h2>
        </div>
      `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Nodemailer Error:", error);
        return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
    }
}