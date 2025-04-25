"use client"

import { useState, useEffect } from "react"
import { getAllGames } from "@/lib/client-storage"
import { getGameDetails } from "@/lib/rawg-api"
import { getHighResImageUrl } from "@/lib/rawg-api"
import { motion } from "framer-motion"
import { GlassContainer } from "@/components/ui/glass-container"
import { Button } from "@/components/ui/button"
import { Trophy, Star, Clock, ArrowRight, Gamepad2 } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import type { Game } from "@/lib/types"

export function FeaturedGameHero() {
  const [featuredGame, setFeaturedGame] = useState<Game | null>(null)
  const [highResImage, setHighResImage] = useState<string | null>(null)
  const [fallbackImage, setFallbackImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Fetch additional game details for better images
  const fetchAdditionalDetails = async (gameId: string) => {
    try {
      // Use numerical ID for RAWG API
      const numId = parseInt(gameId);
      if (!isNaN(numId)) {
        const details = await getGameDetails(numId);
        if (details.background_image) {
          // Try to get a higher resolution image
          setHighResImage(getHighResImageUrl(details.background_image));
          
          // Also store the original as fallback
          setFallbackImage(details.background_image);
        }
        // We could also get screenshots for additional images if needed
      }
    } catch (error) {
      console.error("Error fetching additional game details:", error);
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      setIsLoading(true);
      try {
        const allGames = await getAllGames();
        // Filter games with background images and that are not on wishlist
        const gamesWithImages = allGames.filter(
          game => game.background_image && !game.wishlist
        );
        
        if (gamesWithImages.length > 0) {
          // Pick a random game
          const randomIndex = Math.floor(Math.random() * gamesWithImages.length);
          const selectedGame = gamesWithImages[randomIndex];
          setFeaturedGame(selectedGame);
          
          // Fetch additional details for better images
          await fetchAdditionalDetails(selectedGame.id);
        }
      } catch (error) {
        console.error("Error fetching featured game:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  // Handle image loading errors
  const handleImageError = () => {
    if (highResImage && fallbackImage) {
      // If high-res image fails, fall back to original
      setHighResImage(fallbackImage);
    }
    setImageLoaded(true);
  };

  // When the high-res image loads successfully
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (isLoading) {
    return (
      <GlassContainer className="p-0 overflow-hidden h-96 relative mb-8" intensity="medium">
        <div className="h-full w-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            <Gamepad2 className="h-12 w-12 text-emerald-400 animate-pulse mb-4" />
            <div className="text-white">Lade Featured Game...</div>
          </div>
        </div>
      </GlassContainer>
    );
  }

  if (!featuredGame) {
    return null;
  }

  // Use the high-res image if available, otherwise use the original
  const imageUrl = highResImage || featuredGame.background_image;

  return (
    <GlassContainer 
      className="p-0 overflow-hidden h-96 relative mb-8" 
      intensity="high" 
      border={true}
      glow={true}
    >
      {/* Background overlay with parallax effect */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: imageLoaded ? 1 : 0, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background image with blur effect for depth */}
          <div 
            className="absolute inset-0 bg-cover bg-center transform scale-110"
            style={{ 
              backgroundImage: `url(${imageUrl})`,
              filter: "brightness(0.3) blur(8px)"
            }}
          ></div>
        </motion.div>
      </div>
      
      {/* Main sharp image */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: imageLoaded ? 1 : 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none"
      >
        <img 
          src={imageUrl} 
          alt={featuredGame.name}
          className="object-contain max-h-full rounded-lg shadow-2xl shadow-emerald-500/10"
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: 'none' }} // Hidden image just for preloading
        />
        
        {/* Visible image with styling */}
        <div
          className="w-full h-full max-w-3xl rounded-lg overflow-hidden bg-cover bg-center shadow-2xl shadow-emerald-500/20"
          style={{ 
            backgroundImage: `url(${imageUrl})`,
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease'
          }}
        ></div>
      </motion.div>
      
      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      {/* Game info */}
      <div className="relative h-full container mx-auto flex flex-col justify-end p-8">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl"
        >
          <div className="mb-3 flex items-center flex-wrap gap-2">
            {featuredGame.favorite && (
              <span className="bg-yellow-500/20 text-yellow-400 rounded-full px-3 py-1 text-xs font-medium flex items-center">
                <Trophy className="w-3 h-3 mr-1" />
                Favorisiertes Spiel
              </span>
            )}
            <span className="bg-emerald-500/20 text-emerald-400 rounded-full px-3 py-1 text-xs font-medium">
              {featuredGame.status || "Nicht begonnen"}
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 text-shadow">
            {featuredGame.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 mb-5">
            {featuredGame.rating && (
              <div className="flex items-center text-white">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                <span className="font-semibold">{featuredGame.rating.toFixed(1)}</span>
              </div>
            )}
            
            {featuredGame.genres && featuredGame.genres.length > 0 && (
              <div className="text-white/80">
                {featuredGame.genres.map(genre => genre.name).slice(0, 3).join(" • ")}
              </div>
            )}
            
            {featuredGame.released && (
              <div className="text-white/80">
                {new Date(featuredGame.released).getFullYear()}
              </div>
            )}
            
            {featuredGame.playTime && featuredGame.playTime > 0 && (
              <div className="flex items-center text-white/80">
                <Clock className="w-4 h-4 mr-1" />
                <span>{Math.round(featuredGame.playTime / 60)} Stunden</span>
              </div>
            )}
          </div>
          
          <Link href={`/game/${featuredGame.id}`} passHref>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full px-6">
              Details anzeigen
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        .text-shadow {
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </GlassContainer>
  )
} 