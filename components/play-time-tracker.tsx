"use client"

import { useState, useEffect } from "react"
import { Clock, Play, Pause, Save, Plus, Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassContainer } from "@/components/ui/glass-container"
import { Textarea } from "@/components/ui/textarea"
import { saveGame } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import type { Game, PlaySession } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

interface PlayTimeTrackerProps {
  game: Game
  onUpdate?: (updatedGame: Game) => void
}

export function PlayTimeTracker({ game, onUpdate }: PlayTimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [totalPlayTime, setTotalPlayTime] = useState(game.playTime || 0)
  const [manualTime, setManualTime] = useState("")
  const [sessionNote, setSessionNote] = useState("")
  const [showAddManual, setShowAddManual] = useState(false)
  const [playHistory, setPlayHistory] = useState<PlaySession[]>(game.playHistory || [])
  const { toast } = useToast()

  // Timer-Effekt für die Spielzeit-Verfolgung
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours === 0) {
      return `${mins} Minuten`
    } else if (mins === 0) {
      return `${hours} Stunden`
    } else {
      return `${hours} Stunden, ${mins} Minuten`
    }
  }

  const handleStartTracking = () => {
    setStartTime(new Date())
    setIsTracking(true)
    toast({
      title: "Spielzeit-Tracking gestartet",
      description: `Tracking für "${game.name}" läuft...`,
    })
  }

  const handleStopTracking = async () => {
    if (!startTime) return

    setIsTracking(false)
    const now = new Date()
    const sessionDuration = Math.floor((now.getTime() - startTime.getTime()) / 60000) // Minuten

    // Mindestens 1 Minute
    if (sessionDuration < 1) {
      toast({
        title: "Tracking gestoppt",
        description: "Die Sitzung war zu kurz, um aufgezeichnet zu werden (< 1 Minute).",
      })
      setElapsedTime(0)
      setStartTime(null)
      return
    }

    const newTotalTime = totalPlayTime + sessionDuration
    setTotalPlayTime(newTotalTime)

    // Neue Spielsitzung erstellen
    const newSession: PlaySession = {
      date: now.toISOString(),
      duration: sessionDuration,
      note: sessionNote,
    }

    const updatedHistory = [...playHistory, newSession]
    setPlayHistory(updatedHistory)

    // Spiel aktualisieren
    try {
      const updatedGame: Game = {
        ...game,
        playTime: newTotalTime,
        playHistory: updatedHistory,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      onUpdate?.(updatedGame)

      toast({
        title: "Spielzeit gespeichert",
        description: `${formatMinutes(sessionDuration)} zu deiner Spielzeit hinzugefügt.`,
      })

      setElapsedTime(0)
      setStartTime(null)
      setSessionNote("")
    } catch (error) {
      console.error("Failed to save play time:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Die Spielzeit konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    }
  }

  const handleAddManualTime = async () => {
    const minutes = Number.parseInt(manualTime)

    if (isNaN(minutes) || minutes <= 0) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte gib eine gültige Spielzeit in Minuten ein.",
        variant: "destructive",
      })
      return
    }

    const newTotalTime = totalPlayTime + minutes
    setTotalPlayTime(newTotalTime)

    // Neue Spielsitzung erstellen
    const newSession: PlaySession = {
      date: new Date().toISOString(),
      duration: minutes,
      note: sessionNote,
    }

    const updatedHistory = [...playHistory, newSession]
    setPlayHistory(updatedHistory)

    // Spiel aktualisieren
    try {
      const updatedGame: Game = {
        ...game,
        playTime: newTotalTime,
        playHistory: updatedHistory,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      onUpdate?.(updatedGame)

      toast({
        title: "Spielzeit hinzugefügt",
        description: `${formatMinutes(minutes)} manuell hinzugefügt.`,
      })

      setManualTime("")
      setSessionNote("")
      setShowAddManual(false)
    } catch (error) {
      console.error("Failed to save play time:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Die Spielzeit konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSession = async (index: number) => {
    if (!confirm("Möchtest du diese Spielsitzung wirklich löschen?")) return

    const session = playHistory[index]
    const newHistory = [...playHistory]
    newHistory.splice(index, 1)

    const newTotalTime = Math.max(0, totalPlayTime - session.duration)

    try {
      const updatedGame: Game = {
        ...game,
        playTime: newTotalTime,
        playHistory: newHistory,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      onUpdate?.(updatedGame)

      setPlayHistory(newHistory)
      setTotalPlayTime(newTotalTime)

      toast({
        title: "Spielsitzung gelöscht",
        description: `Spielsitzung wurde erfolgreich gelöscht.`,
      })
    } catch (error) {
      console.error("Failed to delete play session:", error)
      toast({
        title: "Fehler beim Löschen",
        description: "Die Spielsitzung konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }
  }

  return (
    <GlassContainer className="p-4" intensity="medium" textContrast="high">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-emerald-400" />
        Spielzeit-Tracking
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-300 font-medium">Gesamtspielzeit</p>
            <p className="text-2xl font-bold text-white">{formatMinutes(totalPlayTime)}</p>
          </div>

          {isTracking ? (
            <div className="text-right">
              <p className="text-sm text-emerald-300 font-medium">Aktuelle Sitzung</p>
              <p className="text-xl font-bold text-white">{formatTime(elapsedTime)}</p>
            </div>
          ) : null}
        </div>

        {isTracking ? (
          <div className="space-y-4">
            <Textarea
              placeholder="Notizen zu dieser Spielsitzung (optional)"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              className="bg-black/30 border-white/20 text-white h-20"
            />

            <Button
              onClick={handleStopTracking}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
            >
              <Pause className="w-4 h-4 mr-2" />
              Tracking stoppen
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleStartTracking}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
            >
              <Play className="w-4 h-4 mr-2" />
              Spielzeit tracken
            </Button>

            <Button
              onClick={() => setShowAddManual(!showAddManual)}
              variant="outline"
              className="flex-1 bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Manuell hinzufügen
            </Button>
          </div>
        )}

        {showAddManual && !isTracking && (
          <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/10">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm text-white mb-1 block">Spielzeit (Minuten)</label>
                <Input
                  type="number"
                  min="1"
                  placeholder="z.B. 60"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>
            </div>

            <Textarea
              placeholder="Notizen zu dieser Spielsitzung (optional)"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              className="bg-black/30 border-white/20 text-white h-20"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddManual(false)}
                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleAddManualTime}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
              >
                <Save className="w-4 h-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </div>
        )}

        {playHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white font-medium mb-2">Spielverlauf</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {playHistory
                .slice()
                .reverse()
                .map((session, index) => (
                  <div
                    key={index}
                    className="bg-black/30 rounded-lg p-3 border border-white/10 flex justify-between items-start"
                  >
                    <div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 text-emerald-400 mr-1" />
                        <span className="text-white font-medium">{formatMinutes(session.duration)}</span>
                      </div>
                      <p className="text-xs text-white/70">
                        {new Date(session.date).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {session.note && <p className="text-sm text-white mt-1">{session.note}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-white/50 hover:text-red-400 hover:bg-transparent"
                      onClick={() => handleDeleteSession(playHistory.length - 1 - index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </GlassContainer>
  )
}
