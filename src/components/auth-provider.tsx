"use client"

import { SessionProvider } from "next-auth/react"
import React from "react"

/**
 * This provider wraps the application to enable NextAuth session hooks 
 * like useSession() in client components.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>
}