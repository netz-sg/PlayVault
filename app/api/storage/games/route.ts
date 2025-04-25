import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      include: {
        genres: true,
        platforms: true,
        tags: true,
        playSessions: true
      }
    })
    
    const formattedGames = games.map(game => ({
      id: game.id,
      name: game.name,
      background_image: game.backgroundImage || undefined,
      description: game.description || undefined,
      released: game.released || undefined,
      metacritic: game.metacritic || undefined,
      genres: game.genres.map(g => ({ id: g.id, name: g.name })),
      platforms: game.platforms.map(p => ({ platform: { id: p.id, name: p.name } })),
      rating: game.rating || undefined,
      ratings_count: game.ratingsCount || undefined,
      status: game.status as "Completed" | "In Progress" | "On Hold" | "Not Started" | undefined,
      userRating: game.userRating || undefined,
      userNotes: game.userNotes || undefined,
      solutions: game.solutions || undefined,
      favorite: game.favorite,
      addedDate: game.addedDate.toISOString(),
      lastModified: game.lastModified.toISOString(),
      isCustom: game.isCustom,
      playTime: game.playTime || undefined,
      completionPercentage: game.completionPercentage || undefined,
      wishlist: game.wishlist,
      tags: game.tags.map(t => t.name),
      playHistory: game.playSessions.map(s => ({
        date: s.date.toISOString(),
        duration: s.duration,
        note: s.note || undefined
      }))
    }))
    
    return NextResponse.json(formattedGames)
  } catch (error) {
    console.error('Error fetching games:', error)
    return NextResponse.json([], { status: 500 })
  }
} 