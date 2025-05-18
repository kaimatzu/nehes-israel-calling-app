"use client"

import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useLanguage } from "@/components/language-provider"

export function AppHeader() {
  const { dir } = useLanguage()

  return (
    <header className="w-full p-4 flex items-center justify-between">
      <div className="flex items-center">
        <Image src="/images/logo.png" alt="Nehes Israel Logo" width={180} height={80} className="h-auto" />
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </header>
  )
}
