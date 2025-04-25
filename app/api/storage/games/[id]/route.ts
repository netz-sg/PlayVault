import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  try {
    const game = await prisma.game.findUnique({
      where: { id },
      include: {
        genres: true,
        platforms: true,
        tags: true,
        playSessions: true
      }
    })
    
    if (!game) {
      return NextResponse.json(null, { status: 404 })
    }
    
    // Format the game for response
    const formattedGame = {
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
    }
    
    return NextResponse.json(formattedGame)
  } catch (error) {
    console.error(`Error fetching game ${id}:`, error)
    return NextResponse.json(null, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  
  try {
    await prisma.game.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting game:', error)
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 })
  }
} 