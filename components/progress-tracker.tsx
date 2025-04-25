"use client"

import { useState } from "react"
import { Percent, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { Slider } from "@/components/ui/slider"
import { saveGame } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import type { Game } from "@/lib/types"

interface ProgressTrackerProps {
  game: Game
  onUpdate?: (updatedGame: Game) => void
}

export function ProgressTracker({ game, onUpdate }: ProgressTrackerProps) {
  const [progress, setProgress] = useState<number[]>([game.completionPercentage || 0])
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleSaveProgress = async () => {
    setSaving(true)

    try {
      const updatedGame: Game = {
        ...game,
        completionPercentage: progress[0],
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      onUpdate?.(updatedGame)

      toast({
        title: "Fortschritt gespeichert",
        description: `Fortschritt für "${game.name}" auf ${progress[0]}% gesetzt.`,
      })
    } catch (error) {
      console.error("Failed to save progress:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Der Fortschritt konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Bestimme die Farbe basierend auf dem Fortschritt
  const getProgressColor = () => {
    if (progress[0] < 25) return "bg-red-500"
    if (progress[0] < 50) return "bg-orange-500"
    if (progress[0] < 75) return "bg-yellow-500"
    return "bg-emerald-500"
  }

  return (
    <GlassContainer className="p-4" intensity="medium" textContrast="high">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Percent className="w-5 h-5 mr-2 text-emerald-400" />
        Spielfortschritt
      </h3>

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">Fortschritt</span>
          <span className="text-2xl font-bold text-white">{progress[0]}%</span>
        </div>

        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: `${progress[0]}%` }}
          ></div>
        </div>

        <div className="pt-4">
          <Slider
            value={progress}
            onValueChange={setProgress}
            max={100}
            step={5}
            className="[&>span:first-child]:h-2 [&>span:first-child]:bg-slate-700 [&>span:nth-child(2)>span]:bg-emerald-500"
          />
        </div>

        <div className="flex justify-between text-xs text-white/70">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        <Button
          onClick={handleSaveProgress}
          disabled={saving || progress[0] === game.completionPercentage}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Speichern..." : "Fortschritt speichern"}
        </Button>
      </div>
    </GlassContainer>
  )
}
