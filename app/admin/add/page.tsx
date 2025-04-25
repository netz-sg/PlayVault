"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AddGameForm } from "@/components/add-game-form"
import { useAuth } from "@/components/auth-provider"

export default function AddGamePage() {
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
    <div>
      <Link href="/admin" className="inline-flex items-center text-white hover:text-emerald-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zum Admin-Bereich
      </Link>

      <AddGameForm />
    </div>
  )
}
