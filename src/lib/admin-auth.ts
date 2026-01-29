import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import User from "@/models/User"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export interface AdminAuthResult {
  authorized: boolean
  user?: any
  session?: any
  error?: NextResponse
}

/**
 * Middleware to verify admin authentication
 * Use this in all admin API routes to ensure proper authorization
 */
export async function verifyAdmin(req?: NextRequest): Promise<AdminAuthResult> {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is logged in
    if (!session?.user?.email) {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, message: "Unauthorized - Please log in" },
          { status: 401 }
        )
      }
    }

    await dbConnect()
    
    // Fetch user from database to verify role (never trust session alone)
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        )
      }
    }

    // Verify admin role from database
    if (user.role !== "admin") {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, message: "Forbidden - Admin access required" },
          { status: 403 }
        )
      }
    }

    return {
      authorized: true,
      user,
      session
    }
  } catch (error) {
    console.error("Admin auth error:", error)
    return {
      authorized: false,
      error: NextResponse.json(
        { success: false, message: "Authentication error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Middleware to verify user authentication
 */
export async function verifyUser(req?: NextRequest): Promise<AdminAuthResult> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, message: "Unauthorized - Please log in" },
          { status: 401 }
        )
      }
    }

    await dbConnect()
    
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return {
        authorized: false,
        error: NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        )
      }
    }

    return {
      authorized: true,
      user,
      session
    }
  } catch (error) {
    console.error("User auth error:", error)
    return {
      authorized: false,
      error: NextResponse.json(
        { success: false, message: "Authentication error" },
        { status: 500 }
      )
    }
  }
}
