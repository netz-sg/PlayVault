"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { getAllGames } from "@/lib/client-storage"
import { GameStatsCard } from "@/components/game-stats-card"
import { Card } from "@/components/ui/card"
import { 
  ArrowLeft, 
  BarChart, 
  Clock, 
  Trophy, 
  Star, 
  Calendar, 
  BarChart2, 
  PieChart,
  Activity 
} from "lucide-react"
import Link from "next/link"
import type { Game } from "@/lib/types"
import { GameCompletionWidget } from "@/components/game-completion-widget"

// Platzhalter für Chart-Komponenten (in echtem Projekt würde man diese separieren)
const PlaytimeByGenreChart = () => (
  <div className="w-full h-64 bg-gradient-to-br from-purple-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center">
    <p className="text-white/70 text-sm">Spielzeit nach Genre (Platzhalter)</p>
  </div>
)

const GameCompletionChart = () => (
  <div className="w-full h-64 bg-gradient-to-br from-blue-500/20 to-amber-500/20 rounded-lg flex items-center justify-center">
    <p className="text-white/70 text-sm">Abschlussrate über Zeit (Platzhalter)</p>
  </div>
)

const YearlyActivityChart = () => (
  <div className="w-full h-64 bg-gradient-to-br from-rose-500/20 to-blue-500/20 rounded-lg flex items-center justify-center">
    <p className="text-white/70 text-sm">Jährliche Spieleaktivität (Platzhalter)</p>
  </div>
)

