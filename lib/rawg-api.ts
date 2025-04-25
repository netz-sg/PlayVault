import type { Game as LibraryGame } from "./types"

// RAWG API key
const API_KEY = "4f59d23794ea4959a06939fdcc7ed816"
const BASE_URL = "https://api.rawg.io/api"

export interface RawgGame {
  id: number
  name: string
  background_image: string
  released: string
  metacritic: number
  genres: { id: number; name: string }[]
  platforms: { platform: { id: number; name: string } }[]
  rating: number
  ratings_count: number
  esrb_rating?: { id: number; name: string }
  short_screenshots: { id: number; image: string }[]
  description_raw?: string
  developers?: { id: number; name: string }[]
  publishers?: { id: number; name: string }[]
}

// Function to get high-resolution image URLs
export const getHighResImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return "";
  
  // RAWG images often have a format like:
  // https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg
  // We can get higher resolution by fetching from their crop API:
  // https://media.rawg.io/media/crop/600/400/games/456/456dea5e1c7e3cd07060c14e96612001.jpg
  
  try {
    // Check if it's a RAWG media URL
    if (originalUrl.includes('media.rawg.io')) {
      // Extract the path after /media/
      const mediaPart = originalUrl.split('/media/')[1];
      
      if (mediaPart) {
        // Create high-res URL (1280x720 for hero images)
        return `https://media.rawg.io/media/crop/1280/720/${mediaPart}`;
      }
    }
    
    // If not a RAWG URL or parsing fails, return the original
    return originalUrl;
  } catch (error) {
    console.error("Error processing image URL:", error);
    return originalUrl;
  }
}

export interface SearchResults {
  count: number
  next: string | null
  previous: string | null
  results: RawgGame[]
}

export interface Genre {
  id: number
  name: string
  slug: string
}

export interface Platform {
  id: number
  name: string
  slug: string
}

// Funktion zum Suchen von Spielen
export const searchGames = async (query: string, page = 1): Promise<SearchResults> => {
  const response = await fetch(
    `${BASE_URL}/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=20`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status}`)
  }

  return response.json()
}

// Funktion zum Abrufen von Spieldetails mit vollständiger Beschreibung
export const getGameDetails = async (id: number): Promise<RawgGame> => {
  try {
    const response = await fetch(`${BASE_URL}/games/${id}?key=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`Failed to fetch game details: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching game details:", error)
    throw error
  }
}

// Funktion zum Konvertieren eines RAWG-Spiels in unser Game-Format
export const convertRawgGameToGame = (rawgGame: RawgGame): LibraryGame => {
  // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
  return {
    id: rawgGame.id.toString(),
    name: rawgGame.name,
    background_image: rawgGame.background_image || "",
    description: rawgGame.description_raw || "",
    released: rawgGame.released || "",
    metacritic: rawgGame.metacritic || 0,
    genres: rawgGame.genres || [],
    platforms: rawgGame.platforms || [],
    rating: rawgGame.rating || 0,
    ratings_count: rawgGame.ratings_count || 0,
    status: "Not Started",
    userRating: 0, // Standardmäßig keine Benutzerbewertung
    addedDate: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    isCustom: false,
    userNotes: "",
    solutions: "",
    favorite: false, // Standardmäßig nicht als Favorit markiert
    wishlist: false, // Standardmäßig nicht auf der Wunschliste
  }
}

// Funktion zum Abrufen von Genres
export const getGenres = async (): Promise<{ results: Genre[] }> => {
  const response = await fetch(`${BASE_URL}/genres?key=${API_KEY}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch genres: ${response.status}`)
  }

  return response.json()
}

// Funktion zum Abrufen von Plattformen
export const getPlatforms = async (): Promise<{ results: Platform[] }> => {
  const response = await fetch(`${BASE_URL}/platforms?key=${API_KEY}`)

  if (!response.ok) {
    throw new Error(`Failed to fetch platforms: ${response.status}`)
  }

  return response.json()
}

// Funktion zum Abrufen beliebter Spiele
export const getPopularGames = async (): Promise<{ results: RawgGame[] }> => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, "0")
  const currentDay = String(currentDate.getDate()).padStart(2, "0")

  const startDate = `${currentYear - 1}-${currentMonth}-${currentDay}`
  const endDate = `${currentYear}-${currentMonth}-${currentDay}`

  const response = await fetch(
    `${BASE_URL}/games?key=${API_KEY}&dates=${startDate},${endDate}&ordering=-rating&page_size=10`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch popular games: ${response.status}`)
  }

  return response.json()
}

// Funktion zum Abrufen kürzlich erschienener Spiele
export const getRecentGames = async (): Promise<{ results: RawgGame[] }> => {
  const currentDate = new Date()
  const threeMonthsAgo = new Date(currentDate)
  threeMonthsAgo.setMonth(currentDate.getMonth() - 3)

  const startDate = threeMonthsAgo.toISOString().split("T")[0]
  const endDate = currentDate.toISOString().split("T")[0]

  const response = await fetch(
    `${BASE_URL}/games?key=${API_KEY}&dates=${startDate},${endDate}&ordering=-released&page_size=10`,
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch recent games: ${response.status}`)
  }

  return response.json()
}

export type Game = LibraryGame
