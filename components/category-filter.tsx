"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getGenres, getPlatforms, type Genre, type Platform } from "@/lib/rawg-api"
import { GlassContainer } from "@/components/ui/glass-container"

export function CategoryFilter() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [selectedGenres, setSelectedGenres] = useState<number[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([])
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const genresData = await getGenres()
        const platformsData = await getPlatforms()
        setGenres(genresData.results.slice(0, 10)) // Limit to top 10 genres
        setPlatforms(platformsData.results.slice(0, 10)) // Limit to top 10 platforms
      } catch (error) {
        console.error("Failed to fetch filters:", error)
      }
    }

    fetchFilters()
  }, [])

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres((prev) => (prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]))
  }

  const handlePlatformToggle = (platformId: number) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((id) => id !== platformId) : [...prev, platformId],
    )
  }

  return (
    <GlassContainer className="p-6 mb-8" intensity="medium">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="bg-black/40 backdrop-blur-sm border border-white/20 w-full sm:w-auto grid grid-cols-4 sm:flex p-1">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
            >
              In Progress
            </TabsTrigger>
            <TabsTrigger
              value="backlog"
              className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
            >
              Backlog
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2 w-full sm:w-auto">
          <GlassContainer className="p-0" intensity="medium">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="bg-transparent text-white h-10 border-0 font-medium">
                  Genres
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800/95 backdrop-blur-md border-white/20">
                {genres.map((genre) => (
                  <DropdownMenuCheckboxItem
                    key={genre.id}
                    checked={selectedGenres.includes(genre.id)}
                    onCheckedChange={() => handleGenreToggle(genre.id)}
                    className="text-white hover:bg-white/15"
                  >
                    {genre.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </GlassContainer>

          <GlassContainer className="p-0" intensity="medium">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="bg-transparent text-white h-10 border-0">
                  Platforms
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-slate-800/90 backdrop-blur-md border-white/10">
                {platforms.map((platform) => (
                  <DropdownMenuCheckboxItem
                    key={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                    className="text-white hover:bg-white/10"
                  >
                    {platform.name}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </GlassContainer>
        </div>
      </div>

      {(selectedGenres.length > 0 || selectedPlatforms.length > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedGenres.map((genreId) => {
            const genre = genres.find((g) => g.id === genreId)
            return genre ? (
              <Button
                key={`genre-${genreId}`}
                variant="secondary"
                size="sm"
                className="bg-white/15 text-xs hover:bg-white/25 border border-white/20 text-white font-medium"
                onClick={() => handleGenreToggle(genreId)}
              >
                {genre.name}
                <Check className="ml-1 h-3 w-3" />
              </Button>
            ) : null
          })}
          {selectedPlatforms.map((platformId) => {
            const platform = platforms.find((p) => p.id === platformId)
            return platform ? (
              <Button
                key={`platform-${platformId}`}
                variant="secondary"
                size="sm"
                className="bg-white/15 text-xs hover:bg-white/25 border border-white/20 text-white font-medium"
                onClick={() => handlePlatformToggle(platformId)}
              >
                {platform.name}
                <Check className="ml-1 h-3 w-3" />
              </Button>
            ) : null
          })}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-white hover:bg-white/15 font-medium"
            onClick={() => {
              setSelectedGenres([])
              setSelectedPlatforms([])
            }}
          >
            Clear all
          </Button>
        </div>
      )}
    </GlassContainer>
  )
}
