"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Grid3X3, List, Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GameCard } from "@/components/game-card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { GlassContainer } from "@/components/ui/glass-container"
import { getAllGames, deleteGame } from "@/lib/client-storage"
import type { Game } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"

export function GameGrid() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<string>("name")
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const { isAdmin } = useAuth()

  useEffect(() => {
    const loadGames = async () => {
      try {
        const allGames = await getAllGames()
        setGames(allGames)
      } catch (error) {
        console.error("Failed to load games:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  // Sort games based on sortBy state
  const sortedGames = [...games].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "rating":
        return (b.rating || 0) - (a.rating || 0)
      case "release":
        return new Date(b.released || "").getTime() - new Date(a.released || "").getTime()
      case "metacritic":
        return (b.metacritic || 0) - (a.metacritic || 0)
      case "added":
        return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
      default:
        return 0
    }
  })

  const handleDeleteGame = async (id: string) => {
    if (window.confirm("Möchtest du dieses Spiel wirklich löschen?")) {
      try {
        await deleteGame(id)
        setGames(games.filter((game) => game.id !== id))
      } catch (error) {
        console.error("Failed to delete game:", error)
        alert("Fehler beim Löschen des Spiels.")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <GlassContainer className="p-8 text-center" intensity="medium" textContrast="high">
        <p className="text-white mb-4">Keine Spiele in der Bibliothek.</p>
        {isAdmin && (
          <p className="text-slate-300">Füge Spiele über den Admin-Bereich hinzu, um deine Bibliothek zu füllen.</p>
        )}
      </GlassContainer>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <GlassContainer className="py-2 px-4" intensity="medium" textContrast="high">
          <div className="text-sm text-emerald-400 font-medium">{games.length} Spiele in der Bibliothek</div>
        </GlassContainer>

        <div className="flex items-center gap-2">
          <GlassContainer className="p-0" intensity="medium">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="bg-transparent border-0 text-white h-10 font-medium">
                  Sortieren:{" "}
                  {sortBy === "name"
                    ? "Name"
                    : sortBy === "rating"
                      ? "Bewertung"
                      : sortBy === "release"
                        ? "Erscheinungsdatum"
                        : sortBy === "metacritic"
                          ? "Metacritic"
                          : sortBy === "added"
                            ? "Hinzugefügt"
                            : "Name"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-md border-white/20">
                <DropdownMenuItem onClick={() => setSortBy("name")} className="text-white hover:bg-white/15">
                  Name
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("rating")} className="text-white hover:bg-white/15">
                  Bewertung
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("release")} className="text-white hover:bg-white/15">
                  Erscheinungsdatum
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("metacritic")} className="text-white hover:bg-white/15">
                  Metacritic
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("added")} className="text-white hover:bg-white/15">
                  Hinzugefügt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </GlassContainer>

          <GlassContainer className="p-0 flex" intensity="medium">
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 h-10 bg-transparent ${viewMode === "grid" ? "bg-white/15 text-emerald-400" : "text-white"}`}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`px-3 h-10 bg-transparent ${viewMode === "list" ? "bg-white/15 text-emerald-400" : "text-white"}`}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </GlassContainer>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedGames.map((game) => (
            <div key={game.id} className="h-full">
              <GameCard game={game} onDelete={isAdmin ? handleDeleteGame : undefined} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedGames.map((game, index) => (
            <GlassContainer
              key={game.id}
              className={`transition-all duration-300 transform ${hoverIndex === index ? "scale-[1.01]" : "scale-100"}`}
              intensity={hoverIndex === index ? "high" : "medium"}
              textContrast="high"
              glow={hoverIndex === index}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className="flex gap-4 p-3">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden">
                  <img
                    src={game.background_image || "/placeholder.svg?height=300&width=400"}
                    alt={game.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${hoverIndex === index ? "scale-110" : "scale-100"}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                    <p className="text-sm text-white">
                      {game.platforms?.map((p) => p.platform.name).join(", ") || "Keine Plattform angegeben"}
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      {game.genres?.map((g) => g.name).join(", ") || "Kein Genre angegeben"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-white font-medium">{game.rating ? game.rating.toFixed(1) : "N/A"}</span>
                    </div>
                    {game.status && (
                      <Badge
                        className={`${
                          game.status === "Completed"
                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
                            : game.status === "In Progress"
                              ? "bg-gradient-to-r from-blue-600 to-blue-700"
                              : game.status === "On Hold"
                                ? "bg-gradient-to-r from-amber-600 to-amber-700"
                                : "bg-gradient-to-r from-slate-600 to-slate-700"
                        } text-white font-medium`}
                      >
                        {game.status}
                      </Badge>
                    )}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-start">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      Löschen
                    </Button>
                  </div>
                )}
              </div>
            </GlassContainer>
          ))}
        </div>
      )}
    </div>
  )
}
