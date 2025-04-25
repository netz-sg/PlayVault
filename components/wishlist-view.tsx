"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { BookmarkPlus, Calendar, Star, ArrowRight, Loader2, Plus, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { getAllGames, saveGame } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import type { Game } from "@/lib/types"
import { PriceWatcher } from "@/components/price-watcher"

export function WishlistView() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadWishlistGames = async () => {
      try {
        const allGames = await getAllGames()
        const wishlistGames = allGames.filter((game) => game.wishlist)
        setGames(wishlistGames)
      } catch (error) {
        console.error("Failed to load wishlist games:", error)
        toast({
          title: "Fehler beim Laden",
          description: "Die Wunschliste konnte nicht geladen werden.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadWishlistGames()
  }, [toast])

  const handleRemoveFromWishlist = async (gameId: string) => {
    setRemoving(gameId)

    try {
      const gameToUpdate = games.find((g) => g.id === gameId)
      if (!gameToUpdate) return

      const updatedGame: Game = {
        ...gameToUpdate,
        wishlist: false,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)

      // Aktualisiere die lokale Liste
      setGames(games.filter((g) => g.id !== gameId))

      toast({
        title: "Von Wunschliste entfernt",
        description: `"${gameToUpdate.name}" wurde von der Wunschliste entfernt.`,
      })
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      toast({
        title: "Fehler beim Entfernen",
        description: "Das Spiel konnte nicht von der Wunschliste entfernt werden.",
        variant: "destructive",
      })
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToLibrary = async (gameId: string) => {
    setAdding(gameId)

    try {
      const gameToUpdate = games.find((g) => g.id === gameId)
      if (!gameToUpdate) return

      const updatedGame: Game = {
        ...gameToUpdate,
        wishlist: false, // Entferne von der Wunschliste
        status: "Not Started", // Setze den Status auf "Nicht begonnen"
        addedDate: new Date().toISOString(), // Aktualisiere das Hinzufügungsdatum
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)

      // Aktualisiere die lokale Liste
      setGames(games.filter((g) => g.id !== gameId))

      toast({
        title: "Zur Bibliothek hinzugefügt",
        description: `"${gameToUpdate.name}" wurde zur Bibliothek hinzugefügt und von der Wunschliste entfernt.`,
      })
    } catch (error) {
      console.error("Failed to add to library:", error)
      toast({
        title: "Fehler beim Hinzufügen",
        description: "Das Spiel konnte nicht zur Bibliothek hinzugefügt werden.",
        variant: "destructive",
      })
    } finally {
      setAdding(null)
    }
  }

  const handleShowPriceDetails = (game: Game) => {
    setSelectedGame(game === selectedGame ? null : game)
  }

  if (loading) {
    return (
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        </div>
      </GlassContainer>
    )
  }

  if (games.length === 0) {
    return (
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <div className="text-center py-8">
          <BookmarkPlus className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Deine Wunschliste ist leer</h2>
          <p className="text-white/70 mb-4">Füge Spiele zu deiner Wunschliste hinzu, um sie später zu kaufen.</p>
          <Link href="/discover">
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400">
              Spiele entdecken
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </GlassContainer>
    )
  }

  return (
    <GlassContainer className="p-6" intensity="medium" textContrast="high">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center">
          <BookmarkPlus className="w-5 h-5 mr-2 text-emerald-400" />
          Meine Wunschliste
        </h2>
        <Link href="/discover" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center">
          Mehr entdecken <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {games.map((game) => (
          <GlassContainer key={game.id} className="p-4 hover:bg-white/5 transition-colors" intensity="medium">
            <div className="flex gap-4">
              <div className="w-16 h-16 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden">
                {game.background_image && (
                  <img
                    src={game.background_image || "/placeholder.svg"}
                    alt={game.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <Link
                  href={`/game/${game.id}`}
                  className="text-white font-medium hover:text-emerald-400 transition-colors"
                >
                  {game.name}
                </Link>
                <div className="flex items-center text-xs text-white mt-1">
                  {game.released && (
                    <>
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(game.released).toLocaleDateString()}
                    </>
                  )}
                  {game.rating && (
                    <div className="flex items-center ml-3">
                      <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                      {game.rating.toFixed(1)}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {game.genres?.map((g) => g.name).join(", ") || "Unbekanntes Genre"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleAddToLibrary(game.id)}
                  disabled={adding === game.id}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                >
                  {adding === game.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3 w-3 mr-1" />
                      Gekauft
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShowPriceDetails(game)}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                >
                  <Euro className="h-3 w-3 mr-1" />
                  Preise
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveFromWishlist(game.id)}
                  disabled={removing === game.id}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                >
                  {removing === game.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Entfernen"}
                </Button>
              </div>
            </div>
            {selectedGame && selectedGame.id === game.id && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <PriceWatcher game={game} />
              </div>
            )}
          </GlassContainer>
        ))}
      </div>
    </GlassContainer>
  )
}
