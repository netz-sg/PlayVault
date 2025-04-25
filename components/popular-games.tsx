"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Star, Trophy, ArrowRight } from "lucide-react"

import { GlassContainer } from "@/components/ui/glass-container"
import { getPopularGames, type Game } from "@/lib/rawg-api"

export function PopularGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchPopularGames = async () => {
      try {
        const data = await getPopularGames()
        setGames(data.results.slice(0, 5))
      } catch (error) {
        console.error("Failed to fetch popular games:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularGames()
  }, [])

  if (loading) {
    return (
      <GlassContainer intensity="medium" className="p-6 h-full">
        <h2 className="text-xl font-bold text-white mb-4">Popular Games</h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-white/5 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </GlassContainer>
    )
  }

  return (
    <GlassContainer intensity="medium" className="p-6 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-400" />
          Popular Games
        </h2>
        <Link
          href="/discover"
          className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center font-medium"
        >
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-4">
        {games.map((game, index) => (
          <GlassContainer
            key={game.id}
            className={`p-3 transform transition-all duration-300 ${hoveredIndex === index ? "translate-x-1" : ""}`}
            intensity="medium"
            textContrast="high"
            glow={hoveredIndex === index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Link href={`/game/${game.id}`} className="flex items-center gap-3">
              <div className="w-6 h-6 flex-shrink-0 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 text-emerald-400 font-medium text-sm">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-white font-medium transition-colors line-clamp-1 ${
                    hoveredIndex === index ? "text-emerald-400" : ""
                  }`}
                >
                  {game.name}
                </p>
                <div className="flex items-center text-xs text-white">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 mr-1" />
                  {game.rating.toFixed(1)} ({game.ratings_count.toLocaleString()} ratings)
                </div>
              </div>
            </Link>
          </GlassContainer>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/20">
        <Link
          href="/discover"
          className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center justify-center"
        >
          Discover more games
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </GlassContainer>
  )
}
