"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { fetchCallHistory, type CallRecord } from "@/lib/api"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { useLanguage } from "@/components/language-provider"
import { getStatusIcon, statusKey } from "@/lib/ui"
import { ArrowLeft } from "lucide-react"

export default function CallHistoryPage() {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { t, dir } = useLanguage()

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
    <div className="min-h-screen bg-background dark:bg-[#122347]" dir={dir}>
      <AppHeader />

      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="text-[#122347] dark:text-[#D29D0E]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("history.back")}
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-[#122347] dark:text-[#D29D0E]">{t("history.title")}</h1>
          <p className="text-gray-500 dark:text-gray-300">{t("history.fullTitle")}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122347] dark:border-[#D29D0E]"></div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#122347] text-white dark:bg-[#D29D0E] dark:text-[#122347]">
                    <th className="p-3 text-left">{t("table.datetime")}</th>
                    <th className="p-3 text-left">{t("table.customer")}</th>
                    <th className="p-3 text-left">{t("table.agent")}</th>
                    <th className="p-3 text-left">{t("table.status")}</th>
                    <th className="p-3 text-left">{t("table.duration")}</th>
                  </tr>
                </thead>
                <tbody>
                  {callHistory.map((call: CallRecord) => (
                    <tr
                      key={call.id}
                      className="border-b hover:bg-gray-50 dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10"
                    >
                      <td className="p-3 dark:text-white">{format(new Date(call.timestamp), "MMM d, yyyy h:mm a")}</td>
                      <td className="p-3 dark:text-white">{call.customerNumber}</td>
                      <td className="p-3 dark:text-white">{call.agentNumber}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          {getStatusIcon(statusKey(call.status))}
                          <span className="dark:text-white">
                            {(() => {
                              const key = statusKey(call.status);
                              if (key === "completed" || key === "in_progress" || key === "in-progress")
                                return t("status.connected");
                              if (key === "busy") return t("status.busy");
                              if (key === "failed") return t("status.failed");
                              if (key === "no_answer" || key === "noanswer") return t("status.noanswer");
                              if (key === "canceled") return t("status.canceled");
                              if (key === "queued") return t("status.queued");
                              if (key === "initiated") return t("status.initiated");
                              if (key === "ringing") return t("status.ringing");
                              return t("status.unknown");
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 dark:text-white">{call.duration > 0 ? `${call.duration} seconds` : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
