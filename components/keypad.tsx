"use client"
import { SkipBackIcon as Backspace } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface KeypadProps {
  onKeyPress: (value: string) => void
  onBackspace: () => void
}

export function Keypad({ onKeyPress, onBackspace }: KeypadProps) {
  // Updated keys array without the pound (#) symbol
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "+"]

  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const buttonClass =
    mounted && theme === "dark"
      ? "bg-[#D29D0E] text-[#122347] border-[#D29D0E] hover:bg-[#D29D0E]/80"
      : "bg-white text-[#122347] border-[#122347] hover:bg-[#D29D0E]/10"

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {/* Regular number keys */}
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onKeyPress(key)}
            className={`h-12 text-lg font-medium rounded-md border ${buttonClass}`}
          >
            {key}
          </button>
        ))}

        {/* Zero button that spans 2 columns */}
        <button
          type="button"
          onClick={() => onKeyPress("0")}
          className={`h-12 text-lg font-medium rounded-md border col-span-2 ${buttonClass}`}
        >
          0
        </button>

        {/* Backspace button */}
        <button
          type="button"
          onClick={onBackspace}
          className={`h-12 col-span-3 rounded-md border flex items-center justify-center ${buttonClass}`}
        >
          <Backspace className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
