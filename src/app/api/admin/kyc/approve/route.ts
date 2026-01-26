import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await dbConnect()
    
    const adminUser = await User.findOne({ email: session.user.email })
    
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 })
    }

    const { userId, status, reason, verifyBank, verifyUpi } = await req.json()

    if (!userId || !["verified", "rejected"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 })
    }

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {
      kycStatus: status,
    }

    if (status === "verified") {
      updateData["kycData.verifiedAt"] = new Date()
      
      // Verify Bank if requested (or if bank details exist)
      if ((verifyBank !== false) && user.kycData?.bankAccountNumber) {
        updateData["kycData.bankVerified"] = true
      }
      
      // Verify UPI if requested (or if UPI exists)
      if ((verifyUpi !== false) && user.kycData?.upiId) {
        updateData["kycData.upiVerified"] = true
      }
    } else if (status === "rejected") {
      updateData["kycData.rejectionReason"] = reason || "Verification failed"
      updateData["kycData.bankVerified"] = false
      updateData["kycData.upiVerified"] = false
    }

    await User.findByIdAndUpdate(userId, updateData)

    return NextResponse.json({ 
      success: true, 
      message: `KYC ${status === "verified" ? "approved" : "rejected"} successfully` 
    })

  } catch (error: any) {
    console.error("KYC approve error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
