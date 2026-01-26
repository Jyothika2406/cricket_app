import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AppProvider } from "@/contexts/app-context"
import { WhatsAppSupport } from "@/components/whatsapp-support"
import AuthProvider from "@/components/auth-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased overflow-x-hidden" suppressHydrationWarning>
        {/* AuthProvider must be the outermost wrapper for session data */}
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AppProvider>
              <main className="min-h-screen max-w-md mx-auto relative bg-background border-x border-border/50 pb-16">
                {children}
                <WhatsAppSupport />
              </main>
            </AppProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}