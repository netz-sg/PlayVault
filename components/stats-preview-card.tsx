"use client"

import { useState, useEffect } from "react"
import { Star, Award, Clock, PieChart, BarChart, Trophy } from "lucide-react"
import { GlassContainer } from "@/components/ui/glass-container"
import { getAllGames } from "@/lib/client-storage"
import type { Game } from "@/lib/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function StatsPreviewCard() {
  const [stats, setStats] = useState({
    totalGames: 0,
    completedGames: 0,
    inProgressGames: 0,
    notStartedGames: 0,
    completionRate: 0,
    totalPlaytime: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const games = await getAllGames()
        
        // Calculate basic stats
        const completed = games.filter(g => g.status === "Completed")
        const inProgress = games.filter(g => g.status === "In Progress")
        const notStarted = games.filter(g => g.status === "Not Started" || !g.status)
        
        // Calculate total playtime (in hours)
        const totalPlaytime = games.reduce((sum, game) => sum + (game.playTime || 0), 0)
        
        // Calculate completion rate
        const completionRate = games.length > 0 
          ? (completed.length / games.length) * 100 
          : 0
        
        setStats({
          totalGames: games.length,
          completedGames: completed.length,
          inProgressGames: inProgress.length,
          notStartedGames: notStarted.length,
          completionRate,
          totalPlaytime,
        })
      } catch (error) {
        console.error("Failed to load stats preview:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  // Mini pie chart for status distribution
  const renderMiniPieChart = () => {
    const total = stats.totalGames
    if (total === 0) return null

    const statusColors = {
      Completed: "#10b981", // emerald-500
      "In Progress": "#3b82f6", // blue-500
      "Not Started": "#6b7280", // gray-500
    }

    // Calculate angles for the pie chart segments
    const completedAngle = (stats.completedGames / total) * 360
    const inProgressAngle = (stats.inProgressGames / total) * 360
    // The rest is not started

    let startAngle = 0
    
    return (
      <div className="relative w-20 h-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Completed segment */}
          {stats.completedGames > 0 && (
            <path
              d={describeArc(50, 50, 40, startAngle, startAngle + completedAngle)}
              fill={statusColors.Completed}
              stroke="#111827"
              strokeWidth="0.5"
            />
          )}
          
          {/* In Progress segment */}
          {stats.inProgressGames > 0 && (
            <path
              d={describeArc(50, 50, 40, startAngle + completedAngle, startAngle + completedAngle + inProgressAngle)}
              fill={statusColors["In Progress"]}
              stroke="#111827"
              strokeWidth="0.5"
            />
          )}
          
          {/* Not Started segment */}
          {stats.notStartedGames > 0 && (
            <path
              d={describeArc(50, 50, 40, startAngle + completedAngle + inProgressAngle, 360)}
              fill={statusColors["Not Started"]}
              stroke="#111827"
              strokeWidth="0.5"
            />
          )}
        </svg>
        
        {/* Center text */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-lg font-bold text-white">{total}</div>
        </div>
      </div>
    )
  }

  // Helper function to create SVG arc path
  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    }
  }

  function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(x, y, radius, endAngle)
    const end = polarToCartesian(x, y, radius, startAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1"
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z"
    ].join(" ")
  }

  // Format playtime from hours to a readable format
  const formatPlaytime = (hours: number) => {
    if (hours < 1) return "< 1 Std."
    return `${Math.round(hours)} Std.`
  }

  if (loading) {
    return (
      <GlassContainer className="p-5" intensity="medium" textContrast="high">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-white/10 rounded"></div>
            <div className="h-16 bg-white/10 rounded"></div>
            <div className="h-16 bg-white/10 rounded"></div>
          </div>
        </div>
      </GlassContainer>
    )
  }

  return (
    <div className="group">
      <GlassContainer className="p-5 transition-all duration-200 group-hover:bg-white/5" intensity="medium" textContrast="high" glow={true}>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-purple-400" />
              Spielestatistik
            </h2>
            <Link href="/stats">
              <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/30">
                Details
              </Button>
            </Link>
          </div>

          <Link href="/stats" className="block">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                {renderMiniPieChart()}
                <div className="flex flex-col">
                  <span className="text-xs text-white/70">Abschlussrate</span>
                  <span className="text-lg font-bold text-white">{Math.round(stats.completionRate)}%</span>
                </div>
              </div>
              
              <div className="flex flex-col justify-center items-center text-center">
                <div className="flex items-center text-emerald-400 mb-1">
                  <Trophy className="w-4 h-4 mr-1" />
                  <span className="text-xs">Abgeschlossen</span>
                </div>
                <span className="text-lg font-bold text-white">{stats.completedGames}</span>
              </div>
              
              <div className="flex flex-col justify-center items-center text-center">
                <div className="flex items-center text-emerald-400 mb-1">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-xs">Spielzeit</span>
                </div>
                <span className="text-lg font-bold text-white">{formatPlaytime(stats.totalPlaytime)}</span>
              </div>
            </div>
          </Link>
        </div>
      </GlassContainer>
    </div>
  )
} 