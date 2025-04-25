"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import { Search, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlassContainer } from "@/components/ui/glass-container"
import { searchGames, getGameDetails, convertRawgGameToGame } from "@/lib/rawg-api"
import { saveGame, getAllGames } from "@/lib/client-storage"
import { compressImage } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import type { Game } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

export function AddGameForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedGame, setSelectedGame] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualMode, setManualMode] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [compressing, setCompressing] = useState(false)

  // Formularfelder für manuelles Hinzufügen
  const [formData, setFormData] = useState<Partial<Game>>({
    name: "",
    background_image: "",
    released: "",
    description: "",
    status: "Not Started",
    userNotes: "",
    solutions: "",
    isCustom: true,
  })

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setSearching(true)
    setSearchResults([])

    try {
      const results = await searchGames(searchQuery)

      // Prüfe, welche Spiele bereits in der Bibliothek oder Wunschliste sind
      const existingGames = await getAllGames()
      const resultsWithStatus = results.results.map((game: any) => {
        const existsInLibrary = existingGames.some((g) => g.id === game.id.toString() && !g.wishlist)
        const existsInWishlist = existingGames.some((g) => g.id === game.id.toString() && g.wishlist)
        return {
          ...game,
          existsInLibrary,
          existsInWishlist,
        }
      })

      setSearchResults(resultsWithStatus)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Fehler bei der Suche",
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      })
    } finally {
      setSearching(false)
    }
  }

  const handleSelectGame = async (game: any) => {
    setLoading(true)

    try {
      const details = await getGameDetails(game.id)
      setSelectedGame(details)
    } catch (error) {
      console.error("Error fetching game details:", error)
      toast({
        title: "Fehler beim Laden der Spieldetails",
        description: "Die Spieldetails konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Verbessere die handleAddGame-Funktion, um robuster mit API-Daten umzugehen
  const handleAddGame = async () => {
    if (!selectedGame) return

    setLoading(true)

    try {
      // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
      const gameData = convertRawgGameToGame(selectedGame)

      // Prüfe, ob das Spiel bereits in der Bibliothek existiert
      const existingGames = await getAllGames()
      const existsInLibrary = existingGames.some((game) => game.id === gameData.id && !game.wishlist)
      const existsInWishlist = existingGames.some((game) => game.id === gameData.id && game.wishlist)

      if (existsInLibrary) {
        toast({
          title: "Spiel existiert bereits",
          description: `"${selectedGame.name}" ist bereits in deiner Bibliothek.`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (existsInWishlist) {
        toast({
          title: "Spiel ist auf der Wunschliste",
          description: `"${selectedGame.name}" ist bereits auf deiner Wunschliste. Entferne es zuerst von dort.`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      await saveGame(gameData)
      toast({
        title: "Spiel hinzugefügt",
        description: `"${selectedGame.name}" wurde zur Bibliothek hinzugefügt.`,
      })
      router.push("/admin")
    } catch (error) {
      console.error("Error adding game:", error)
      toast({
        title: "Fehler beim Hinzufügen",
        description: "Das Spiel konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast({
        title: "Fehler",
        description: "Bitte gib einen Spielnamen ein.",
      })
      return
    }

    setLoading(true)

    // Prüfe, ob ein Spiel mit dem gleichen Namen bereits existiert
    try {
      const existingGames = await getAllGames()
      const existsInLibrary = existingGames.some(
        (game) => game.name.toLowerCase() === formData.name?.toLowerCase() && !game.wishlist,
      )
      const existsInWishlist = existingGames.some(
        (game) => game.name.toLowerCase() === formData.name?.toLowerCase() && game.wishlist,
      )

      if (existsInLibrary) {
        toast({
          title: "Spiel existiert bereits",
          description: `Ein Spiel mit dem Namen "${formData.name}" ist bereits in deiner Bibliothek.`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (existsInWishlist) {
        toast({
          title: "Spiel ist auf der Wunschliste",
          description: `Ein Spiel mit dem Namen "${formData.name}" ist bereits auf deiner Wunschliste.`,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
    } catch (error) {
      console.error("Error checking existing games:", error)
    }

    try {
      // Komprimiere das Bild, falls vorhanden
      let compressedImage = formData.background_image
      if (imagePreview) {
        setCompressing(true)
        try {
          compressedImage = await compressImage(imagePreview)
        } catch (error) {
          console.error("Error compressing image:", error)
        } finally {
          setCompressing(false)
        }
      }

      const gameData: Game = {
        id: uuidv4(),
        name: formData.name || "Unbenanntes Spiel",
        background_image: compressedImage || "",
        description: formData.description || "",
        released: formData.released || "",
        status: (formData.status as Game["status"]) || "Not Started",
        userRating: 0, // Standardmäßig keine Bewertung
        userNotes: formData.userNotes || "",
        solutions: formData.solutions || "",
        addedDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        isCustom: true,
        favorite: false,
      }

      await saveGame(gameData)
      toast({
        title: "Spiel hinzugefügt",
        description: `"${gameData.name}" wurde zur Bibliothek hinzugefügt.`,
      })
      router.push("/admin")
    } catch (error) {
      console.error("Error adding manual game:", error)
      toast({
        title: "Fehler beim Hinzufügen",
        description: "Das Spiel konnte nicht hinzugefügt werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setImagePreview(result)
        setFormData({ ...formData, background_image: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  return (
    <GlassContainer className="p-6" intensity="medium" textContrast="high">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Spiel hinzufügen</h1>
        <Button
          variant="outline"
          onClick={() => setManualMode(!manualMode)}
          className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
        >
          {manualMode ? "API-Suche verwenden" : "Manuell hinzufügen"}
        </Button>
      </div>

      {manualMode ? (
        // Formular für manuelles Hinzufügen
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white font-medium">
                  Spielname *
                </Label>
                <GlassContainer className="p-0" intensity="medium">
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Spielname eingeben"
                    className="bg-transparent border-0 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    required
                  />
                </GlassContainer>
              </div>

              <div>
                <Label htmlFor="released" className="text-white font-medium">
                  Erscheinungsdatum
                </Label>
                <GlassContainer className="p-0" intensity="medium">
                  <Input
                    id="released"
                    name="released"
                    type="date"
                    value={formData.released}
                    onChange={handleInputChange}
                    className="bg-transparent border-0 text-white placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </GlassContainer>
              </div>

              <div>
                <Label htmlFor="status" className="text-white font-medium">
                  Status
                </Label>
                <GlassContainer className="p-0" intensity="medium">
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger className="bg-transparent border-0 text-white focus:ring-0">
                      <SelectValue placeholder="Status auswählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/95 backdrop-blur-md border-white/20">
                      <SelectItem value="Not Started" className="text-white hover:bg-white/15">
                        Nicht begonnen
                      </SelectItem>
                      <SelectItem value="In Progress" className="text-white hover:bg-white/15">
                        In Bearbeitung
                      </SelectItem>
                      <SelectItem value="On Hold" className="text-white hover:bg-white/15">
                        Pausiert
                      </SelectItem>
                      <SelectItem value="Completed" className="text-white hover:bg-white/15">
                        Abgeschlossen
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </GlassContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="image" className="text-white font-medium">
                  Spielcover
                </Label>
                <GlassContainer className="mt-1" intensity="medium">
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-white/20 rounded-md">
                    {imagePreview ? (
                      <div className="relative w-full aspect-[3/4]">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Vorschau"
                          className="object-cover w-full h-full rounded-md"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 border border-white/20"
                          onClick={() => {
                            setImagePreview(null)
                            setFormData({ ...formData, background_image: "" })
                          }}
                        >
                          Ändern
                        </Button>
                        {compressing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="text-white text-center">
                              <Loader2 className="h-8 w-8 mx-auto animate-spin text-emerald-400 mb-2" />
                              <p>Bild wird optimiert...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-slate-300" />
                        <div className="flex text-sm text-slate-300">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300"
                          >
                            <span>Datei hochladen</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              onChange={handleImageChange}
                              accept="image/*"
                            />
                          </label>
                          <p className="pl-1">oder per Drag & Drop</p>
                        </div>
                        <p className="text-xs text-slate-300">PNG, JPG, GIF bis 10MB</p>
                      </div>
                    )}
                  </div>
                </GlassContainer>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-white">
              Beschreibung
            </Label>
            <GlassContainer className="p-0" intensity="low">
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Beschreibung des Spiels..."
                className="bg-transparent border-0 text-white h-32 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </GlassContainer>
          </div>

          <div>
            <Label htmlFor="userNotes" className="text-white">
              Persönliche Notizen
            </Label>
            <GlassContainer className="p-0" intensity="low">
              <Textarea
                id="userNotes"
                name="userNotes"
                value={formData.userNotes}
                onChange={handleInputChange}
                placeholder="Deine persönlichen Notizen zum Spiel..."
                className="bg-transparent border-0 text-white h-32 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </GlassContainer>
          </div>

          <div>
            <Label htmlFor="solutions" className="text-white">
              Lösungen & Guides
            </Label>
            <GlassContainer className="p-0" intensity="low">
              <Textarea
                id="solutions"
                name="solutions"
                value={formData.solutions}
                onChange={handleInputChange}
                placeholder="Lösungen für Rätsel, Boss-Strategien oder andere hilfreiche Informationen..."
                className="bg-transparent border-0 text-white h-32 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </GlassContainer>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin")}
              className="bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={loading || compressing}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Speichern...
                </>
              ) : (
                "Spiel speichern"
              )}
            </Button>
          </div>
        </form>
      ) : (
        // API-Suche
        <>
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <GlassContainer className="flex-1 p-0" intensity="medium">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Spiel suchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-0 text-white pl-10 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                </div>
              </GlassContainer>
              <Button
                type="submit"
                disabled={searching}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all duration-300"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Suchen...
                  </>
                ) : (
                  "Suchen"
                )}
              </Button>
            </div>
          </form>

          {searching ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Suchergebnisse</h2>

              {searchResults.map((game) => (
                <GlassContainer
                  key={game.id}
                  className={`p-4 transition-colors ${
                    game.existsInLibrary || game.existsInWishlist
                      ? "bg-white/5 cursor-default"
                      : "hover:bg-white/5 cursor-pointer"
                  }`}
                  intensity="medium"
                  onClick={() => !game.existsInLibrary && !game.existsInWishlist && handleSelectGame(game)}
                >
                  <div className="flex gap-4">
                    <div className="w-16 h-16 flex-shrink-0 bg-slate-700 rounded-lg overflow-hidden">
                      {game.background_image && (
                        <img
                          src={game.background_image || "/placeholder.svg"}
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{game.name}</h3>
                      <p className="text-sm text-slate-300">
                        {game.released ? new Date(game.released).getFullYear() : "Unbekanntes Jahr"} •{" "}
                        {game.genres?.map((g: any) => g.name).join(", ") || "Unbekanntes Genre"}
                      </p>
                      {game.existsInLibrary && <Badge className="mt-1 bg-emerald-600">Bereits in Bibliothek</Badge>}
                      {game.existsInWishlist && <Badge className="mt-1 bg-amber-600">Auf Wunschliste</Badge>}
                    </div>
                  </div>
                </GlassContainer>
              ))}
            </div>
          ) : searchQuery && !searching ? (
            <GlassContainer className="p-6 text-center" intensity="medium">
              <p className="text-white">Keine Spiele gefunden. Versuche einen anderen Suchbegriff.</p>
            </GlassContainer>
          ) : null}

          {selectedGame && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">Spieldetails</h2>

              <GlassContainer className="p-6" intensity="medium">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                  <div>
                    {selectedGame.background_image && (
                      <img
                        src={selectedGame.background_image || "/placeholder.svg"}
                        alt={selectedGame.name}
                        className="w-full rounded-lg"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedGame.name}</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-emerald-400 font-medium">Erscheinungsdatum</p>
                        <p className="text-white">
                          {selectedGame.released ? new Date(selectedGame.released).toLocaleDateString() : "Unbekannt"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-emerald-400 font-medium">Bewertung</p>
                        <p className="text-white">{selectedGame.rating} / 5</p>
                      </div>

                      <div>
                        <p className="text-sm text-emerald-400 font-medium">Genres</p>
                        <p className="text-white">
                          {selectedGame.genres?.map((g: any) => g.name).join(", ") || "Unbekannt"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-emerald-400 font-medium">Plattformen</p>
                        <p className="text-white">
                          {selectedGame.platforms?.map((p: any) => p.platform.name).join(", ") || "Unbekannt"}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-emerald-400 font-medium">Beschreibung</p>
                      <p className="text-white line-clamp-3">
                        {selectedGame.description_raw || "Keine Beschreibung verfügbar."}
                      </p>
                    </div>

                    <Button
                      onClick={handleAddGame}
                      disabled={loading || selectedGame.existsInLibrary || selectedGame.existsInWishlist}
                      className={`bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-700/30 transition-all duration-300 ${
                        selectedGame.existsInLibrary || selectedGame.existsInWishlist
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Hinzufügen...
                        </>
                      ) : selectedGame.existsInLibrary ? (
                        "Bereits in Bibliothek"
                      ) : selectedGame.existsInWishlist ? (
                        "Auf Wunschliste"
                      ) : (
                        "Zur Bibliothek hinzufügen"
                      )}
                    </Button>
                  </div>
                </div>
              </GlassContainer>
            </div>
          )}
        </>
      )}
    </GlassContainer>
  )
}
