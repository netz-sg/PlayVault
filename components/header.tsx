"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogIn, LogOut, Search, Menu, X, Settings, PlusCircle, UserCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GlassContainer } from "@/components/ui/glass-container"
import { useAuth } from "@/components/auth-provider"
import { logout } from "@/lib/auth"
import { getSettings } from "@/lib/client-storage"

export function Header() {
  const { isAuthenticated, isAdmin } = useAuth()
  const [libraryName, setLibraryName] = useState("Spielebibliothek")
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await getSettings()
        if (settingsData) {
          setLibraryName(settingsData.libraryName || "Meine Spielebibliothek")
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
        setLibraryName("Meine Spielebibliothek")
      }
    }

    loadSettings()
  }, [])

  const handleLogout = () => {
    logout()
    window.location.href = "/"
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <header className="bg-black/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo und Titel */}
          <Link href="/" className="text-xl font-bold text-white hover:text-emerald-400 transition-colors">
            {libraryName}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex items-center space-x-4">
              <Link
                href="/"
                className={`text-sm ${isActive("/") ? "text-emerald-400" : "text-white hover:text-emerald-300"} transition-colors`}
              >
                Bibliothek
              </Link>
              <Link
                href="/discover"
                className={`text-sm ${isActive("/discover") ? "text-emerald-400" : "text-white hover:text-emerald-300"} transition-colors`}
              >
                Entdecken
              </Link>
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className={`text-sm ${isActive("/wishlist") ? "text-emerald-400" : "text-white hover:text-emerald-300"} transition-colors`}
                >
                  Meine Wunschliste
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm ${isActive("/admin") ? "text-emerald-400" : "text-white hover:text-emerald-300"} transition-colors`}
                >
                  Admin-Bereich
                </Link>
              )}
            </nav>

            <form onSubmit={handleSearch} className="relative w-64">
              <GlassContainer className="p-0" intensity="medium">
                <Input
                  type="text"
                  placeholder="Spiele suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-white pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
              </GlassContainer>
            </form>

            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:text-red-400 hover:bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Abmelden
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:text-emerald-400 hover:bg-transparent">
                  <LogIn className="h-4 w-4 mr-2" />
                  Admin-Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pb-2">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className={`text-sm ${isActive("/") ? "text-emerald-400" : "text-white"} py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Bibliothek
              </Link>
              <Link
                href="/discover"
                className={`text-sm ${isActive("/discover") ? "text-emerald-400" : "text-white"} py-2`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Entdecken
              </Link>
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className={`text-sm ${isActive("/wishlist") ? "text-emerald-400" : "text-white"} py-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Meine Wunschliste
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className={`text-sm ${isActive("/admin") ? "text-emerald-400" : "text-white"} py-2`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin-Bereich
                </Link>
              )}
            </nav>

            <form onSubmit={handleSearch} className="mt-3">
              <GlassContainer className="p-0" intensity="medium">
                <Input
                  type="text"
                  placeholder="Spiele suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 text-white pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
              </GlassContainer>
            </form>

            <div className="mt-3">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:text-red-400 hover:bg-transparent w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </Button>
              ) : (
                <Link href="/login" className="w-full block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-emerald-400 hover:bg-transparent w-full justify-start"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Admin-Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
