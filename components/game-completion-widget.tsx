"use client"

import { useState, useEffect } from "react"
import { Trophy } from "lucide-react"
import { getAllGames } from "@/lib/client-storage"

export function GameCompletionWidget({ className = "" }: { className?: string }) {
  const [completionRate, setCompletionRate] = useState(0)
  const [totalGames, setTotalGames] = useState(0)
  const [completedGames, setCompletedGames] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCompletionData = async () => {
      try {
        const games = await getAllGames()
        const completed = games.filter(game => game.status === "Completed").length
        const rate = games.length > 0 ? (completed / games.length) * 100 : 0
        
        setTotalGames(games.length)
        setCompletedGames(completed)
        setCompletionRate(rate)
      } catch (error) {
        console.error("Failed to load completion data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCompletionData()
  }, [])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-white/10 rounded w-full mb-1"></div>
        <div className="h-6 bg-white/10 rounded w-1/3"></div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center mb-1">
        <Trophy className="h-4 w-4 text-yellow-400 mr-1.5" />
        <span className="text-sm font-medium text-white/80">Abschlussfortschritt</span>
      </div>
      
      <div className="mb-1.5">
        <div className="bg-black/30 h-2 rounded-full w-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs">
        <span className="text-white/60">{completedGames} von {totalGames} abgeschlossen</span>
        <span className="font-medium text-emerald-400">{Math.round(completionRate)}%</span>
      </div>
    </div>
  )
} 