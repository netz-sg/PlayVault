"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { GameGrid } from "@/components/game-grid"
import { StorageStats } from "@/components/storage-stats"
import { GameStats } from "@/components/game-stats"
import { useAuth } from "@/components/auth-provider"

export default function AdminPage() {
  const { isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Wenn der Benutzer nicht angemeldet oder kein Admin ist, zur Login-Seite weiterleiten
    if (!isAuthenticated || !isAdmin) {
      router.push("/login")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) {
    return null
  }

  return (
    <div className="space-y-8">
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin-Bereich</h1>
            <p className="text-white">Verwalte deine Spielebibliothek</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/add">
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400">
                <Plus className="w-4 h-4 mr-2" />
                Spiel hinzufügen
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button
                variant="outline"
                className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Einstellungen
              </Button>
            </Link>
          </div>
        </div>
      </GlassContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <StorageStats />
        <GameStats />
      </div>

      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <h2 className="text-xl font-bold text-white mb-6">Bibliothek verwalten</h2>
        <GameGrid />
      </GlassContainer>
    </div>
  )
}
