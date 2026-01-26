import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGODB_URI!);
        }

        // 1. Verify if OTP exists and matches for this email
        // We use the direct collection access to be sure we find the record
        const otpRecord = await mongoose.connection.db.collection("otps").findOne({ email, otp });

        if (!otpRecord) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        // 2. Hash the new password for security
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update the User's password in the 'users' collection
        const userUpdate = await mongoose.connection.db.collection("users").updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );

        if (userUpdate.matchedCount === 0) {
            return NextResponse.json({ error: "User with this email does not exist" }, { status: 404 });
        }

        // 4. Delete the OTP record so it cannot be used again
        await mongoose.connection.db.collection("otps").deleteOne({ _id: otpRecord._id });

        return NextResponse.json({ success: true, message: "Password updated successfully. Please login." });
    } catch (error: any) {
        console.error("RESET PASSWORD ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}