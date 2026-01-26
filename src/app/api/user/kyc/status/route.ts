import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findOne({ email: session.user.email }).select("kycStatus kycData");
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            status: user.kycStatus || "none",
            bankVerified: user.kycData?.bankVerified || false,
            upiVerified: user.kycData?.upiVerified || false,
            kycData: {
                fullName: user.kycData?.fullName,
                panNumber: user.kycData?.panNumber ? "****" + user.kycData.panNumber.slice(-4) : null,
                hasBank: !!user.kycData?.bankAccountNumber,
                hasUpi: !!user.kycData?.upiId,
            }
        });
    } catch (error: any) {
        console.error("KYC status error:", error);
        return NextResponse.json({ message: error.message || "Server error" }, { status: 500 });
    }
}
