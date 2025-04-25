"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassContainer } from "@/components/ui/glass-container"
import { getAllGames } from "@/lib/client-storage"
import type { Game } from "@/lib/types"
import { GameCard } from "@/components/game-card"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [searchQuery, setSearchQuery] = useState(query)
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGames = async () => {
      try {
        const allGames = await getAllGames()
        setGames(allGames)

        // Filter games based on query
        if (query) {
          filterGames(allGames, query)
        } else {
          setFilteredGames([])
        }
      } catch (error) {
        console.error("Failed to load games:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [query])

  const filterGames = (gamesList: Game[], searchTerm: string) => {
    const lowerCaseQuery = searchTerm.toLowerCase()

    const filtered = gamesList.filter((game) => {
      // Search in name
      if (game.name.toLowerCase().includes(lowerCaseQuery)) {
        return true
      }

      // Search in genres
      if (game.genres?.some((genre) => genre.name.toLowerCase().includes(lowerCaseQuery))) {
        return true
      }

      // Search in platforms
      if (game.platforms?.some((p) => p.platform.name.toLowerCase().includes(lowerCaseQuery))) {
        return true
      }

      // Search in description
      if (game.description?.toLowerCase().includes(lowerCaseQuery)) {
        return true
      }

      // Search in notes
      if (game.userNotes?.toLowerCase().includes(lowerCaseQuery)) {
        return true
      }

      return false
    })

    setFilteredGames(filtered)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (searchQuery.trim()) {
      // Update URL with search query
      window.history.pushState({}, "", `/search?q=${encodeURIComponent(searchQuery)}`)

      // Filter games
      filterGames(games, searchQuery)
    }
  }

  return (
    <div>
      <Link href="/" className="inline-flex items-center text-white hover:text-emerald-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Bibliothek
      </Link>

      <GlassContainer className="p-6 mb-8" intensity="medium" textContrast="high">
        <h1 className="text-2xl font-bold text-white mb-6">Bibliothek durchsuchen</h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <GlassContainer className="flex-1 p-0" intensity="medium">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Suche nach Spielen, Genres, Plattformen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-white pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
              </div>
            </GlassContainer>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all duration-300"
            >
              Suchen
            </Button>
          </div>
        </form>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : filteredGames.length > 0 ? (
          <>
            <h2 className="text-xl font-bold text-white mb-4">
              {filteredGames.length} {filteredGames.length === 1 ? "Ergebnis" : "Ergebnisse"} für "{query}"
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGames.map((game) => (
                <div key={game.id} className="h-full">
                  <GameCard game={game} />
                </div>
              ))}
            </div>
          </>
        ) : query ? (
          <GlassContainer className="p-8 text-center" intensity="medium" textContrast="high">
            <p className="text-white">Keine Spiele gefunden, die "{query}" enthalten.</p>
          </GlassContainer>
        ) : (
          <GlassContainer className="p-8 text-center" intensity="medium" textContrast="high">
            <p className="text-white">Gib einen Suchbegriff ein, um deine Bibliothek zu durchsuchen.</p>
          </GlassContainer>
        )}
      </GlassContainer>
    </div>
  )
}
