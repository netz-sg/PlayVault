import type { User, AppSettings, Game } from "./types"

// Constants for localStorage keys that are still needed
const STORAGE_KEYS = {
  AUTH_TOKEN: "game-library-auth-token",
  BACKUP: "game-library-backup",
  LAST_BACKUP: "game-library-last-backup",
}

// User functions
export const saveUser = async (user: User): Promise<void> => {
  try {
    await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save-user',
        user
      }),
    })
  } catch (error) {
    console.error("Error saving user:", error)
    throw error
  }
}

export const getUser = async (username: string): Promise<User | null> => {
  try {
    const response = await fetch(`/api/storage/user?username=${encodeURIComponent(username)}`)
    
    if (!response.ok) return null
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching user:", error)
    return null
  }
}

// App settings functions
export const saveSettings = async (settings: AppSettings): Promise<void> => {
  try {
    await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save-settings',
        settings
      }),
    })
  } catch (error) {
    console.error("Error saving settings:", error)
    throw error
  }
}

export const getSettings = async (): Promise<AppSettings | null> => {
  try {
    const response = await fetch('/api/storage/settings')
    if (!response.ok) return null
    return await response.json()
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

// Game functions with API
export const saveGame = async (game: Game): Promise<void> => {
  try {
    await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save-game',
        game
      }),
    })
  } catch (error) {
    console.error("Failed to save game:", error)
    throw error
  }
}

export const getGame = async (id: string): Promise<Game | null> => {
  try {
    const response = await fetch(`/api/storage/games/${id}`)
    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error("Failed to get game:", error)
    return null
  }
}

export const getAllGames = async (): Promise<Game[]> => {
  try {
    const response = await fetch('/api/storage/games')
    if (!response.ok) return []
    return await response.json()
  } catch (error) {
    console.error("Failed to get games:", error)
    return []
  }
}

export const deleteGame = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/storage/games/${id}`, {
      method: 'DELETE',
    })
  } catch (error) {
    console.error("Failed to delete game:", error)
    throw error
  }
}

// Helper function to check if setup is completed
export const isSetupCompleted = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/storage/setup-status')
    if (!response.ok) return false
    const data = await response.json()
    return data.setupCompleted || false
  } catch (error) {
    console.error("Error checking setup status:", error)
    return false
  }
}

// Function to create a backup
export const createBackup = async (): Promise<void> => {
  try {
    // Hole die Spiele direkt aus der getAllGames-Funktion
    const games = await getAllGames();
    
    // Setze das lokale Backup-Datum
    const now = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(games));
    localStorage.setItem(STORAGE_KEYS.LAST_BACKUP, now);
    
    // Für die Datenbank ein Backup-Datum setzen
    await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'save-settings',
        settings: {
          lastAutoBackup: now
        }
      }),
    });
  } catch (error) {
    console.error("Failed to create backup:", error)
    throw error
  }
}

// Function to restore from backup
export const restoreFromBackup = async (backupData?: Game[]): Promise<{ gamesRestored: number }> => {
  try {
    if (backupData) {
      // Stelle aus übergebenem Backup wieder her
      const response = await fetch('/api/storage/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData)
      })
      
      if (!response.ok) {
        throw new Error("Failed to restore backup from provided data")
      }
      
      const result = await response.json()
      return { gamesRestored: backupData.length }
    } else {
      // Versuche aus dem localStorage wiederherzustellen (Legacy-Methode)
      const backupJson = localStorage.getItem(STORAGE_KEYS.BACKUP)

      if (!backupJson) {
        throw new Error("No backup found")
      }

      // Parse the backup
      const games = JSON.parse(backupJson) as Game[]

      // Verwende die API, um das Backup wiederherzustellen
      const response = await fetch('/api/storage/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(games)
      })
      
      if (!response.ok) {
        throw new Error("Failed to restore backup")
      }
      
      return { gamesRestored: games.length }
    }
  } catch (error) {
    console.error("Failed to restore from backup:", error)
    throw error
  }
}

// Function to download backup
export const downloadBackup = async (): Promise<void> => {
  try {
    // Direkter Link zur API-Route
    const link = document.createElement('a');
    link.href = '/api/storage/backup';
    link.setAttribute('download', `game-library-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Failed to download backup:", error)
    throw error
  }
}

// Function to upload backup
export const uploadBackup = async (file: File): Promise<{ gamesRestored: number }> => {
  try {
    // Lese die Datei
    const fileContent = await file.text()
    const backupData = JSON.parse(fileContent) as Game[]
    
    // Stelle das Backup wieder her
    return await restoreFromBackup(backupData)
  } catch (error) {
    console.error("Failed to upload backup:", error)
    throw error
  }
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

// Import and re-export getPopularGames from rawg-api for backward compatibility
export const getPopularGames = async () => {
  const { getPopularGames: fetchPopularGames } = await import('./rawg-api')
  return fetchPopularGames()
} 