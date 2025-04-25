"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  initialRating?: number
  onChange?: (rating: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function RatingStars({
  initialRating = 0,
  onChange,
  readOnly = false,
  size = "md",
  className,
}: RatingStarsProps) {
  const [rating, setRating] = useState<number>(initialRating)
  const [hoverRating, setHoverRating] = useState<number>(0)

  const handleClick = (selectedRating: number) => {
    if (readOnly) return

    // Wenn der Benutzer auf den aktuell ausgewählten Stern klickt, setze die Bewertung zurück
    const newRating = rating === selectedRating ? 0 : selectedRating
    setRating(newRating)
    onChange?.(newRating)
  }

  const handleMouseEnter = (hoveredRating: number) => {
    if (readOnly) return
    setHoverRating(hoveredRating)
  }

  const handleMouseLeave = () => {
    if (readOnly) return
    setHoverRating(0)
  }

  // Größe der Sterne basierend auf der size-Prop
  const starSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return (
    <div className={cn("flex items-center", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize[size],
            "cursor-pointer transition-all duration-150",
            star <= (hoverRating || rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-400",
            readOnly ? "cursor-default" : "hover:scale-110",
          )}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  )
}
