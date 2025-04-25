"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarDays, Plus, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { getRecentGames, type Game } from "@/lib/rawg-api"

export function RecentlyAdded() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        const data = await getRecentGames()
        setGames(data.results.slice(0, 6))
      } catch (error) {
        console.error("Failed to fetch recent games:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentGames()
  }, [])

  if (loading) {
    return (
      <GlassContainer intensity="medium" className="p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recently Released</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-16 h-16 bg-white/5 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/5 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </GlassContainer>
    )
  }

  return (
    <GlassContainer intensity="medium" className="p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recently Released</h2>
        <Link
          href="/discover"
          className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center font-medium"
        >
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {games.map((game, index) => (
          <GlassContainer
            key={game.id}
            className={`flex gap-3 group p-3 transform transition-all duration-300 ${
              hoveredIndex === index ? "translate-y-[-2px]" : ""
            }`}
            intensity="medium"
            textContrast="high"
            glow={hoveredIndex === index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-white/20">
              {game.background_image ? (
                <img
                  src={game.background_image || "/placeholder.svg"}
                  alt={game.name}
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    hoveredIndex === index ? "scale-110" : "scale-100"
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400">
                  No image
                </div>
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center transition-opacity duration-300 ${
                  hoveredIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="mb-1 text-xs text-white bg-black/60 hover:bg-black/80 h-7 px-2 border border-white/20 font-medium"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/game/${game.id}`}
                className={`text-white font-medium hover:text-emerald-400 transition-colors line-clamp-1 ${
                  hoveredIndex === index ? "text-emerald-400" : ""
                }`}
              >
                {game.name}
              </Link>
              <div className="flex items-center text-xs text-white mt-1">
                <CalendarDays className="h-3 w-3 mr-1" />
                {game.released
                  ? new Date(game.released).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Unknown"}
              </div>
              <div className="text-xs text-slate-300 mt-1 line-clamp-1">
                {game.genres?.map((g) => g.name).join(", ") || "Unknown genre"}
              </div>
            </div>
          </GlassContainer>
        ))}
      </div>
    </GlassContainer>
  )
}
