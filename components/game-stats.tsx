"use client"

import { useState, useEffect } from "react"
import { PieChart, BarChart, Trophy, Clock, CalendarDays } from "lucide-react"
import { GlassContainer } from "@/components/ui/glass-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAllGames } from "@/lib/client-storage"
import type { Game } from "@/lib/types"

interface GamesByStatus {
  Completed: number
  "In Progress": number
  "On Hold": number
  "Not Started": number
}

interface GamesByPlatform {
  [key: string]: number
}

interface GamesByGenre {
  [key: string]: number
}

interface GamesByYear {
  [key: string]: number
}

export function GameStats() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("status")

  // Statistiken
  const [gamesByStatus, setGamesByStatus] = useState<GamesByStatus>({
    Completed: 0,
    "In Progress": 0,
    "On Hold": 0,
    "Not Started": 0,
  })
  const [gamesByPlatform, setGamesByPlatform] = useState<GamesByPlatform>({})
  const [gamesByGenre, setGamesByGenre] = useState<GamesByGenre>({})
  const [gamesByYear, setGamesByYear] = useState<GamesByYear>({})
  const [totalPlaytime, setTotalPlaytime] = useState(0)
  const [completionRate, setCompletionRate] = useState(0)

  useEffect(() => {
    const loadGames = async () => {
      try {
        const allGames = await getAllGames()
        setGames(allGames)
        calculateStats(allGames)
      } catch (error) {
        console.error("Failed to load games:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  const calculateStats = (games: Game[]) => {
    // Spiele nach Status
    const statusCount: GamesByStatus = {
      Completed: 0,
      "In Progress": 0,
      "On Hold": 0,
      "Not Started": 0,
    }

    // Spiele nach Plattform
    const platformCount: GamesByPlatform = {}

    // Spiele nach Genre
    const genreCount: GamesByGenre = {}

    // Spiele nach Erscheinungsjahr
    const yearCount: GamesByYear = {}

    // Gesamtspielzeit
    let totalTime = 0

    games.forEach((game) => {
      // Status zählen
      if (game.status) {
        statusCount[game.status] = (statusCount[game.status] || 0) + 1
      } else {
        statusCount["Not Started"] = (statusCount["Not Started"] || 0) + 1
      }

      // Plattformen zählen
      if (game.platforms && game.platforms.length > 0) {
        game.platforms.forEach((platform) => {
          const platformName = platform.platform.name
          platformCount[platformName] = (platformCount[platformName] || 0) + 1
        })
      }

      // Genres zählen
      if (game.genres && game.genres.length > 0) {
        game.genres.forEach((genre) => {
          genreCount[genre.name] = (genreCount[genre.name] || 0) + 1
        })
      }

      // Jahre zählen
      if (game.released) {
        const year = new Date(game.released).getFullYear().toString()
        yearCount[year] = (yearCount[year] || 0) + 1
      }

      // Verwende die tatsächliche Spielzeit aus der Datenbank
      if (game.playTime) {
        totalTime += game.playTime
      }
    })

    // Abschlussrate berechnen
    const completionRate = games.length > 0 ? (statusCount.Completed / games.length) * 100 : 0

    setGamesByStatus(statusCount)
    setGamesByPlatform(platformCount)
    setGamesByGenre(genreCount)
    setGamesByYear(yearCount)
    setTotalPlaytime(totalTime)
    setCompletionRate(completionRate)
  }

  // Hilfsfunktion zum Erstellen von Balkendiagrammen
  const renderBarChart = (data: Record<string, number>, maxBars = 10) => {
    // Sortiere die Daten nach Wert (absteigend)
    const sortedData = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxBars)

    // Finde den höchsten Wert für die Skalierung
    const maxValue = Math.max(...sortedData.map(([_, value]) => value))

    return (
      <div className="space-y-3 mt-4">
        {sortedData.map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-white font-medium truncate max-w-[70%]">{key}</span>
              <span className="text-emerald-400">{value}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(value / maxValue) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Hilfsfunktion zum Erstellen eines Kreisdiagramms für den Status
  const renderStatusPieChart = () => {
    const total = Object.values(gamesByStatus).reduce((sum, count) => sum + count, 0)
    if (total === 0) return null

    const statusColors = {
      Completed: "#10b981", // emerald-500
      "In Progress": "#3b82f6", // blue-500
      "On Hold": "#f59e0b", // amber-500
      "Not Started": "#6b7280", // gray-500
    }

    let startAngle = 0

    return (
      <div className="relative w-48 h-48 mx-auto my-6">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {Object.entries(gamesByStatus).map(([status, count]) => {
            if (count === 0) return null
            const percentage = (count / total) * 100
            const angle = (percentage / 100) * 360
            const endAngle = startAngle + angle

            // Berechne SVG-Pfad für den Kreissektor
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180)
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180)
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180)
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180)

            const largeArcFlag = angle > 180 ? 1 : 0

            const pathData = [`M 50 50`, `L ${x1} ${y1}`, `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`, `Z`].join(" ")

            const result = (
              <path
                key={status}
                d={pathData}
                fill={statusColors[status as keyof typeof statusColors]}
                stroke="#111827"
                strokeWidth="0.5"
              />
            )

            startAngle = endAngle
            return result
          })}
        </svg>

        {/* Legende */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-3xl font-bold text-white">{total}</div>
          <div className="text-xs text-white/70">Spiele</div>
        </div>
      </div>
    )
  }

  // Legende für das Kreisdiagramm
  const renderStatusLegend = () => {
    const statusLabels = {
      Completed: "Abgeschlossen",
      "In Progress": "In Bearbeitung",
      "On Hold": "Pausiert",
      "Not Started": "Nicht begonnen",
    }

    const statusColors = {
      Completed: "bg-emerald-500",
      "In Progress": "bg-blue-500",
      "On Hold": "bg-amber-500",
      "Not Started": "bg-gray-500",
    }

    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(gamesByStatus).map(([status, count]) => (
          <div key={status} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${statusColors[status as keyof typeof statusColors]} mr-2`}></div>
            <span className="text-sm text-white">
              {statusLabels[status as keyof typeof statusLabels]} ({count})
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </GlassContainer>
    )
  }

  if (games.length === 0) {
    return (
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <p className="text-white text-center py-4">Füge Spiele hinzu, um Statistiken zu sehen.</p>
      </GlassContainer>
    )
  }

  return (
    <GlassContainer className="p-6" intensity="medium" textContrast="high">
      <h2 className="text-xl font-bold text-white mb-4">Spielestatistiken</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          <div className="flex items-center text-emerald-400 mb-2">
            <Trophy className="w-4 h-4 mr-2" />
            <span className="font-medium">Abschlussrate</span>
          </div>
          <p className="text-2xl font-bold text-white">{completionRate.toFixed(1)}%</p>
          <p className="text-xs text-white/70">Abgeschlossene Spiele</p>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          <div className="flex items-center text-emerald-400 mb-2">
            <Clock className="w-4 h-4 mr-2" />
            <span className="font-medium">Spielzeit</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {(totalPlaytime / 60).toFixed(1)} Stunden
          </p>
          <p className="text-xs text-white/70">Gesamtspielzeit</p>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-white/10">
          <div className="flex items-center text-emerald-400 mb-2">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span className="font-medium">Aktivität</span>
          </div>
          <p className="text-2xl font-bold text-white">{games.length}</p>
          <p className="text-xs text-white/70">Spiele in der Bibliothek</p>
        </div>
      </div>

      <Tabs defaultValue="status" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black/50 backdrop-blur-sm border border-white/20 p-1 mb-4">
          <TabsTrigger
            value="status"
            className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
          >
            <PieChart className="w-4 h-4 mr-2" />
            Status
          </TabsTrigger>
          <TabsTrigger
            value="platforms"
            className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
          >
            <BarChart className="w-4 h-4 mr-2" />
            Plattformen
          </TabsTrigger>
          <TabsTrigger
            value="genres"
            className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
          >
            <BarChart className="w-4 h-4 mr-2" />
            Genres
          </TabsTrigger>
          <TabsTrigger
            value="years"
            className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
          >
            <BarChart className="w-4 h-4 mr-2" />
            Jahre
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              {renderStatusPieChart()}
              {renderStatusLegend()}
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Status-Übersicht</h3>
              <p className="text-sm text-white/80 mb-4">
                {gamesByStatus.Completed} von {games.length} Spielen abgeschlossen ({completionRate.toFixed(1)}%)
              </p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">Abgeschlossen</span>
                    <span className="text-emerald-400">{gamesByStatus.Completed}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${(gamesByStatus.Completed / games.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">In Bearbeitung</span>
                    <span className="text-blue-400">{gamesByStatus["In Progress"]}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(gamesByStatus["In Progress"] / games.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">Pausiert</span>
                    <span className="text-amber-400">{gamesByStatus["On Hold"]}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-amber-500 h-2 rounded-full"
                      style={{ width: `${(gamesByStatus["On Hold"] / games.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white">Nicht begonnen</span>
                    <span className="text-gray-400">{gamesByStatus["Not Started"]}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gray-500 h-2 rounded-full"
                      style={{ width: `${(gamesByStatus["Not Started"] / games.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="platforms" className="mt-0">
          <h3 className="text-lg font-medium text-white mb-3">Spiele nach Plattform</h3>
          {renderBarChart(gamesByPlatform)}
        </TabsContent>

        <TabsContent value="genres" className="mt-0">
          <h3 className="text-lg font-medium text-white mb-3">Spiele nach Genre</h3>
          {renderBarChart(gamesByGenre)}
        </TabsContent>

        <TabsContent value="years" className="mt-0">
          <h3 className="text-lg font-medium text-white mb-3">Spiele nach Erscheinungsjahr</h3>
          {renderBarChart(gamesByYear)}
        </TabsContent>
      </Tabs>
    </GlassContainer>
  )
}
