"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { isAuthenticated } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Wenn der Benutzer bereits angemeldet ist, zum Admin-Bereich weiterleiten
    if (isAuthenticated()) {
      router.push("/admin")
    }
  }, [router])

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
