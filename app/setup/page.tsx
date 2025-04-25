"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SetupForm } from "@/components/setup-form"
import { isSetupCompleted } from "@/lib/client-storage"

export default function SetupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wenn die Einrichtung bereits abgeschlossen ist, zur Hauptseite weiterleiten
    const checkSetup = async () => {
      try {
        const setupDone = await isSetupCompleted()
        if (setupDone) {
          router.push("/")
        }
      } catch (error) {
        console.error("Error checking setup status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkSetup()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="w-full max-w-md">
        <SetupForm />
      </div>
    </div>
  )
}
