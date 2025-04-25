// Typdefinitionen für die Anwendung

export interface User {
  username: string
  password: string // In einer echten Anwendung würde das Passwort gehasht werden
  isAdmin: boolean
}

export interface AppSettings {
  libraryName: string
  setupCompleted: boolean
  theme?: "dark" | "light" | "system"
  language?: string
  autoBackup?: boolean
  lastAutoBackup?: string
}

export interface Game {
  id: string
  name: string
  background_image?: string
  description?: string
  released?: string
  metacritic?: number
  genres?: { id: number; name: string }[]
  platforms?: { platform: { id: number; name: string } }[]
  rating?: number
  ratings_count?: number
  status?: "Completed" | "In Progress" | "On Hold" | "Not Started"
  userRating?: number // Benutzerbewertung von 1-5
  userNotes?: string
  solutions?: string
  favorite?: boolean
  addedDate: string
  lastModified: string
  isCustom?: boolean // Kennzeichnet, ob das Spiel manuell hinzugefügt wurde
  playTime?: number // Spielzeit in Minuten
  completionPercentage?: number // Fortschritt in Prozent
  tags?: string[] // Benutzerdefinierte Tags
  wishlist?: boolean // Ob das Spiel auf der Wunschliste ist
  playHistory?: PlaySession[] // Spielsitzungen
}

export interface PlaySession {
  date: string
  duration: number // Dauer in Minuten
  note?: string
}

export interface Tag {
  id: string
  name: string
  color: string
}

export interface UpcomingGame {
  id: string
  name: string
  background_image?: string
  released?: string
  description?: string
  reminder?: boolean
  reminderDate?: string
}
