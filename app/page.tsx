"use client"

import { useState, useRef, useEffect, JSX } from "react"
import { Users, CheckCircle, AlertCircle, Clock, Phone, PhoneOff } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Keypad } from "@/components/keypad"
import { bridgeCall, tripleCallLeads, fetchCallHistory, type CallRecord, type Lead } from "@/lib/api"
import { AppHeader } from "@/components/app-header"
import { useLanguage } from "@/components/language-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { statusKey } from "@/lib/ui"

export default function CallingApp() {
  const [agentNumber, setAgentNumber] = useState("")
  const [customerNumbers, setCustomerNumbers] = useState<string[]>(["", "", ""])
  const [isCallInProgress, setIsCallInProgress] = useState(false)
  const [isTripleCallInProgress, setIsTripleCallInProgress] = useState(false)
  const [callHistory, setCallHistory] = useState<CallRecord[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [activeLeads, setActiveLeads] = useState<Lead[]>([])
  const [tripleCallStatus, setTripleCallStatus] = useState<{
    show: boolean
    success: boolean
    message: string
  }>({ show: false, success: false, message: "" })
  const [focusedInput, setFocusedInput] = useState<"agent" | { type: "customer", idx: number } | null>(null)

  const agentInputRef = useRef<HTMLInputElement>(null)

  const { t, dir } = useLanguage()

  // Load call history on component mount
  useEffect(() => {
    const loadCallHistory = async () => {
      try {
        const history = await fetchCallHistory()
        setCallHistory(history)
      } catch (error) {
        console.error("Failed to load call history:", error)
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadCallHistory()
  }, [])

  const handleCall = async () => {
    if (!agentNumber || customerNumbers.every(num => !num.trim())) return
    const numbersList = customerNumbers.filter(num => !!num.trim())
    if (numbersList.length === 0) return

    setIsCallInProgress(true)
    try {
      await bridgeCall(agentNumber, numbersList)

      // Refresh call history after a successful call
      const history = await fetchCallHistory()
      setCallHistory(history)
    } catch (error) {
      console.error("Failed to bridge call:", error)
    } finally {
      setIsCallInProgress(false)
    }
  }

  const handleTripleCall = async () => {
    setIsTripleCallInProgress(true)
    setTripleCallStatus({ show: false, success: false, message: "" })
    setActiveLeads([])

    try {
      const result = await tripleCallLeads(agentNumber)

      setTripleCallStatus({
        show: true,
        success: result.success,
        message: result.success
          ? `Successfully initiated calls to ${result.leads.length} leads`
          : "Failed to initiate triple call",
      })

      // Set active leads for display
      if (result.success && result.leads.length > 0) {
        setActiveLeads(result.leads)
      }

      // If we have a lead and all fields are empty, populate the first
      if (result.leads.length > 0 && customerNumbers.every(num => !num)) {
        setCustomerNumbers([
          result.leads[0].phoneNumber, 
          ...customerNumbers.slice(1)
        ])
      }

      // Refresh call history after a successful triple call
      const history = await fetchCallHistory()
      setCallHistory(history)

      setTimeout(() => setTripleCallStatus((prev) => ({ ...prev, show: false })), 5000)
    } catch (error) {
      console.error("Failed to initiate triple call:", error)
      setTripleCallStatus({
        show: true,
        success: false,
        message: "An error occurred while initiating triple call",
      })
      setTimeout(() => setTripleCallStatus((prev) => ({ ...prev, show: false })), 5000)
    } finally {
      setIsTripleCallInProgress(false)
    }
  }

  // Handle keypad input
  const handleKeypadInput = (value: string) => {
    if (focusedInput === "agent") {
      setAgentNumber(agentNumber + value)
    } else if (
      focusedInput &&
      typeof focusedInput === "object" &&
      focusedInput.type === "customer"
    ) {
      const { idx } = focusedInput
      const newNumbers = [...customerNumbers]
      newNumbers[idx] += value
      setCustomerNumbers(newNumbers)
    } else {
      // Default: update the first empty customer number or the first box
      const idx =
        customerNumbers.findIndex(num => num === "") >= 0
          ? customerNumbers.findIndex(num => num === "")
          : 0
      const newNumbers = [...customerNumbers]
      newNumbers[idx] += value
      setCustomerNumbers(newNumbers)
      setFocusedInput({ type: "customer", idx })
    }
  }

  // Handle keypad backspace
  const handleKeypadBackspace = () => {
    if (focusedInput === "agent") {
      setAgentNumber(agentNumber.slice(0, -1))
    } else if (
      focusedInput &&
      typeof focusedInput === "object" &&
      focusedInput.type === "customer"
    ) {
      const { idx } = focusedInput
      const newNumbers = [...customerNumbers]
      newNumbers[idx] = newNumbers[idx].slice(0, -1)
      setCustomerNumbers(newNumbers)
    } else {
      // Backspace on last non-empty customer box
      const idx = customerNumbers
        .map(num => !!num)
        .lastIndexOf(true)
      if (idx >= 0) {
        const newNumbers = [...customerNumbers]
        newNumbers[idx] = newNumbers[idx].slice(0, -1)
        setCustomerNumbers(newNumbers)
        setFocusedInput({ type: "customer", idx })
      }
    }
  }

  const loadCallHistory = async () => {
    try {
      const history = await fetchCallHistory()
      setCallHistory(history)
    } catch (error) {
      console.error("Failed to load call history:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    // Initial load on mount
    loadCallHistory()

    // Set up interval to reload every 10 seconds (10,000 ms)
    const interval = setInterval(() => {
      loadCallHistory()
    }, 10000)

    return () => clearInterval(interval) // cleanup when component unmounts
  }, [])
  
  // Icon/class helpers
  const iconMarginClass = dir === "rtl" ? "ml-1" : "mr-1"
  const phoneIconClass = dir === "rtl" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"
  const usersIconClass = dir === "rtl" ? "ml-2 h-5 w-5" : "mr-2 h-5 w-5"
  const flexDirection = dir === "rtl" ? "flex-row-reverse" : "flex-row"

  // Status helpers
  const getStatusText = (status: string) => {
    const key = statusKey(status || "unknown")
    if (key === "completed" || key === "in_progress" || key === "in-progress") return t("status.connected")
    if (key === "busy") return t("status.busy")
    if (key === "failed") return t("status.failed")
    if (key === "no_answer" || key === "noanswer") return t("status.noanswer")
    if (key === "canceled") return t("status.canceled")
    if (key === "queued") return t("status.queued")
    if (key === "initiated") return t("status.initiated")
    if (key === "ringing") return t("status.ringing")
    return t("status.unknown")
  }

  const renderStatusWithIcon = (status: string) => {
    if (!status) {
      return (
        <div className="flex items-center">
          <PhoneOff className={`h-4 w-4 text-gray-600 ${iconMarginClass}`} />
          <span className="dark:text-white">{t("status.unknown")}</span>
        </div>
      )
    }
    const key = statusKey(status)
    let icon: JSX.Element
    if (key === "completed" || key === "in_progress" || key === "in-progress") {
      icon = <Phone className={`h-4 w-4 text-green-500 ${iconMarginClass}`} />
    } else if (key === "busy") {
      icon = <AlertCircle className={`h-4 w-4 text-orange-500 ${iconMarginClass}`} />
    } else if (key === "failed") {
      icon = <PhoneOff className={`h-4 w-4 text-red-500 ${iconMarginClass}`} />
    } else if (key === "no_answer" || key === "noanswer") {
      icon = <AlertCircle className={`h-4 w-4 text-yellow-500 ${iconMarginClass}`} />
    } else if (key === "canceled") {
      icon = <PhoneOff className={`h-4 w-4 text-gray-400 ${iconMarginClass}`} />
    } else if (key === "queued" || key === "initiated") {
      icon = <Clock className={`h-4 w-4 text-blue-500 ${iconMarginClass}`} />
    } else if (key === "ringing") {
      icon = <Phone className={`h-4 w-4 text-blue-500 ${iconMarginClass}`} />
    } else {
      icon = <PhoneOff className={`h-4 w-4 text-gray-600 ${iconMarginClass}`} />
    }
    return (
      <div className="flex items-center">
        {icon}
        <span className="dark:text-white">{getStatusText(status)}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-[#122347]" dir={dir}>
      <AppHeader />
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className={`flex flex-row lg:${flexDirection} gap-6`}>
          <div className="lg:w-1/3">
            <Card className="h-full dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground dark:text-white">
                  {t("dialer.title")}
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-300">
                  {t("dialer.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleTripleCall}
                  disabled={isTripleCallInProgress}
                  className="w-full bg-[#122347] hover:bg-[#122347]/90 text-white dark:bg-[#D29D0E] dark:hover:bg-[#D29D0E]/90 dark:text-[#122347] py-6 text-lg"
                  size="lg"
                >
                  <Users className={usersIconClass} />
                  {isTripleCallInProgress ? t("button.callingLeads") : t("button.tripleCall")}
                </Button>

                <div className="my-4 relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t dark:border-[#D29D0E]/30"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card dark:bg-[#122347]/50 px-2 text-muted-foreground dark:text-[#D29D0E]">
                      {t("or")}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentNumber" className="text-foreground dark:text-[#D29D0E]">
                    {t("agent.number")}
                  </Label>
                  <Input
                    id="agentNumber"
                    ref={agentInputRef}
                    type="tel"
                    placeholder={t("placeholder.agent")}
                    value={agentNumber}
                    onChange={(e) => setAgentNumber(e.target.value)}
                    onFocus={() => setFocusedInput("agent")}
                    className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerNumbers" className="text-foreground dark:text-[#D29D0E]">
                    {t("customer.number")}
                  </Label>
                  <div className="flex flex-col space-y-2">
                    {customerNumbers.map((num, idx) => (
                      <Input
                        key={idx}
                        id={`customerNumber${idx}`}
                        type="tel"
                        placeholder={t("placeholder.customer")}
                        value={num}
                        onChange={e => {
                          const newNumbers = [...customerNumbers];
                          newNumbers[idx] = e.target.value;
                          setCustomerNumbers(newNumbers);
                        }}
                        onFocus={() => setFocusedInput({ type: "customer", idx })}
                        className="border-input dark:border-[#D29D0E]/50 dark:bg-[#122347]/80 dark:text-white focus-visible:ring-[#D29D0E]"
                      />
                    ))}
                  </div>
                </div>

                <Keypad onKeyPress={handleKeypadInput} onBackspace={handleKeypadBackspace} />

                <Button
                  onClick={handleCall}
                  disabled={isCallInProgress || !agentNumber || customerNumbers.every(n => !n.trim())}
                  className="w-full bg-[#122347] hover:bg-[#122347]/90 text-white dark:bg-[#D29D0E] dark:hover:bg-[#D29D0E]/90 dark:text-[#122347]"
                >
                  <Phone className={phoneIconClass} />
                  {isCallInProgress ? t("button.connecting") : t("button.bridge")}
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Right/Left column - Dashboard */}
          <div className="lg:w-2/3 space-y-6">
            {/* Status alerts */}
            {tripleCallStatus.show && (
              <Alert
                className={
                  tripleCallStatus.success
                    ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900"
                }
              >
                {tripleCallStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <AlertTitle
                  className={
                    tripleCallStatus.success ? "text-green-800 dark:text-green-400" : "text-red-800 dark:text-red-400"
                  }
                >
                  {tripleCallStatus.success ? t("alert.success") : t("alert.error")}
                </AlertTitle>
                <AlertDescription
                  className={
                    tripleCallStatus.success ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                  }
                >
                  {tripleCallStatus.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Active leads section */}
            {activeLeads.length > 0 && (
              <Card className="dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-bold text-foreground dark:text-white">
                    {t("activeLeads.title")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-gray-300">
                    {t("activeLeads.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 border rounded-md dark:border-[#D29D0E]/30 bg-background dark:bg-[#122347]/80"
                      >
                        <div className="font-medium text-foreground dark:text-[#D29D0E]">{lead.name}</div>
                        <div className="text-sm text-muted-foreground dark:text-gray-300">{lead.phoneNumber}</div>
                        <div className="mt-2 flex items-center text-xs text-muted-foreground dark:text-gray-400">
                          <Clock className={`h-3 w-3 ${iconMarginClass}`} />
                          <span>{t("activeLeads.inProgress")}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Call history section */}
            <Card className="dark:border-[#D29D0E]/30 dark:bg-[#122347]/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-foreground dark:text-white">
                  {t("history.title")}
                </CardTitle>
                <CardDescription className="text-muted-foreground dark:text-gray-300">
                  {t("history.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="recent" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="recent">{t("history.tabs.recent")}</TabsTrigger>
                    <TabsTrigger value="all">{t("history.tabs.all")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="recent" className="mt-0">
                    {isLoadingHistory ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122347] dark:border-[#D29D0E]"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {callHistory.slice(0, 5).map((call) => (
                          <div
                            key={call.id}
                            className="p-3 border rounded-md hover:bg-gray-50 transition-colors dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-medium text-foreground dark:text-[#D29D0E]">
                                  {call.customerNumber}
                                </div>
                                <div className="text-sm text-muted-foreground dark:text-gray-300">
                                  {t("table.agent")}: {call.agentNumber}
                                </div>
                                <div className="text-xs text-muted-foreground/70 dark:text-gray-400">
                                  {format(new Date(call.timestamp), "MMM d, yyyy h:mm a")}
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                {renderStatusWithIcon(call.status)}
                                {call.duration > 0 && (
                                  <span className="text-xs text-muted-foreground dark:text-gray-300">
                                    {call.duration}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="all" className="mt-0">
                    {isLoadingHistory ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#122347] dark:border-[#D29D0E]"></div>
                      </div>
                    ) : (
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
                            {callHistory.map((call) => (
                              <tr
                                key={call.id}
                                className="border-b hover:bg-gray-50 dark:border-[#D29D0E]/30 dark:hover:bg-[#D29D0E]/10"
                              >
                                <td className="p-3 dark:text-white">
                                  {format(new Date(call.timestamp), "MMM d, yyyy h:mm a")}
                                </td>
                                <td className="p-3 dark:text-white">{call.customerNumber}</td>
                                <td className="p-3 dark:text-white">{call.agentNumber}</td>
                                <td className="p-3">{renderStatusWithIcon(call.status)}</td>
                                <td className="p-3 dark:text-white">
                                  {call.duration > 0 ? `${call.duration} seconds` : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}