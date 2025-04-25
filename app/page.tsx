"use client"

import { useState, useEffect } from "react"
import { GameGrid } from "@/components/game-grid"
import { GlassContainer } from "@/components/ui/glass-container"
import { FeaturedGameHero } from "@/components/featured-game-hero"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, TrendingUp, Trophy, Clock, Star, PlusCircle, Heart, BarChart } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAllGames } from "@/lib/client-storage"
import { StatsPreviewCard } from "@/components/stats-preview-card"
import { GameCompletionWidget } from "@/components/game-completion-widget"
import type { Game } from "@/lib/types"

export default function HomePage() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<Game[]>([])
  const [favorites, setFavorites] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGames = async () => {
      try {
        const allGames = await getAllGames()
        
        // Get favorites
        const favGames = allGames
          .filter(game => game.favorite)
          .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
          .slice(0, 3)
        
        // Get recently played/modified games
        const recentGames = [...allGames]
          .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
          .slice(0, 3)
        
        setFavorites(favGames)
        setRecentlyPlayed(recentGames)
      } catch (error) {
        console.error("Error loading games for homepage:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadGames()
  }, [])

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <FeaturedGameHero />
      
      {/* Intro Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassContainer className="p-6 md:col-span-2" intensity="medium" textContrast="high" glow={true}>
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-3xl font-bold text-white">Spielebibliothek</h1>
            <Link href="/add-game" passHref>
              <Button 
                variant="ghost" 
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30"
                size="sm"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Spiel hinzufügen
              </Button>
            </Link>
          </div>
          
          <p className="text-white/80 leading-relaxed mb-4">
            Willkommen in deiner persönlichen Spielebibliothek. Hier verwaltest du deine Spielesammlung, verfolgst deinen Fortschritt und behältst den Überblick über deine Gaming-Erlebnisse.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <Link href="/wishlist" className="block">
              <GlassContainer className="p-4 hover:bg-white/5 transition-colors h-full" intensity="low" glow={false}>
                <div className="flex flex-col items-center text-center">
                  <Heart className="h-8 w-8 text-rose-400 mb-2" />
                  <h3 className="text-white font-medium">Wunschliste</h3>
                  <p className="text-white/60 text-sm mt-1">Spiele zum späteren Kauf</p>
                </div>
              </GlassContainer>
            </Link>
            
            <Link href="/search" className="block">
              <GlassContainer className="p-4 hover:bg-white/5 transition-colors h-full" intensity="low" glow={false}>
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-emerald-400 mb-2" />
                  <h3 className="text-white font-medium">Entdecken</h3>
                  <p className="text-white/60 text-sm mt-1">Neue Spiele finden</p>
                </div>
              </GlassContainer>
            </Link>
            
            <Link href="/stats" className="block">
              <GlassContainer className="p-4 hover:bg-white/5 transition-colors h-full" intensity="low" glow={false}>
                <div className="flex flex-col items-center text-center">
                  <BarChart className="h-8 w-8 text-purple-400 mb-2" />
                  <h3 className="text-white font-medium">Statistiken</h3>
                  <p className="text-white/60 text-sm mt-1">Detaillierte Auswertungen</p>
                </div>
              </GlassContainer>
            </Link>
          </div>
        </GlassContainer>
        
        {/* Quick Stats Card */}
        <GlassContainer className="p-6" intensity="medium" textContrast="high" glow={true}>
          <div className="mb-3">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-400" />
              Favoriten
            </h2>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-white/10 rounded"></div>
                <div className="h-16 bg-white/10 rounded"></div>
                <div className="h-16 bg-white/10 rounded"></div>
              </div>
            ) : favorites.length > 0 ? (
              favorites.map(game => (
                <Link key={game.id} href={`/game/${game.id}`}>
                  <GlassContainer 
                    className="p-3 flex items-center gap-3 hover:bg-white/5 transition-colors" 
                    intensity="low"
                  >
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={game.background_image || "/placeholder.svg"} 
                        alt={game.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white text-sm font-medium truncate">{game.name}</h3>
                      <p className="text-white/60 text-xs">{game.status || "Nicht begonnen"}</p>
                    </div>
                  </GlassContainer>
                </Link>
              ))
            ) : (
              <div className="text-center py-6 text-white/60">
                Noch keine Favoriten markiert
              </div>
            )}
            
            <div className="pt-2">
              <Link href="/games?filter=favorites" className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center justify-end">
                Alle anzeigen <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
            
            {/* Game Completion Widget */}
            <Separator className="bg-white/10 my-3" />
            <GameCompletionWidget className="mt-2" />
          </div>
        </GlassContainer>
      </section>
      

      <Separator className="bg-white/10" />
      
      {/* Game Collection */}
      <section className="pt-4">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Meine Sammlung</h2>
            <TabsList className="bg-slate-900/50 backdrop-blur border border-white/10">
              <TabsTrigger value="all" className="data-[state=active]:bg-emerald-600">Alle</TabsTrigger>
              <TabsTrigger value="playing" className="data-[state=active]:bg-emerald-600">Aktiv</TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-600">Abgeschlossen</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="all" className="mt-0">
            <GameGrid />
          </TabsContent>
          
          <TabsContent value="playing" className="mt-0">
            <GameGrid filterStatus="In Progress" />
          </TabsContent>
          
          <TabsContent value="completed" className="mt-0">
            <GameGrid filterStatus="Completed" />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
