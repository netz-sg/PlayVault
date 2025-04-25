"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, Search, Plus, BookmarkPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassContainer } from "@/components/ui/glass-container"
import { searchGames, getGameDetails, convertRawgGameToGame, getPopularGames } from "@/lib/rawg-api"
import { saveGame, getAllGames } from "@/lib/client-storage"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { ErrorBoundary } from "@/components/error-boundary"

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [addingGame, setAddingGame] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoading(true)
    setPage(1)
    setGames([])

    try {
      const results = await searchGames(searchQuery, 1)

      // Prüfe, welche Spiele bereits in der Bibliothek oder Wunschliste sind
      const existingGames = await getAllGames()
      const gamesWithStatus = results.results.map((game: any) => {
        const existsInLibrary = existingGames.some((g) => g.id === game.id.toString() && !g.wishlist)
        const existsInWishlist = existingGames.some((g) => g.id === game.id.toString() && g.wishlist)
        return {
          ...game,
          existsInLibrary,
          existsInWishlist,
        }
      })

      setGames(gamesWithStatus)
      setHasMore(!!results.next)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Fehler bei der Suche",
        description: "Bitte versuche es erneut oder prüfe deine Internetverbindung.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (loading || !hasMore) return

    setLoading(true)
    const nextPage = page + 1

    try {
      const results = await searchGames(searchQuery, nextPage)

      // Prüfe, welche Spiele bereits in der Bibliothek oder Wunschliste sind
      const existingGames = await getAllGames()
      const gamesWithStatus = results.results.map((game: any) => {
        const existsInLibrary = existingGames.some((g) => g.id === game.id.toString() && !g.wishlist)
        const existsInWishlist = existingGames.some((g) => g.id === game.id.toString() && g.wishlist)
        return {
          ...game,
          existsInLibrary,
          existsInWishlist,
        }
      })

      setGames([...games, ...gamesWithStatus])
      setHasMore(!!results.next)
      setPage(nextPage)
    } catch (error) {
      console.error("Error loading more games:", error)
      toast({
        title: "Fehler beim Laden",
        description: "Weitere Spiele konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddGame = async (game: any, addToWishlist = false) => {
    if (!isAdmin) return

    setAddingGame(game.id)

    try {
      // Prüfe, ob das Spiel bereits in der Bibliothek oder auf der Wunschliste existiert
      const existingGames = await getAllGames()
      const existsInLibrary = existingGames.some((g) => g.id === game.id.toString() && !g.wishlist)
      const existsInWishlist = existingGames.some((g) => g.id === game.id.toString() && g.wishlist)

      // Wenn das Spiel zur Bibliothek hinzugefügt werden soll
      if (!addToWishlist) {
        if (existsInLibrary) {
          toast({
            title: "Spiel existiert bereits",
            description: `"${game.name}" ist bereits in deiner Bibliothek.`,
            variant: "destructive",
          })
          setAddingGame(null)
          return
        }

        if (existsInWishlist) {
          toast({
            title: "Spiel ist auf der Wunschliste",
            description: `"${game.name}" ist bereits auf deiner Wunschliste. Entferne es zuerst von dort.`,
            variant: "destructive",
          })
          setAddingGame(null)
          return
        }
      }

      // Wenn das Spiel zur Wunschliste hinzugefügt werden soll
      if (addToWishlist) {
        if (existsInWishlist) {
          toast({
            title: "Spiel existiert bereits",
            description: `"${game.name}" ist bereits auf deiner Wunschliste.`,
            variant: "destructive",
          })
          setAddingGame(null)
          return
        }

        if (existsInLibrary) {
          toast({
            title: "Spiel ist in der Bibliothek",
            description: `"${game.name}" ist bereits in deiner Bibliothek. Es kann nicht auf die Wunschliste gesetzt werden.`,
            variant: "destructive",
          })
          setAddingGame(null)
          return
        }
      }

      // Hole detaillierte Informationen zum Spiel
      const detailedGame = await getGameDetails(game.id)
      const gameData = convertRawgGameToGame(detailedGame)

      // Wenn zur Wunschliste hinzugefügt werden soll
      if (addToWishlist) {
        gameData.wishlist = true
      }

      await saveGame(gameData)
      toast({
        title: addToWishlist ? "Zur Wunschliste hinzugefügt" : "Zur Bibliothek hinzugefügt",
        description: `"${game.name}" wurde ${addToWishlist ? "zur Wunschliste (zum Kaufen)" : "zur Bibliothek (bereits besitzt)"} hinzugefügt.`,
      })
    } catch (error) {
      console.error("Error adding game:", error)
      toast({
        title: "Fehler beim Hinzufügen",
        description: "Das Spiel konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
        variant: "destructive",
      })
    } finally {
      setAddingGame(null)
    }
  }

  const handleAddToWishlist = async (game: any) => {
    await handleAddGame(game, true)
  }

  return (
    <ErrorBoundary>
      <div>
        <Link href="/" className="inline-flex items-center text-white hover:text-emerald-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Bibliothek
        </Link>

        <GlassContainer className="p-6 mb-8" intensity="medium" textContrast="high">
          <h1 className="text-2xl font-bold text-white mb-6">Spiele entdecken</h1>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <GlassContainer className="flex-1 p-0" intensity="medium">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Spiel suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 text-white pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                </div>
              </GlassContainer>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all duration-300"
              >
                {loading && page === 1 ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suchen...
                  </>
                ) : (
                  "Suchen"
                )}
              </Button>
            </div>
          </form>

          {loading && page === 1 ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : games.length > 0 ? (
            <>
              <h2 className="text-xl font-bold text-white mb-4">
                {searchQuery ? `Suchergebnisse für "${searchQuery}"` : "Beliebte Spiele"}
              </h2>

              <div className="space-y-4 mb-8">
                {games.map((game) => (
                  <GlassContainer
                    key={game.id}
                    className="p-4 hover:bg-white/5 transition-colors"
                    intensity="medium"
                    textContrast="high"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden">
                        {game.background_image && (
                          <img
                            src={game.background_image || "/placeholder.svg"}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{game.name}</h3>
                        <p className="text-sm text-slate-300">
                          {game.released ? new Date(game.released).getFullYear() : "Unbekanntes Jahr"} •{" "}
                          {game.genres?.map((g: any) => g.name).join(", ") || "Unbekanntes Genre"}
                        </p>
                        <p className="text-sm text-slate-300 mt-1">
                          {game.platforms
                            ?.map((p: any) => p.platform.name)
                            .slice(0, 3)
                            .join(", ")}
                          {game.platforms?.length > 3 ? " und weitere" : ""}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleAddToWishlist(game)}
                            disabled={addingGame === game.id || game.existsInWishlist || game.existsInLibrary}
                            className={`bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 ${
                              game.existsInWishlist || game.existsInLibrary ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {addingGame === game.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <BookmarkPlus className="w-4 h-4 mr-2" />
                                {game.existsInWishlist ? "Auf Wunschliste" : "Zur Wunschliste"}
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleAddGame(game, false)}
                            disabled={addingGame === game.id || game.existsInLibrary || game.existsInWishlist}
                            className={`bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10 ${
                              game.existsInLibrary || game.existsInWishlist ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            {addingGame === game.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                {game.existsInLibrary ? "In Bibliothek" : "Besitze ich"}
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </GlassContainer>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <Button
                    onClick={loadMore}
                    disabled={loading}
                    className="bg-black/50 backdrop-blur-md hover:bg-white/20 text-white border border-white/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Laden...
                      </>
                    ) : (
                      "Mehr laden"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : searchQuery ? (
            <GlassContainer className="p-8 text-center" intensity="medium" textContrast="high">
              <p className="text-white">Keine Spiele gefunden. Versuche einen anderen Suchbegriff.</p>
            </GlassContainer>
          ) : (
            <GlassContainer className="p-8 text-center" intensity="medium" textContrast="high">
              <p className="text-white">Suche nach Spielen, um sie zu deiner Bibliothek hinzuzufügen.</p>
            </GlassContainer>
          )}
        </GlassContainer>
      </div>
    </ErrorBoundary>
  )
}
