"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "he"

type Translations = {
  [key: string]: {
    en: string
    he: string
  }
}

// Add all translations here
const translations: Translations = {
  "app.title": {
    en: "Calling App",
    he: "אפליקציית שיחות",
  },
  "app.subtitle": {
    en: "Bridge calls to your phone",
    he: "גשר שיחות לטלפון שלך",
  },
  "dialer.title": {
    en: "Call Dialer",
    he: "חייגן שיחות",
  },
  "dialer.description": {
    en: "Make calls to leads or enter numbers manually",
    he: "בצע שיחות ללידים או הזן מספרים באופן ידני",
  },
  "agent.number": {
    en: "Agent Phone Number",
    he: "מספר טלפון של הסוכן",
  },
  "customer.number": {
    en: "Customer Phone Number",
    he: "מספר טלפון של הלקוח",
  },
  "button.bridge": {
    en: "Bridge Call",
    he: "גשר שיחה",
  },
  "button.connecting": {
    en: "Connecting...",
    he: "מתחבר...",
  },
  "button.tripleCall": {
    en: "Triple Call Leads",
    he: "שיחה משולשת למובילים",
  },
  "button.callingLeads": {
    en: "Calling Leads...",
    he: "מתקשר למובילים...",
  },
  "history.title": {
    en: "Call History",
    he: "היסטוריית שיחות",
  },
  "history.subtitle": {
    en: "Recent calls bridged to agents",
    he: "שיחות אחרונות שגושרו לסוכנים",
  },
  "history.tabs.recent": {
    en: "Recent",
    he: "אחרונות",
  },
  "history.tabs.all": {
    en: "All Calls",
    he: "כל השיחות",
  },
  "table.datetime": {
    en: "Date & Time",
    he: "תאריך ושעה",
  },
  "table.customer": {
    en: "Customer Number",
    he: "מספר לקוח",
  },
  "table.agent": {
    en: "Agent Number",
    he: "מספר סוכן",
  },
  "table.status": {
    en: "Status",
    he: "סטטוס",
  },
  "table.duration": {
    en: "Duration",
    he: "משך",
  },
  "status.connected": {
    en: "Connected",
    he: "מחובר",
  },
  "status.busy": {
    en: "Busy",
    he: "תפוס",
  },
  "status.failed": {
    en: "Failed",
    he: "נכשל",
  },
  "status.noanswer": {
    en: "No Answer",
    he: "אין מענה",
  },
  "status.canceled": {
    en: "Canceled",
    he: "בוטל",
  },
  "status.queued": {
    en: "Queued",
    he: "בתור",
  },
  "status.initiated": {
    en: "Initiated",
    he: "הותחל",
  },
  "status.ringing": {
    en: "Ringing",
    he: "מצלצל",
  },
  "status.unknown": {
    en: "Unknown",
    he: "לא ידוע",
  },
  "status.dropped": {
    en: "Dropped",
    he: "נותק",
  },
  "button.viewHistory": {
    en: "View Call History",
    he: "צפה בהיסטוריית שיחות",
  },
  "placeholder.agent": {
    en: "Enter your phone number",
    he: "הזן את מספר הטלפון שלך",
  },
  "placeholder.customer": {
    en: "Enter customer phone number",
    he: "הזן את מספר הטלפון של הלקוח",
  },
  "alert.success": {
    en: "Success",
    he: "הצלחה",
  },
  "alert.error": {
    en: "Error",
    he: "שגיאה",
  },
  or: {
    en: "or",
    he: "או",
  },
  "activeLeads.title": {
    en: "Active Leads",
    he: "לידים פעילים",
  },
  "activeLeads.description": {
    en: "Currently calling these leads",
    he: "מתקשר כרגע ללידים אלה",
  },
  "activeLeads.inProgress": {
    en: "Call in progress",
    he: "שיחה מתבצעת",
  },
}

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  dir: string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({
  children,
  defaultLanguage = "en",
}: {
  children: React.ReactNode
  defaultLanguage?: Language
}) {
  const [language, setLanguage] = useState<Language>(defaultLanguage)
  const [dir, setDir] = useState<string>("ltr")

  useEffect(() => {
    // Set the direction based on the language
    setDir(language === "he" ? "rtl" : "ltr")
    // Set the dir attribute on the html element
    document.documentElement.dir = language === "he" ? "rtl" : "ltr"
    // Set the lang attribute on the html element
    document.documentElement.lang = language
  }, [language])

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }
    return translations[key][language]
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
