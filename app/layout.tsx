import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CallHistorySidebar } from "@/components/call-history-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import "./globals.css"

export const metadata = {
  title: "Nehes Israel - Calling App",
  description: "Bridge calls to agents via Twilio",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <LanguageProvider defaultLanguage="en">
            <SidebarProvider defaultOpen={false}>
              <div className="flex min-h-screen">
                <div className="flex-1 flex flex-col">
                  <main className="flex-1">{children}</main>
                </div>
                <CallHistorySidebar />
              </div>
            </SidebarProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
