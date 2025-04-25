import { getAllGames, saveGame, getSettings } from "./client-storage"
import { prisma } from './prisma'
import type { Game } from "./types"

// Constants for localStorage keys that are still needed
const STORAGE_KEYS = {
  BACKUP: "game-library-backup",
  LAST_BACKUP: "game-library-last-backup",
}

// Function to get storage statistics
export const getStorageStats = async (): Promise<{
  usedSpace: number
  totalGames: number
  lastBackup: string | null
  lastModified: string | null
}> => {
  try {
    // Get all games
    const games = await getAllGames()

    // Calculate the size of the games
    const gamesJson = JSON.stringify(games)
    const gamesSize = new Blob([gamesJson]).size

    // Get the settings
    const settings = await getSettings()
    const settingsJson = JSON.stringify(settings)
    const settingsSize = new Blob([settingsJson]).size

    // Get the last backup date
    const lastBackup = localStorage.getItem(STORAGE_KEYS.LAST_BACKUP)

    // Find the last modified game
    let lastModified = null
    if (games.length > 0) {
      const lastModifiedGame = [...games].sort((a, b) => {
        return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      })[0]

      lastModified = lastModifiedGame.lastModified
    }

    return {
      usedSpace: gamesSize + settingsSize,
      totalGames: games.length,
      lastBackup,
      lastModified,
    }
  } catch (error) {
    console.error("Failed to get storage stats:", error)
    throw error
  }
}

// Function to export all data
export const exportData = async (): Promise<void> => {
  try {
    // Get all games
    const games = await getAllGames()

    // Get the settings
    const settings = await getSettings()

    // Create an export object
    const exportData = {
      games,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    // Convert to JSON
    const exportJson = JSON.stringify(exportData, null, 2)

    // Create a blob and a download link
    const blob = new Blob([exportJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    // Create a download link and click it
    const a = document.createElement("a")
    a.href = url
    a.download = `game-library-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()

    // Clean up
    URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error("Failed to export data:", error)
    throw error
  }
}

// Function to import data
export const importData = async (file: File): Promise<{ gamesImported: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        // Validate the import data
        if (!importData.games || !Array.isArray(importData.games)) {
          throw new Error("Invalid import data: games array missing")
        }

        // Import the games
        const games = importData.games as Game[]

        // Save each game
        for (const game of games) {
          await saveGame(game)
        }

        resolve({ gamesImported: games.length })
      } catch (error) {
        console.error("Failed to import data:", error)
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Failed to read file"))
    }

    reader.readAsText(file)
  })
}

// Function to create a backup
export const createBackup = async (): Promise<void> => {
  try {
    // Get all games
    const games = await getAllGames()

    // Save the backup to localStorage
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(games))

    // Save the backup date
    const now = new Date().toISOString()
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, now)
  } catch (error) {
    console.error("Failed to create backup:", error)
    throw error
  }
}

// Function to restore from backup
export const restoreFromBackup = async (): Promise<{ gamesRestored: number }> => {
  try {
    // Get the backup
    const backupJson = localStorage.getItem(STORAGE_KEYS.BACKUP)

    if (!backupJson) {
      throw new Error("No backup found")
    }

    // Parse the backup
    const games = JSON.parse(backupJson) as Game[]

    // Save each game
    for (const game of games) {
      await saveGame(game)
    }

    return { gamesRestored: games.length }
  } catch (error) {
    console.error("Failed to restore from backup:", error)
    throw error
  }
}

// Function to compress images
export const compressImage = async (imageDataUrl: string, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Calculate the new size
      let width = img.width
      let height = img.height

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      // Create a canvas and draw the image
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Failed to get canvas context"))
        return
      }

      ctx.drawImage(img, 0, 0, width, height)

      // Convert to DataURL
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
      resolve(compressedDataUrl)
    }

    img.onerror = () => {
      reject(new Error("Failed to load image"))
    }

    img.src = imageDataUrl
  })
}
