import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { fullName, pan, aadhaar, bankAccount, ifsc, bankName, upiId } = body;

        // Validation - PAN and Aadhaar required
        if (!pan || !aadhaar) {
            return NextResponse.json({ message: "PAN and Aadhaar are required" }, { status: 400 });
        }

        if (!fullName) {
            return NextResponse.json({ message: "Full name is required" }, { status: 400 });
        }

        // Must have either Bank OR UPI
        const hasBankDetails = bankAccount && ifsc;
        const hasUpiDetails = upiId;

        if (!hasBankDetails && !hasUpiDetails) {
            return NextResponse.json({ 
                message: "Please provide either Bank Account OR UPI ID for withdrawals" 
            }, { status: 400 });
        }

        // Prepare KYC data
        const kycData: any = {
            fullName,
            panNumber: pan.toUpperCase(),
            aadhaarNumber: aadhaar,
            submittedAt: new Date(),
            bankVerified: false,
            upiVerified: false,
        };

        // Add bank details if provided
        if (hasBankDetails) {
            kycData.bankAccountNumber = bankAccount;
            kycData.ifscCode = ifsc.toUpperCase();
            kycData.bankName = bankName || "";
        }

        // Add UPI if provided
        if (hasUpiDetails) {
            kycData.upiId = upiId.toLowerCase();
        }

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                kycStatus: "pending",
                kycData
            },
            { new: true }
        );

        return NextResponse.json({ 
            success: true, 
            status: updatedUser.kycStatus,
            message: "KYC submitted successfully. Verification in progress."
        });
    } catch (error: any) {
        console.error("KYC Submit Error:", error);
        return NextResponse.json({ message: error.message || "Server Error" }, { status: 500 });
    }
}