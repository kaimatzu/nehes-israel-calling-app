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
          {/* ... right column (history, etc.) remains unchanged ... */}
          {/* keep the rest of your code here for history, etc., unchanged */}
        </div>
      </div>
    </div>
  )
}