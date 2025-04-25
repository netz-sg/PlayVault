import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Game, User, AppSettings } from '@/lib/types'

// GET /api/storage/setup-status
export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname.split('/').pop()

  if (path === 'setup-status') {
    try {
      const settings = await prisma.appSettings.findUnique({
        where: { id: 'default' }
      })
      return NextResponse.json({ 
        setupCompleted: settings?.setupCompleted || false 
      })
    } catch (error) {
      console.error('Error fetching setup status:', error)
      return NextResponse.json({ setupCompleted: false }, { status: 500 })
    }
  }

  if (path === 'settings') {
    try {
      const settings = await prisma.appSettings.findUnique({
        where: { id: 'default' }
      })
      
      if (!settings) {
        return NextResponse.json(null)
      }
      
      return NextResponse.json({
        libraryName: settings.libraryName,
        setupCompleted: settings.setupCompleted,
        theme: settings.theme,
        language: settings.language,
        autoBackup: settings.autoBackup,
        lastAutoBackup: settings.lastAutoBackup?.toISOString()
      })
    } catch (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json(null, { status: 500 })
    }
  }

  if (path === 'games') {
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

  // GET /api/storage/user?username=xxx
  if (path === 'user') {
    const username = url.searchParams.get('username')
    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }
    
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      })
      return NextResponse.json(user)
    } catch (error) {
      console.error('Error fetching user:', error)
      return NextResponse.json(null, { status: 500 })
    }
  }

  // Check if it's a game request like /api/storage/games/123
  const pathSegments = url.pathname.split('/')
  if (pathSegments.length >= 4 && pathSegments[2] === 'games') {
    const gameId = pathSegments[3]
    
    try {
      const game = await prisma.game.findUnique({
        where: { id: gameId },
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
      console.error(`Error fetching game ${gameId}:`, error)
      return NextResponse.json(null, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
}

// POST /api/storage
export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 })
  }

  const data = await request.json()
  const { action } = data

  if (action === 'save-user') {
    const { username, password, isAdmin } = data.user
    try {
      const user = await prisma.user.upsert({
        where: { username },
        update: {
          password,
          isAdmin
        },
        create: {
          username,
          password,
          isAdmin
        }
      })
      return NextResponse.json(user)
    } catch (error) {
      console.error('Error saving user:', error)
      return NextResponse.json({ error: 'Failed to save user' }, { status: 500 })
    }
  }

  if (action === 'save-settings') {
    const { libraryName, setupCompleted, theme, language, autoBackup, lastAutoBackup } = data.settings
    try {
      const settings = await prisma.appSettings.upsert({
        where: { id: 'default' },
        update: {
          libraryName,
          setupCompleted,
          theme,
          language,
          autoBackup: autoBackup || false,
          lastAutoBackup: lastAutoBackup ? new Date(lastAutoBackup) : null
        },
        create: {
          libraryName,
          setupCompleted,
          theme,
          language,
          autoBackup: autoBackup || false,
          lastAutoBackup: lastAutoBackup ? new Date(lastAutoBackup) : null
        }
      })
      return NextResponse.json(settings)
    } catch (error) {
      console.error('Error saving settings:', error)
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
  }

  if (action === 'save-game') {
    const { game } = data
    try {
      // Prepare game data for Prisma
      const prismaGame = {
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
        lastModified: new Date(game.lastModified || new Date().toISOString()),
        isCustom: game.isCustom || false,
        playTime: game.playTime || null,
        completionPercentage: game.completionPercentage || null,
        wishlist: game.wishlist || false,
      }

      // Upsert the game
      const savedGame = await prisma.game.upsert({
        where: { id: game.id },
        update: prismaGame,
        create: prismaGame
      })

      // Handle genres if they exist
      if (game.genres && game.genres.length > 0) {
        // Delete existing genre connections
        await prisma.$executeRaw`DELETE FROM _GameToGenre WHERE \`A\` = ${game.id}`
        
        // Add genres
        for (const genre of game.genres) {
          // Create or update genre
          await prisma.genre.upsert({
            where: { id: genre.id },
            update: { name: genre.name },
            create: { id: genre.id, name: genre.name }
          })
          
          // Connect genre to game
          await prisma.$executeRaw`INSERT INTO _GameToGenre (\`A\`, \`B\`) VALUES (${game.id}, ${genre.id})`
        }
      }

      // Handle platforms if they exist
      if (game.platforms && game.platforms.length > 0) {
        // Delete existing platform connections
        await prisma.$executeRaw`DELETE FROM _GameToPlatform WHERE \`A\` = ${game.id}`
        
        // Add platforms
        for (const platformObj of game.platforms) {
          const platform = platformObj.platform
          // Create or update platform
          await prisma.platform.upsert({
            where: { id: platform.id },
            update: { name: platform.name },
            create: { id: platform.id, name: platform.name }
          })
          
          // Connect platform to game
          await prisma.$executeRaw`INSERT INTO _GameToPlatform (\`A\`, \`B\`) VALUES (${game.id}, ${platform.id})`
        }
      }

      return NextResponse.json(savedGame)
    } catch (error) {
      console.error('Error saving game:', error)
      return NextResponse.json({ error: 'Failed to save game' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

// DELETE /api/storage/games/:id
export async function DELETE(request: Request) {
  const url = new URL(request.url)
  const path = url.pathname
  
  if (path.includes('/games/')) {
    const id = path.split('/').pop()
    if (!id) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

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

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
} 