"use client"

import { useState } from "react"
import { Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Keypad } from "@/components/keypad"
import { bridgeCall } from "@/lib/api"
import { useSidebar } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { useLanguage } from "@/components/language-provider"

export default function CallingApp() {
  const [agentNumber, setAgentNumber] = useState("")
  const [customerNumber, setCustomerNumber] = useState("")
  const [isCallInProgress, setIsCallInProgress] = useState(false)
  const { toggleSidebar } = useSidebar()
  const { t, dir } = useLanguage()

  const handleCall = async () => {
    if (!agentNumber || !customerNumber) return

    setIsCallInProgress(true)
    try {
      await bridgeCall(agentNumber, customerNumber)
    } catch (error) {
      console.error("Failed to bridge call:", error)
    } finally {
      setIsCallInProgress(false)
    }
  }

  // Determine icon position based on language direction
  const phoneIconClass = dir === "rtl" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-[#122347]" dir={dir}>
      <AppHeader />

      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground dark:text-white">{t("app.title")}</h1>
            <p className="text-muted-foreground dark:text-gray-300">{t("app.subtitle")}</p>
          </div>

          <div className="space-y-4 p-6 border rounded-lg shadow-sm dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
            <div className="space-y-2">
              <Label htmlFor="agentNumber" className="text-foreground dark:text-[#D29D0E]">
                {t("agent.number")}
              </Label>
              <Input
                id="agentNumber"
                type="tel"
                placeholder={t("placeholder.agent")}
                value={agentNumber}
                onChange={(e) => setAgentNumber(e.target.value)}
                className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerNumber" className="text-foreground dark:text-[#D29D0E]">
                {t("customer.number")}
              </Label>
              <Input
                id="customerNumber"
                type="tel"
                placeholder={t("placeholder.customer")}
                value={customerNumber}
                onChange={(e) => setCustomerNumber(e.target.value)}
                className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
              />
            </div>

            <Keypad value={customerNumber} onChange={setCustomerNumber} />

            <Button
              onClick={handleCall}
              disabled={isCallInProgress || !agentNumber || !customerNumber}
              className="w-full bg-[#122347] hover:bg-[#122347]/90 text-white dark:bg-[#D29D0E] dark:hover:bg-[#D29D0E]/90 dark:text-[#122347]"
            >
              <Phone className={phoneIconClass} />
              {isCallInProgress ? t("button.connecting") : t("button.bridge")}
            </Button>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={toggleSidebar}
              className="text-[#122347] border-[#122347] hover:bg-[#122347]/10 dark:text-[#D29D0E] dark:border-[#D29D0E] dark:hover:bg-[#D29D0E]/10"
            >
              {t("button.viewHistory")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
