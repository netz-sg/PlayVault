"use client"

import { useState, useEffect } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { getSettings, saveSettings } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import type { AppSettings } from "@/lib/types"

export function ThemeSwitcher() {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [currentTheme, setCurrentTheme] = useState<"dark" | "light" | "system">("system")
  const { toast } = useToast()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await getSettings()
        setSettings(settingsData)
        if (settingsData?.theme) {
          setCurrentTheme(settingsData.theme as "dark" | "light" | "system")
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      }
    }

    loadSettings()
  }, [])

  const handleThemeChange = async (theme: "dark" | "light" | "system") => {
    setCurrentTheme(theme)

    if (settings) {
      const updatedSettings: AppSettings = {
        ...settings,
        theme,
      }

      try {
        await saveSettings(updatedSettings)
        setSettings(updatedSettings)

        // Aktualisiere das Theme in der HTML-Klasse
        const root = window.document.documentElement
        root.classList.remove("dark", "light")

        if (theme === "system") {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
          root.classList.add(systemTheme)
        } else {
          root.classList.add(theme)
        }

        toast({
          title: "Theme geändert",
          description: `Das Theme wurde auf ${
            theme === "dark" ? "Dunkel" : theme === "light" ? "Hell" : "System"
          } geändert.`,
        })
      } catch (error) {
        console.error("Error saving theme:", error)
        toast({
          title: "Fehler",
          description: "Das Theme konnte nicht gespeichert werden.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <GlassContainer className="p-2 inline-flex items-center gap-1" intensity="medium">
      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${currentTheme === "light" ? "bg-white/15 text-yellow-300" : "text-white"}`}
        onClick={() => handleThemeChange("light")}
        title="Helles Theme"
      >
        <Sun className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${currentTheme === "dark" ? "bg-white/15 text-blue-300" : "text-white"}`}
        onClick={() => handleThemeChange("dark")}
        title="Dunkles Theme"
      >
        <Moon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-8 w-8 ${currentTheme === "system" ? "bg-white/15 text-emerald-300" : "text-white"}`}
        onClick={() => handleThemeChange("system")}
        title="System-Theme"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </GlassContainer>
  )
}
