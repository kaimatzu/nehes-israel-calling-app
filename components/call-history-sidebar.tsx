"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Phone, PhoneOff } from "lucide-react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarRail } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { fetchCallHistory, type CallRecord } from "@/lib/api"
import { useLanguage } from "@/components/language-provider"

export function CallHistorySidebar() {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t, dir } = useLanguage()

  // Determine sidebar position based on language direction
  const sidebarSide = dir === "rtl" ? "left" : "right"

  useEffect(() => {
    const loadCallHistory = async () => {
      try {
        const history = await fetchCallHistory()
        setCallHistory(history)
      } catch (error) {
        console.error("Failed to load call history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCallHistory()
  }, [])

  return (
    <Sidebar side={sidebarSide} variant="floating" collapsible="offcanvas">
      <SidebarHeader className="border-b dark:border-[#D29D0E]/30">
        <div className="p-4" dir={dir}>
          <h2 className="text-xl font-bold text-[#122347] dark:text-[#D29D0E]">{t("history.title")}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-300">{t("history.subtitle")}</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122347] dark:border-[#D29D0E]"></div>
          </div>
        ) : (
          <div className="space-y-2 p-4" dir={dir}>
            {callHistory.map((call) => (
              <div
                key={call.id}
                className="p-3 border rounded-md hover:bg-gray-50 transition-colors dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-[#122347] dark:text-[#D29D0E]">{call.customerNumber}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {t("table.agent")}: {call.agentNumber}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-400">
                      {format(new Date(call.timestamp), "MMM d, yyyy h:mm a")}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    {call.status === "connected" ? (
                      <>
                        <Phone className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-gray-500 dark:text-gray-300">{call.duration}s</span>
                      </>
                    ) : (
                      <PhoneOff className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t p-4 dark:border-[#D29D0E]/30">
        <Button
          variant="outline"
          className="w-full text-[#122347] border-[#122347] hover:bg-[#D29D0E]/10 dark:text-[#D29D0E] dark:border-[#D29D0E] dark:hover:bg-[#D29D0E]/10"
          onClick={() => window.open("/call-history", "_blank")}
        >
          {t("history.viewFull")}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
