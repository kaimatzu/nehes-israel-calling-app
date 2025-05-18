"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => setLanguage(language === "en" ? "he" : "en")}
            className="border-[#D29D0E] text-[#D29D0E] hover:bg-[#122347]/20 hover:text-[#D29D0E]"
          >
            {language === "en" ? "עברית" : "English"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{language === "en" ? "Switch to Hebrew" : "Switch to English"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
