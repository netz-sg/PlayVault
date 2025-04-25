"use client"

import { useState, useEffect } from "react"
import { BookmarkPlus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { saveGame, getAllGames } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import type { Game } from "@/lib/types"

interface WishlistToggleProps {
  game: Game
  onUpdate?: (updatedGame: Game) => void
}

export function WishlistToggle({ game, onUpdate }: WishlistToggleProps) {
  const [isWishlist, setIsWishlist] = useState(game.wishlist || false)
  const [saving, setSaving] = useState(false)
  const [isInLibrary, setIsInLibrary] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Prüfe, ob das Spiel bereits in der Bibliothek ist (für externe Spiele)
    const checkIfInLibrary = async () => {
      try {
        const allGames = await getAllGames()

        // Prüfe, ob ein Spiel mit der gleichen ID bereits in der Bibliothek ist
        const existsInLibrary = allGames.some((g) => g.id === game.id && !g.wishlist)

        // Wenn das Spiel bereits in der Bibliothek ist oder ein benutzerdefiniertes Spiel ist,
        // setze isInLibrary auf true
        setIsInLibrary(existsInLibrary || game.isCustom === true)

        // Aktualisiere den Wunschlisten-Status basierend auf den Daten
        setIsWishlist(game.wishlist || false)
      } catch (error) {
        console.error("Failed to check library status:", error)
      }
    }

    checkIfInLibrary()
  }, [game])

  const handleToggleWishlist = async () => {
    setSaving(true)
    const newWishlistStatus = !isWishlist

    try {
      const updatedGame: Game = {
        ...game,
        wishlist: newWishlistStatus,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      setIsWishlist(newWishlistStatus)
      onUpdate?.(updatedGame)

      toast({
        title: newWishlistStatus ? "Zur Wunschliste hinzugefügt" : "Von Wunschliste entfernt",
        description: `"${game.name}" wurde ${newWishlistStatus ? "zur" : "von der"} Wunschliste ${newWishlistStatus ? "hinzugefügt" : "entfernt"}.`,
      })
    } catch (error) {
      console.error("Failed to update wishlist status:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Der Wunschlisten-Status konnte nicht aktualisiert werden.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Wenn das Spiel bereits in der Bibliothek ist, zeige die Komponente nicht an
  if (isInLibrary) {
    return null
  }

  return (
    <GlassContainer className="p-4" intensity="medium" textContrast="high">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <ShoppingCart className="w-5 h-5 mr-2 text-emerald-400" />
        Kaufen
      </h3>

      <div className="space-y-4">
        <p className="text-white/70">
          {isWishlist
            ? "Dieses Spiel ist auf deiner Wunschliste. Du kannst es entfernen, wenn du es nicht mehr kaufen möchtest."
            : "Füge dieses Spiel zu deiner Wunschliste hinzu, um es später zu kaufen."}
        </p>

        <Button
          onClick={handleToggleWishlist}
          disabled={saving}
          className={
            isWishlist
              ? "w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
              : "w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
          }
        >
          <BookmarkPlus className="w-4 h-4 mr-2" />
          {saving ? "Speichern..." : isWishlist ? "Von Wunschliste entfernen" : "Zur Wunschliste hinzufügen"}
        </Button>
      </div>
    </GlassContainer>
  )
}
