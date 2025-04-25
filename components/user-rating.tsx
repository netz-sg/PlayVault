"use client"

import { useState } from "react"
import { RatingStars } from "@/components/rating-stars"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { saveGame } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import type { Game } from "@/lib/types"

interface UserRatingProps {
  game: Game
  onRatingChange?: (game: Game) => void
}

export function UserRating({ game, onRatingChange }: UserRatingProps) {
  const [userRating, setUserRating] = useState<number>(game.userRating || 0)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const handleRatingChange = async (rating: number) => {
    setUserRating(rating)
    setSaving(true)

    try {
      const updatedGame: Game = {
        ...game,
        userRating: rating,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)

      toast({
        title: "Bewertung gespeichert",
        description:
          rating > 0
            ? `Du hast "${game.name}" mit ${rating} von 5 Sternen bewertet.`
            : `Bewertung für "${game.name}" zurückgesetzt.`,
      })

      // Benachrichtige die übergeordnete Komponente über die Änderung
      onRatingChange?.(updatedGame)
    } catch (error) {
      console.error("Error saving rating:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Deine Bewertung konnte nicht gespeichert werden.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <GlassContainer className="p-4" intensity="medium" textContrast="high">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-white font-medium mb-2">Deine Bewertung</h3>
          <RatingStars initialRating={userRating} onChange={handleRatingChange} size="lg" />
        </div>
        <div className="text-right">
          {userRating > 0 ? (
            <div className="text-white">
              <span className="text-2xl font-bold">{userRating}</span>
              <span className="text-sm text-white/70"> / 5</span>
            </div>
          ) : (
            <Button
              onClick={() => handleRatingChange(3)}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
              disabled={saving}
            >
              Jetzt bewerten
            </Button>
          )}
        </div>
      </div>
    </GlassContainer>
  )
}
