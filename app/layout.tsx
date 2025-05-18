import type React from "react"
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
          <LanguageProvider defaultLanguage="en">{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
