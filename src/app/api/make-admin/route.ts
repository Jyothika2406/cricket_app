import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { verifyAdmin } from "@/lib/admin-auth"

// SECURED: Only existing admins can promote other users to admin
export async function POST(req: NextRequest) {
  try {
    // Verify that the requester is already an admin
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()
    
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Find the target user and make them admin
    const targetUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "admin" },
      { new: true }
    )

    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${targetUser.email} is now an admin!`,
      user: { email: targetUser.email, role: targetUser.role }
    })

  } catch (error: any) {
    console.error("Make admin error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}

// DELETE: Remove admin role from a user (only admins can do this)
export async function DELETE(req: NextRequest) {
  try {
    // Verify that the requester is an admin
    const auth = await verifyAdmin(req)
    if (!auth.authorized) {
      return auth.error
    }

    await dbConnect()
    
    const { searchParams } = new URL(req.url)
    const email = searchParams.get("email")
    
    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Prevent admin from removing their own admin role
    if (auth.user.email === email.toLowerCase()) {
      return NextResponse.json({ 
        success: false, 
        message: "Cannot remove your own admin role" 
      }, { status: 400 })
    }

    // Find the target user and remove admin role
    const targetUser = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: "user" },
      { new: true }
    )

    if (!targetUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `${targetUser.email} is no longer an admin`,
      user: { email: targetUser.email, role: targetUser.role }
    })

  } catch (error: any) {
    console.error("Remove admin error:", error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }
}
