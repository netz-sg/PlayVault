"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X, Loader2 } from "lucide-react"
import Link from "next/link"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GlassContainer } from "@/components/ui/glass-container"
import { searchGames, type Game } from "@/lib/rawg-api"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 3) {
        setLoading(true)
        try {
          const data = await searchGames(query)
          setResults(data.results.slice(0, 5))
          setShowResults(true)
        } catch (error) {
          console.error("Search error:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.length >= 3) {
      // In a real app, this would navigate to search results page
      console.log("Searching for:", query)
    }
  }

  return (
    <div className="relative w-full sm:w-64 md:w-80" ref={searchRef}>
      <form onSubmit={handleSearch} className="relative">
        <GlassContainer
          className={`p-0 overflow-hidden transition-all duration-300 ${isFocused ? "shadow-[0_0_20px_rgba(74,222,128,0.2)]" : "shadow-none"}`}
          intensity="medium"
        >
          <div className="relative">
            <Input
              type="text"
              placeholder="Search games..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="w-full pl-10 bg-transparent text-white border-0 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0 h-10"
            />
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${isFocused ? "text-emerald-400" : "text-white"}`}
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-white hover:text-white hover:bg-transparent"
                onClick={() => setQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </GlassContainer>
      </form>

      {showResults && (
        <div className="absolute z-50 mt-2 w-full max-h-[400px] overflow-hidden">
          <GlassContainer className="w-full" intensity="high" textContrast="high">
            {loading ? (
              <div className="p-6 text-center text-white flex items-center justify-center">
                <Loader2 className="h-5 w-5 mr-2 animate-spin text-emerald-400" />
                Searching...
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-[400px] overflow-auto">
                {results.map((game) => (
                  <Link
                    key={game.id}
                    href={`/game/${game.id}`}
                    className="flex items-center gap-3 p-3 hover:bg-white/15 transition-colors"
                    onClick={() => setShowResults(false)}
                  >
                    <div className="w-12 h-12 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden border border-white/20">
                      {game.background_image && (
                        <img
                          src={game.background_image || "/placeholder.svg"}
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">{game.name}</p>
                      <p className="text-xs text-white truncate">
                        {game.released ? new Date(game.released).getFullYear() : "Unknown"} •{" "}
                        {game.genres?.map((g) => g.name).join(", ") || "Unknown genre"}
                      </p>
                    </div>
                  </Link>
                ))}
                <div className="p-2 border-t border-white/20">
                  <Link
                    href={`/discover?search=${encodeURIComponent(query)}`}
                    className="block text-center text-sm text-emerald-400 hover:text-emerald-300 p-2 transition-colors font-medium"
                    onClick={() => setShowResults(false)}
                  >
                    View all results
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-white">No games found</div>
            )}
          </GlassContainer>
        </div>
      )}
    </div>
  )
}
