"use client"

import { useState, useEffect } from "react"
import { Star, Award, Clock, Gamepad2 } from "lucide-react"
import { GlassContainer } from "@/components/ui/glass-container"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { getAllGames } from "@/lib/client-storage"
import type { Game } from "@/lib/types"

export function GameStatsCard() {
  const [stats, setStats] = useState({
    totalGames: 0,
    averageUserRating: 0,
    ratedGames: 0,
    highestRatedGame: null as Game | null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const games = await getAllGames()

        // Berechne Statistiken
        const gamesWithRating = games.filter((game) => game.userRating && game.userRating > 0)
        const totalRating = gamesWithRating.reduce((sum, game) => sum + (game.userRating || 0), 0)
        const averageRating = gamesWithRating.length > 0 ? totalRating / gamesWithRating.length : 0

        // Finde das am höchsten bewertete Spiel
        const highestRated =
          gamesWithRating.length > 0
            ? gamesWithRating.reduce(
                (highest, game) => ((game.userRating || 0) > (highest.userRating || 0) ? game : highest),
                gamesWithRating[0],
              )
            : null

        setStats({
          totalGames: games.length,
          averageUserRating: averageRating,
          ratedGames: gamesWithRating.length,
          highestRatedGame: highestRated,
        })
      } catch (error) {
        console.error("Failed to load game stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
            <div className="h-20 bg-white/10 rounded"></div>
          </div>
        </div>
      </GlassContainer>
    )
  }

  return (
    <GlassContainer className="p-6" intensity="medium" textContrast="high">
      <h2 className="text-xl font-bold text-white mb-4">Bewertungsstatistik</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          <div className="flex items-center text-emerald-400 mb-2">
            <Star className="w-4 h-4 mr-2 fill-yellow-400" />
            <span className="font-medium">Durchschnittliche Bewertung</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats.averageUserRating > 0 ? stats.averageUserRating.toFixed(1) : "Keine"}
          </p>
          <p className="text-xs text-white/70">
            {stats.ratedGames} von {stats.totalGames} Spielen bewertet
          </p>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          <div className="flex items-center text-emerald-400 mb-2">
            <Award className="w-4 h-4 mr-2" />
            <span className="font-medium">Höchste Bewertung</span>
          </div>
          {stats.highestRatedGame ? (
            <>
              <p className="text-lg font-bold text-white truncate">{stats.highestRatedGame.name}</p>
              <p className="text-xs text-white/70 flex items-center">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                {stats.highestRatedGame.userRating} von 5 Sternen
              </p>
            </>
          ) : (
            <p className="text-white">Noch keine Bewertungen</p>
          )}
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          <div className="flex items-center text-emerald-400 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">Bewertungsfortschritt</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 mb-2">
            <div
              className="bg-emerald-500 h-2 rounded-full"
              style={{ width: `${stats.totalGames > 0 ? (stats.ratedGames / stats.totalGames) * 100 : 0}%` }}
            ></div>
          </div>
          <p className="text-xs text-white/70">
            {stats.totalGames > 0
              ? `${Math.round((stats.ratedGames / stats.totalGames) * 100)}% deiner Bibliothek bewertet`
              : "Keine Spiele in der Bibliothek"}
          </p>
        </div>
      </div>
    </GlassContainer>
  )
}
