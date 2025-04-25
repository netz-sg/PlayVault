import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Game } from '@/lib/types'

// GET /api/storage/backup - Lädt alle Spiele als Backup-Datei herunter
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
      status: game.status as any,
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
    
    // Backup-Datum setzen
    const now = new Date()
    await prisma.appSettings.update({
      where: { id: 'default' },
      data: { lastAutoBackup: now }
    })
    
    // Dateiname für das Backup
    const fileName = `game-library-backup-${now.toISOString().split('T')[0]}.json`
    
    // Den Content-Disposition Header anpassen, um sicherzustellen, dass der Browser die Datei herunterlädt
    return new NextResponse(JSON.stringify(formattedGames, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error creating backup:', error)
    return NextResponse.json({ error: 'Failed to create backup' }, { status: 500 })
  }
}

// POST /api/storage/backup - Lädt ein Backup hoch und stellt es wieder her
export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }

  try {
    const backup = await request.json() as Game[]
    
    if (!Array.isArray(backup)) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 })
    }
    
    // Bevor wir das Backup wiederherstellen, sichern wir den aktuellen Zustand
    const currentGames = await prisma.game.findMany()
    
    // Lösche alle aktuellen Spiele (inklusive Relationen durch Cascade-Delete)
    for (const game of currentGames) {
      await prisma.game.delete({
        where: { id: game.id }
      })
    }
    
    // Wiederherstellen der Spiele aus dem Backup
    let restoredCount = 0
    
    for (const game of backup) {
      // Erstelle das Spiel mit seinen Haupteigenschaften
      await prisma.game.create({
        data: {
          id: game.id,
          name: game.name,
          backgroundImage: game.background_image || null,
          description: game.description || null,
          released: game.released || null,
          metacritic: game.metacritic || null,
          rating: game.rating || null,
          ratingsCount: game.ratings_count || null,
          status: game.status || "Not Started",
          userRating: game.userRating || null,
          userNotes: game.userNotes || null,
          solutions: game.solutions || null,
          favorite: game.favorite || false,
          addedDate: new Date(game.addedDate),
          lastModified: new Date(game.lastModified),
          isCustom: game.isCustom || false,
          playTime: game.playTime || null,
          completionPercentage: game.completionPercentage || null,
          wishlist: game.wishlist || false,
          // Beziehungen werden separat angelegt
        }
      })
      
      // Füge Genres hinzu (wenn vorhanden)
      if (game.genres && game.genres.length > 0) {
        for (const genre of game.genres) {
          // Prüfe, ob das Genre bereits existiert
          const existingGenre = await prisma.genre.findUnique({
            where: { id: genre.id }
          })
          
          if (!existingGenre) {
            await prisma.genre.create({
              data: {
                id: genre.id,
                name: genre.name,
                games: {
                  connect: { id: game.id }
                }
              }
            })
          } else {
            // Verbinde das bestehende Genre mit dem Spiel
            await prisma.genre.update({
              where: { id: genre.id },
              data: {
                games: {
                  connect: { id: game.id }
                }
              }
            })
          }
        }
      }
      
      // Füge Plattformen hinzu (wenn vorhanden)
      if (game.platforms && game.platforms.length > 0) {
        for (const platform of game.platforms) {
          // Prüfe, ob die Plattform bereits existiert
          const existingPlatform = await prisma.platform.findUnique({
            where: { id: platform.platform.id }
          })
          
          if (!existingPlatform) {
            await prisma.platform.create({
              data: {
                id: platform.platform.id,
                name: platform.platform.name,
                games: {
                  connect: { id: game.id }
                }
              }
            })
          } else {
            // Verbinde die bestehende Plattform mit dem Spiel
            await prisma.platform.update({
              where: { id: platform.platform.id },
              data: {
                games: {
                  connect: { id: game.id }
                }
              }
            })
          }
        }
      }
      
      // Füge Tags hinzu (wenn vorhanden)
      if (game.tags && game.tags.length > 0) {
        for (const tagName of game.tags) {
          // Suche nach einem Tag mit diesem Namen
          const existingTag = await prisma.tag.findFirst({
            where: { name: tagName }
          })
          
          if (!existingTag) {
            // Erstelle ein neues Tag mit einer zufälligen Farbe
            const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
            const randomColor = colors[Math.floor(Math.random() * colors.length)]
            
            await prisma.tag.create({
              data: {
                name: tagName,
                color: randomColor,
                games: {
                  connect: { id: game.id }
                }
              }
            })
          } else {
            // Verbinde das bestehende Tag mit dem Spiel
            await prisma.tag.update({
              where: { id: existingTag.id },
              data: {
                games: {
                  connect: { id: game.id }
                }
              }
            })
          }
        }
      }
      
      // Füge Spielsitzungen hinzu (wenn vorhanden)
      if (game.playHistory && game.playHistory.length > 0) {
        for (const session of game.playHistory) {
          await prisma.playSession.create({
            data: {
              date: new Date(session.date),
              duration: session.duration,
              note: session.note || null,
              gameId: game.id
            }
          })
        }
      }
      
      restoredCount++;
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Backup erfolgreich wiederhergestellt. ${restoredCount} Spiele wurden importiert.` 
    })
  } catch (error) {
    console.error('Error restoring backup:', error)
    return NextResponse.json({ error: 'Failed to restore backup' }, { status: 500 })
  }
} 