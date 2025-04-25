"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MoreHorizontal, Star, CalendarDays, Award, Heart, BookmarkPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/components/auth-provider"
import { saveGame } from "@/lib/client-storage"
import type { Game } from "@/lib/types"
import { PlatformIcon } from "@/components/platform-icon"

interface GameCardProps {
  game: Game
  onDelete?: (id: string) => void
}

export function GameCard({ game, onDelete }: GameCardProps) {
  const [isFavorite, setIsFavorite] = useState(game.favorite || false)
  const { isAdmin } = useAuth()
  const isWishlist = game.wishlist || false

  // Status color
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Completed":
        return "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium"
      case "In Progress":
        return "bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
      case "On Hold":
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium"
      case "Not Started":
        return "bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium"
      default:
        return "bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium"
    }
  }

  // Handle favorite toggle
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent link navigation
    e.stopPropagation() // Prevent event bubbling
    
    const newFavoriteStatus = !isFavorite
    setIsFavorite(newFavoriteStatus)
    
    try {
      const updatedGame = {
        ...game,
        favorite: newFavoriteStatus,
        lastModified: new Date().toISOString()
      }
      
      await saveGame(updatedGame)
    } catch (error) {
      console.error("Failed to update favorite status:", error)
      setIsFavorite(!newFavoriteStatus) // Revert on error
    }
  }

  return (
    <div className="relative h-full">
      {/* Card Container */}
      <div
        className={`relative h-full rounded-xl overflow-hidden border ${isWishlist ? "border-amber-500/50" : "border-white/20"} shadow-lg bg-black/40 backdrop-blur-sm ${isWishlist ? "ring-2 ring-amber-500/30" : ""}`}
      >
        {/* Background Image */}
        <div className="relative aspect-[3/4] w-full">
          <Image
            src={game.background_image || "/placeholder.svg?height=300&width=400"}
            alt={game.name}
            fill
            className={`object-cover ${isWishlist ? "opacity-70" : ""}`}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

          {/* Wishlist badge */}
          {isWishlist && (
            <div className="absolute top-3 left-3 z-40">
              <Badge className="bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium shadow-lg">
                <BookmarkPlus className="w-3 h-3 mr-1" />
                Wunschliste
              </Badge>
            </div>
          )}

          {/* Status badge */}
          {game.status && !isWishlist && (
            <div className="absolute top-3 left-3 z-30">
              <Badge className={`${getStatusColor(game.status)} shadow-lg`}>{game.status}</Badge>
            </div>
          )}

          {/* Admin actions */}
          {isAdmin && (
            <div className="absolute top-3 right-3 z-30">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-black/50 backdrop-blur-md hover:bg-white/10 text-white border border-white/20 h-8 w-8"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800/95 backdrop-blur-md border-white/20">
                  <DropdownMenuItem className="text-white hover:bg-white/10">
                    <Link href={`/admin/edit/${game.id}`} className="w-full">
                      Bearbeiten
                    </Link>
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem className="text-red-400 hover:bg-red-900/20" onClick={() => onDelete(game.id)}>
                      Löschen
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Metacritic Score */}
          {game.metacritic && (
            <div className="absolute top-14 left-3 z-20 mt-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      className={`bg-black/70 backdrop-blur-md border-2 font-medium ${
                        game.metacritic >= 75
                          ? "border-green-500 text-green-400"
                          : game.metacritic >= 50
                            ? "border-yellow-500 text-yellow-300"
                            : "border-red-500 text-red-400"
                      }`}
                    >
                      <Award className="w-3 h-3 mr-1" />
                      {game.metacritic}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-900/95 backdrop-blur-md border-white/20">
                    <p>Metacritic Score</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}

          {/* Favorite Button (only for admin and non-wishlist games) */}
          {isAdmin && !isWishlist && (
            <div className="absolute top-14 right-3 z-30">
              <Button
                variant="ghost"
                size="icon"
                className={`backdrop-blur-sm hover:bg-white/10 h-8 w-8 text-white border border-white/20 transition-colors duration-300 ${
                  isFavorite ? "bg-rose-500/30 text-rose-400 border-rose-500/50" : "bg-black/50"
                }`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-400" : ""}`} />
              </Button>
            </div>
          )}

          {/* Basic Info - Fixed at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <div className="bg-black/70 backdrop-blur-md rounded-lg p-3 border border-white/10">
              <h3 className="text-lg font-bold text-white line-clamp-1 mb-1">{game.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                {game.platforms?.slice(0, 4).map((p) => (
                  <PlatformIcon key={p.platform.id} platformName={p.platform.name} size={14} />
                ))}
                {game.platforms && game.platforms.length > 4 && (
                  <span className="text-xs text-white/50">+{game.platforms.length - 4}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {!isWishlist && game.userRating ? (
                    <>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm text-white font-medium">
                        {game.userRating} <span className="text-xs text-white/70">(Deine)</span>
                      </span>
                    </>
                  ) : !isWishlist ? (
                    <>
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-sm text-white font-medium">
                        {game.rating ? game.rating.toFixed(1) : "N/A"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 text-white/40 mr-1" />
                      <span className="text-sm text-white/40 font-medium">Noch nicht bewertet</span>
                    </>
                  )}
                </div>
                <div className="flex items-center text-xs text-white">
                  <CalendarDays className="w-3 h-3 mr-1" />
                  {game.released ? new Date(game.released).getFullYear() : "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clickable overlay link */}
        <Link href={`/game/${game.id}`} className="absolute inset-0 z-10 focus-visible:focus-visible">
          <span className="sr-only">View {game.name}</span>
        </Link>
      </div>
    </div>
  )
}
