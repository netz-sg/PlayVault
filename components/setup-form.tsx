"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { saveUser, saveSettings } from "@/lib/client-storage"
import { createAdminUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassContainer } from "@/components/ui/glass-container"

export function SetupForm() {
  const [libraryName, setLibraryName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validierung
    if (!libraryName || !username || !password) {
      setError("Alle Felder müssen ausgefüllt werden.")
      return
    }

    if (password !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.")
      return
    }

    setLoading(true)

    try {
      // Erstelle den Admin-Benutzer
      const user = await createAdminUser(username, password)

      // Speichere die App-Einstellungen
      await saveSettings({
        libraryName,
        setupCompleted: true,
      })

      // Weiterleitung zur Hauptseite
      router.push("/")
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassContainer className="p-6 max-w-md w-full" intensity="medium" textContrast="high">
      <h1 className="text-2xl font-bold text-white mb-6">Ersteinrichtung</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="libraryName" className="text-white">
            Name der Spielebibliothek
          </Label>
          <Input
            id="libraryName"
            value={libraryName}
            onChange={(e) => setLibraryName(e.target.value)}
            placeholder="Meine Spielebibliothek"
            className="bg-black/30 border-white/20 text-white placeholder:text-slate-400"
          />
        </div>

        <div>
          <Label htmlFor="username" className="text-white">
            Admin-Benutzername
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
            className="bg-black/30 border-white/20 text-white placeholder:text-slate-400"
          />
        </div>

        <div>
          <Label htmlFor="password" className="text-white">
            Passwort
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-black/30 border-white/20 text-white placeholder:text-slate-400"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword" className="text-white">
            Passwort bestätigen
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="bg-black/30 border-white/20 text-white placeholder:text-slate-400"
          />
        </div>

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-md text-sm">{error}</div>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Einrichtung...
            </>
          ) : (
            "Bibliothek einrichten"
          )}
        </Button>
      </form>
    </GlassContainer>
  )
}
