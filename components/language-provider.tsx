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
  "history.title": {
    en: "Call History",
    he: "היסטוריית שיחות",
  },
  "history.subtitle": {
    en: "Recent calls bridged to agents",
    he: "שיחות אחרונות שגושרו לסוכנים",
  },
  "history.viewFull": {
    en: "View Full History",
    he: "צפה בהיסטוריה מלאה",
  },
  "history.fullTitle": {
    en: "Complete record of calls bridged to agents",
    he: "רשומה מלאה של שיחות שגושרו לסוכנים",
  },
  "history.back": {
    en: "Back to Calling App",
    he: "חזרה לאפליקציית השיחות",
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
