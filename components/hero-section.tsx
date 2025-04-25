"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Star, Calendar, Award } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassContainer } from "@/components/ui/glass-container"
import { getPopularGames, type Game } from "@/lib/rawg-api"

export function HeroSection() {
  const [featuredGame, setFeaturedGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const fetchFeaturedGame = async () => {
      try {
        const data = await getPopularGames()
        // Get a random game from the top 5
        const randomIndex = Math.floor(Math.random() * 5)
        setFeaturedGame(data.results[randomIndex])
      } catch (error) {
        console.error("Failed to fetch featured game:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedGame()
  }, [])

  // Parallax effect for background
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e
    const { innerWidth, innerHeight } = window

    const x = (clientX / innerWidth - 0.5) * 20
    const y = (clientY / innerHeight - 0.5) * 20

    setMousePosition({ x, y })
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 animate-pulse">
        <div className="container mx-auto px-4 py-16 h-full flex items-center">
          <div className="w-full max-w-2xl">
            <div className="h-6 bg-slate-700/40 backdrop-blur-md rounded-md mb-4 w-32"></div>
            <div className="h-12 bg-slate-700/40 backdrop-blur-md rounded-md mb-4 w-3/4"></div>
            <div className="h-6 bg-slate-700/40 backdrop-blur-md rounded-md mb-2 w-1/2"></div>
            <div className="h-6 bg-slate-700/40 backdrop-blur-md rounded-md mb-6 w-1/3"></div>
            <div className="h-10 bg-slate-700/40 backdrop-blur-md rounded-md w-40"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!featuredGame) {
    return null
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden" onMouseMove={handleMouseMove}>
      {/* Moving background particles */}
      <div className="absolute inset-0 bg-slate-900">
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-500"
              style={{
                width: `${Math.random() * 5 + 2}px`,
                height: `${Math.random() * 5 + 2}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                boxShadow: "0 0 20px 2px rgba(74, 222, 128, 0.3)",
                filter: "blur(1px)",
                animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Background image with parallax effect */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out"
        style={{
          backgroundImage: `url(${featuredGame.background_image})`,
          filter: "brightness(0.2) saturate(1.4)",
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.1)`,
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />

      {/* Animated gradient border */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-600 via-purple-600 to-blue-600 opacity-50"></div>

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 h-full flex items-center relative z-10">
        <div className="w-full max-w-2xl">
          <GlassContainer intensity="low" className="inline-block mb-6 p-1 px-3 pulse-glow" glow={true}>
            <Badge className="bg-transparent text-emerald-400 border-none p-0 font-bold">FEATURED GAME</Badge>
          </GlassContainer>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">{featuredGame.name}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg px-3 py-1 border border-white/20">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-2" />
              <span className="text-white font-medium">{featuredGame.rating.toFixed(1)}</span>
            </div>

            {featuredGame.metacritic && (
              <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg px-3 py-1 border border-white/20">
                <Award className="w-5 h-5 text-emerald-400 mr-2" />
                <span className="text-white font-medium">{featuredGame.metacritic}</span>
              </div>
            )}

            <div className="flex items-center bg-black/60 backdrop-blur-md rounded-lg px-3 py-1 border border-white/20">
              <Calendar className="w-5 h-5 text-blue-400 mr-2" />
              <span className="text-white font-medium">
                {featuredGame.released && new Date(featuredGame.released).getFullYear()}
              </span>
            </div>
          </div>

          <GlassContainer className="mb-8 p-4 max-w-lg" intensity="high" textContrast="high" border={true}>
            <p className="text-white mb-0 font-medium">
              {featuredGame.genres?.map((g) => g.name).join(", ")}
              {featuredGame.platforms && (
                <>
                  <span className="mx-2">•</span>
                  Available on{" "}
                  {featuredGame.platforms
                    .slice(0, 3)
                    .map((p) => p.platform.name)
                    .join(", ")}
                  {featuredGame.platforms.length > 3 ? " and more" : ""}
                </>
              )}
            </p>
          </GlassContainer>

          <Link href={`/game/${featuredGame.id}`}>
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border-none shadow-lg shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all duration-300 focus-visible:focus-visible">
              View Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating glass elements for decoration */}
      <div
        className="absolute right-[15%] top-[30%] w-32 h-32 rounded-full bg-emerald-500/10 backdrop-blur-sm border border-emerald-500/20 animate-pulse"
        style={{ animationDuration: "4s" }}
      ></div>
      <div
        className="absolute right-[30%] bottom-[20%] w-24 h-24 rounded-full bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 animate-pulse"
        style={{ animationDuration: "6s" }}
      ></div>
    </div>
  )
}
