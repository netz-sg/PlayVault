"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import Link from "next/link"
import { getAllGames } from "@/lib/client-storage"
import { GameCard } from "@/components/game-card"
import type { Game } from "@/lib/types"

export default function GamesPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get("filter")
  
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  
  // Lade alle Spiele
  useEffect(() => {
    const loadGames = async () => {
      try {
        const allGames = await getAllGames()
        setGames(allGames)
        setLoading(false)
      } catch (error) {
        console.error("Fehler beim Laden der Spiele:", error)
        setLoading(false)
      }
    }
    
    loadGames()
  }, [])
  
  // Filtere Spiele basierend auf dem Filter-Parameter
  const filteredGames = () => {
    if (!filter) return games
    
    switch (filter) {
      case "favorites":
        return games.filter(game => game.favorite)
      case "recent":
        return [...games].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).slice(0, 10)
      case "completed":
        return games.filter(game => game.status === "Completed")
      case "in-progress":
        return games.filter(game => game.status === "In Progress")
      case "on-hold":
        return games.filter(game => game.status === "On Hold")
      case "not-started":
        return games.filter(game => game.status === "Not Started" || !game.status)
      default:
        return games
    }
  }
  
  // Bestimme den Titel basierend auf dem Filter
  const getTitle = () => {
    if (!filter) return "Alle Spiele"
    
    switch (filter) {
      case "favorites": return "Favorisierte Spiele"
      case "recent": return "Kürzlich gespielt"
      case "completed": return "Abgeschlossene Spiele"
      case "in-progress": return "Spiele in Bearbeitung"
      case "on-hold": return "Pausierte Spiele"
      case "not-started": return "Nicht begonnene Spiele"
      default: return "Spielesammlung"
    }
  }
  
  const filtered = filteredGames()
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-white">{getTitle()}</h1>
      </div>
      
      {/* Spieleliste */}
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : filtered.length > 0 ? (
          <div>
            <div className="mb-6">
              <p className="text-white/70">
                {filtered.length} {filtered.length === 1 ? "Spiel" : "Spiele"} gefunden
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filtered.map((game) => (
                <div key={game.id} className="h-full">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white mb-2">Keine Spiele gefunden.</p>
            {filter === "favorites" && (
              <p className="text-white/70">
                Du hast noch keine Spiele als Favoriten markiert.
              </p>
            )}
          </div>
        )}
      </GlassContainer>
    </div>
  )
} 