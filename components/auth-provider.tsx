"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { isAuthenticated, isAdmin } from "@/lib/auth"
import { isSetupCompleted } from "@/lib/client-storage"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  isAuthenticated: boolean
  isAdmin: boolean
  isSetupCompleted: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  isSetupCompleted: false,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthContextType>({
    isAuthenticated: false,
    isAdmin: false,
    isSetupCompleted: false,
    loading: true,
  })

  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Prüfe den Authentifizierungsstatus und Setup-Status
        const setupCompleted = await isSetupCompleted()
        const authenticated = isAuthenticated()
        const adminStatus = await isAdmin()

        setAuth({
          isAuthenticated: authenticated,
          isAdmin: adminStatus,
          isSetupCompleted: setupCompleted,
          loading: false,
        })

        // Weiterleitung basierend auf Auth-Status und aktuellem Pfad
        if (!setupCompleted && pathname !== "/setup") {
          router.push("/setup")
        } else if (setupCompleted && pathname === "/setup") {
          router.push("/")
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setAuth(prev => ({ ...prev, loading: false }))
      }
    }

    checkAuth()
  }, [pathname, router])

  return (
    <AuthContext.Provider value={auth}>
      {auth.loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}