export default function StatsPage() {
  const [stats, setStats] = useState({
    totalGames: 0,
    completedGames: 0,
    inProgressGames: 0,
    notStartedGames: 0,
    onHoldGames: 0,
    totalPlaytime: 0,
    averagePlaytime: 0,
    completionRate: 0,
    favoriteGenre: "",
    mostPlayedGame: { name: "", playtime: 0 },
    recentlyCompletedGames: [] as Game[],
    gamesByPlatform: {} as Record<string, number>,
    gamesByGenre: {} as Record<string, number>,
    gamesByYear: {} as Record<string, number>,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const allGames = await getAllGames()
        
        // Berechne Basisstatistiken
        const completed = allGames.filter(g => g.status === "Completed")
        const inProgress = allGames.filter(g => g.status === "In Progress")
        const notStarted = allGames.filter(g => g.status === "Not Started" || !g.status)
        const onHold = allGames.filter(g => g.status === "On Hold")
        
        // Berechne Gesamtspielzeit (in Stunden)
        const totalPlaytime = allGames.reduce((sum, game) => sum + (game.playTime || 0), 0)
        
        // Berechne meistgespieltes Spiel
        const mostPlayed = [...allGames].sort((a, b) => (b.playTime || 0) - (a.playTime || 0))[0] || null
        
        // Berechne Abschlussrate
        const completionRate = allGames.length > 0 
          ? (completed.length / allGames.length) * 100 
          : 0
        
        // Generiere Platform-Statistiken
        const platformStats: Record<string, number> = {}
        allGames.forEach(game => {
          if (game.platforms && game.platforms.length > 0) {
            game.platforms.forEach(platformObj => {
              const platformName = platformObj.platform.name;
              platformStats[platformName] = (platformStats[platformName] || 0) + 1
            })
          }
        })
        
        // Generiere Genre-Statistiken
        const genreStats: Record<string, number> = {}
        allGames.forEach(game => {
          if (game.genres && game.genres.length > 0) {
            game.genres.forEach(genre => {
              genreStats[genre.name] = (genreStats[genre.name] || 0) + 1
            })
          }
        })
        
        // Finde häufigstes Genre
        let favoriteGenre = ""
        let maxGenreCount = 0
        Object.entries(genreStats).forEach(([genre, count]) => {
          if (count > maxGenreCount) {
            maxGenreCount = count
            favoriteGenre = genre
          }
        })
        
        // Generiere Jahr-Statistiken (Release-Jahr)
        const yearStats: Record<string, number> = {}
        allGames.forEach(game => {
          if (game.released) {
            const year = new Date(game.released).getFullYear().toString()
            yearStats[year] = (yearStats[year] || 0) + 1
          }
        })
        
        // Letzten 5 abgeschlossene Spiele
        const recentlyCompleted = [...completed]
          .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
          .slice(0, 5)
        
        setStats({
          totalGames: allGames.length,
          completedGames: completed.length,
          inProgressGames: inProgress.length,
          notStartedGames: notStarted.length,
          onHoldGames: onHold.length,
          totalPlaytime,
          averagePlaytime: allGames.length > 0 ? totalPlaytime / allGames.length : 0,
          completionRate,
          favoriteGenre,
          mostPlayedGame: mostPlayed ? { 
            name: mostPlayed.name, 
            playtime: mostPlayed.playTime || 0 
          } : { name: "", playtime: 0 },
          recentlyCompletedGames: recentlyCompleted,
          gamesByPlatform: platformStats,
          gamesByGenre: genreStats,
          gamesByYear: yearStats,
        })
      } catch (error) {
        console.error("Fehler beim Laden der Statistiken:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [])

  const formatPlaytime = (hours: number) => {
    return `${hours.toFixed(1)} Std.`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <BarChart2 className="mr-3 h-8 w-8 text-purple-400" />
            Spielestatistiken
          </h1>
        </div>
      </div>
      
      {/* Hauptstatistiken */}
      <section>
        <GlassContainer className="p-6" intensity="medium" textContrast="high" glow={true}>
          <h2 className="text-xl font-bold text-white mb-4">Übersicht</h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white/10 rounded"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GlassContainer className="p-4" intensity="low">
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-1">Gesamte Spiele</p>
                    <p className="text-3xl font-bold text-white">{stats.totalGames}</p>
                  </div>
                </GlassContainer>
                
                <GlassContainer className="p-4" intensity="low">
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-1">Abschlussrate</p>
                    <p className="text-3xl font-bold text-white">{stats.completionRate.toFixed(0)}%</p>
                  </div>
                </GlassContainer>
                
                <GlassContainer className="p-4" intensity="low">
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-1">Gesamtspielzeit</p>
                    <p className="text-3xl font-bold text-white">{formatPlaytime(stats.totalPlaytime)}</p>
                  </div>
                </GlassContainer>
                
                <GlassContainer className="p-4" intensity="low">
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-1">Lieblingsgenre</p>
                    <p className="text-xl font-bold text-white truncate">{stats.favoriteGenre || "N/A"}</p>
                  </div>
                </GlassContainer>
              </div>
              
              <div className="mt-6">
                <GameCompletionWidget />
              </div>
            </>
          )}
        </GlassContainer>
      </section>
      
      {/* Detailstatistiken */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Detaillierte Auswertung</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassContainer className="p-6" intensity="medium" textContrast="high">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-amber-400 h-5 w-5" />
              <h3 className="text-lg font-medium text-white">Spielstatus</h3>
            </div>
            
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-white/10 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-white/80">Abgeschlossen</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${stats.completedGames * 5}px` }}></div>
                    <p className="text-white font-medium">{stats.completedGames}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-white/80">In Bearbeitung</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${stats.inProgressGames * 5}px` }}></div>
                    <p className="text-white font-medium">{stats.inProgressGames}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-white/80">Nicht begonnen</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-gray-500 rounded-full" style={{ width: `${stats.notStartedGames * 5}px` }}></div>
                    <p className="text-white font-medium">{stats.notStartedGames}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-white/80">Auf Eis gelegt</p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-gray-500 rounded-full" style={{ width: `${stats.onHoldGames * 5}px` }}></div>
                    <p className="text-white font-medium">{stats.onHoldGames}</p>
                  </div>
                </div>
              </div>
            )}
          </GlassContainer>
          
          <GlassContainer className="p-6" intensity="medium" textContrast="high">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-blue-400 h-5 w-5" />
              <h3 className="text-lg font-medium text-white">Spielzeit</h3>
            </div>
            
            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-20 bg-white/10 rounded"></div>
                <div className="h-12 bg-white/10 rounded"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-white/80 mb-1">Gesamtspielzeit</p>
                  <p className="text-4xl font-bold text-white">{formatPlaytime(stats.totalPlaytime)}</p>
                  <p className="text-white/60 text-sm mt-1">Durchschnitt: {formatPlaytime(stats.averagePlaytime)} pro Spiel</p>
                </div>
                
                {stats.mostPlayedGame.name && (
                  <div className="p-3 bg-white/5 rounded-lg">
                    <p className="text-white/80 text-sm">Meistgespieltes Spiel:</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-white font-medium">{stats.mostPlayedGame.name}</p>
                      <p className="text-emerald-400">{formatPlaytime(stats.mostPlayedGame.playtime)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </GlassContainer>
        </div>
      </section>
      
      {/* Tabellenvisualisierungen mit Tabs */}
      <section>
        <Tabs defaultValue="playtime" className="w-full">
          <TabsList className="bg-slate-900/50 backdrop-blur border border-white/10 mb-6">
            <TabsTrigger value="playtime" className="data-[state=active]:bg-purple-600">
              <Clock className="h-4 w-4 mr-2" />
              Spielzeit
            </TabsTrigger>
            <TabsTrigger value="completion" className="data-[state=active]:bg-purple-600">
              <Trophy className="h-4 w-4 mr-2" />
              Abschluss
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">
              <Activity className="h-4 w-4 mr-2" />
              Aktivität
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="playtime" className="mt-0">
            <GlassContainer className="p-6" intensity="medium" textContrast="high">
              <h3 className="text-xl font-bold text-white mb-4">Spielzeit nach Genre</h3>
              <div className="h-64">
                <PlaytimeByGenreChart />
              </div>
            </GlassContainer>
          </TabsContent>
          
          <TabsContent value="completion" className="mt-0">
            <GlassContainer className="p-6" intensity="medium" textContrast="high">
              <h3 className="text-xl font-bold text-white mb-4">Abschlussrate über Zeit</h3>
              <div className="h-64">
                <GameCompletionChart />
              </div>
            </GlassContainer>
          </TabsContent>
          
          <TabsContent value="activity" className="mt-0">
            <GlassContainer className="p-6" intensity="medium" textContrast="high">
              <h3 className="text-xl font-bold text-white mb-4">Jährliche Spieleaktivität</h3>
              <div className="h-64">
                <YearlyActivityChart />
              </div>
            </GlassContainer>
          </TabsContent>
        </Tabs>
      </section>
      
      {/* Detaillierte GameStatsCard falls gewünscht */}
      <section className="pt-4">
        <GameStatsCard />
      </section>
    </div>
  )
} 