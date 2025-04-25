import { prisma } from './prisma'
import type { User, AppSettings, Game } from "./types"
import { Prisma } from './generated/prisma'

// Constants for localStorage keys that are still needed
const STORAGE_KEYS = {
  AUTH_TOKEN: "game-library-auth-token",
}

// User functions
export const saveUser = async (user: User): Promise<void> => {
  await prisma.user.upsert({
    where: { username: user.username },
    update: {
      password: user.password,
      isAdmin: user.isAdmin
    },
    create: {
      username: user.username,
      password: user.password,
      isAdmin: user.isAdmin
    }
  })
}

export const getUser = async (username: string): Promise<User | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { username }
    })
    return user
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

// App settings functions
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  await prisma.appSettings.upsert({
    where: { id: 'default' },
    update: {
      libraryName: settings.libraryName,
      setupCompleted: settings.setupCompleted,
      theme: settings.theme,
      language: settings.language,
      autoBackup: settings.autoBackup || false,
      lastAutoBackup: settings.lastAutoBackup ? new Date(settings.lastAutoBackup) : null
    },
    create: {
      libraryName: settings.libraryName,
      setupCompleted: settings.setupCompleted,
      theme: settings.theme,
      language: settings.language,
      autoBackup: settings.autoBackup || false,
      lastAutoBackup: settings.lastAutoBackup ? new Date(settings.lastAutoBackup) : null
    }
  })
}

export const getSettings = async (): Promise<AppSettings | null> => {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'default' }
    })
    
    if (!settings) return null
    
    return {
      libraryName: settings.libraryName,
      setupCompleted: settings.setupCompleted,
      theme: settings.theme as "dark" | "light" | "system" | undefined,
      language: settings.language || undefined,
      autoBackup: settings.autoBackup,
      lastAutoBackup: settings.lastAutoBackup?.toISOString()
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

// Authentication functions (still using localStorage for tokens)
export const saveAuthToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token)
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)
}

export const clearAuthToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN)
}

// Game functions with Prisma
export const saveGame = async (game: Game): Promise<void> => {
  try {
    // Ensure that all required fields are present
    if (!game.id || !game.name) {
      throw new Error("Game ID and name are required")
    }

    // Create a Prisma-compatible game object
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

    // Upsert the game (create if not exists, update if exists)
    await prisma.game.upsert({
      where: { id: game.id },
      update: prismaGame,
      create: prismaGame
    })

    // Handle genres
    if (game.genres && game.genres.length > 0) {
      // Delete existing genres for this game first
      await prisma.$executeRaw`DELETE FROM _GameToGenre WHERE \`A\` = ${game.id}`
      
      // Add genres
      for (const genre of game.genres) {
        // Create genre if it doesn't exist
        await prisma.genre.upsert({
          where: { id: genre.id },
          update: { name: genre.name },
          create: { id: genre.id, name: genre.name }
        })
        
        // Connect genre to game
        await prisma.$executeRaw`INSERT INTO _GameToGenre (\`A\`, \`B\`) VALUES (${game.id}, ${genre.id})`
      }
    }

    // Handle platforms
    if (game.platforms && game.platforms.length > 0) {
      // Delete existing platforms for this game first
      await prisma.$executeRaw`DELETE FROM _GameToPlatform WHERE \`A\` = ${game.id}`
      
      // Add platforms
      for (const platformObj of game.platforms) {
        const platform = platformObj.platform
        // Create platform if it doesn't exist
        await prisma.platform.upsert({
          where: { id: platform.id },
          update: { name: platform.name },
          create: { id: platform.id, name: platform.name }
        })
        
        // Connect platform to game
        await prisma.$executeRaw`INSERT INTO _GameToPlatform (\`A\`, \`B\`) VALUES (${game.id}, ${platform.id})`
      }
    }

  } catch (error) {
    console.error("Failed to save game:", error)
    throw error
  }
}

export const getGame = async (id: string): Promise<Game | null> => {
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

    if (!game) return null
    
    // Convert Prisma model to Game type
    return {
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
  } catch (error) {
    console.error("Failed to get game:", error)
    return null
  }
}

export const getAllGames = async (): Promise<Game[]> => {
  try {
    const games = await prisma.game.findMany({
      include: {
        genres: true,
        platforms: true,
        tags: true,
        playSessions: true
      }
    })
    
    return games.map(game => ({
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
  } catch (error) {
    console.error("Failed to get games:", error)
    return []
  }
}

export const deleteGame = async (id: string): Promise<void> => {
  try {
    await prisma.game.delete({
      where: { id }
    })
  } catch (error) {
    console.error("Failed to delete game:", error)
    throw error
  }
}

// Helper function to check if setup is completed
export const isSetupCompleted = async (): Promise<boolean> => {
  try {
    const settings = await getSettings()
    return settings?.setupCompleted || false
  } catch (error) {
    return false
  }
}

// The isAuthenticated function was moved to lib/auth.ts
