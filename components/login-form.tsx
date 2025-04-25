"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassContainer } from "@/components/ui/glass-container"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Bitte gib Benutzername und Passwort ein.")
      return
    }

    setLoading(true)

    try {
      const success = login(username, password)

      if (success) {
        router.push("/admin")
      } else {
        setError("Ungültiger Benutzername oder Passwort.")
      }
    } catch (err) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <GlassContainer className="p-6 max-w-md w-full" intensity="medium" textContrast="high">
      <h1 className="text-2xl font-bold text-white mb-6">Admin-Login</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username" className="text-white">
            Benutzername
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

        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-md text-sm">{error}</div>}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
        >
          {loading ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Anmelden...
            </>
          ) : (
            "Anmelden"
          )}
        </Button>
      </form>
    </GlassContainer>
  )
}
