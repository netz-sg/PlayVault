import { GameGrid } from "@/components/game-grid"
import { GlassContainer } from "@/components/ui/glass-container"
import { GameStats } from "@/components/game-stats"
import { GameStatsCard } from "@/components/game-stats-card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-8">
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <h1 className="text-2xl font-bold text-white mb-4">Spielebibliothek</h1>
        <p className="text-white">
          Willkommen in deiner persönlichen Spielebibliothek. Hier findest du alle deine Spiele, Notizen und Lösungen.
        </p>
        <div className="flex justify-end mt-4">
          <Link href="/wishlist" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center">
            Zur Wunschliste <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </GlassContainer>

      <GameStats />

      <GameStatsCard />

      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <h2 className="text-xl font-bold text-white mb-6">Meine Sammlung</h2>
        <GameGrid />
      </GlassContainer>
    </div>
  )
}
