"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Star, Award, Heart, Save, Edit, X, ShoppingCart, Check, Euro } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { GlassContainer } from "@/components/ui/glass-container"
import { Textarea } from "@/components/ui/textarea"
import { getGame, saveGame } from "@/lib/client-storage"
import { getGameDetails } from "@/lib/rawg-api"
import type { Game } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"
import { UserRating } from "@/components/user-rating"
import { PlayTimeTracker } from "@/components/play-time-tracker"
import { ProgressTracker } from "@/components/progress-tracker"
import { TagManager } from "@/components/tag-manager"
import { WishlistToggle } from "@/components/wishlist-toggle"
import { useToast } from "@/components/ui/use-toast"
// Importiere die PriceWatcher-Komponente
import { PriceWatcher } from "@/components/price-watcher"
import { PlatformIcon } from "@/components/platform-icon"

export default function GameDetailPage({ params }: { params: any }) {
  // Unwrap the params object with React.use()
  const unwrappedParams = use(params) as { id: string };
  const gameId = unwrappedParams.id;
  
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("about")
  const { isAdmin, isAuthenticated } = useAuth()
  const { toast } = useToast()

  // Bearbeitungsstatus
  const [editingNotes, setEditingNotes] = useState(false)
  const [editingSolutions, setEditingSolutions] = useState(false)
  const [userNotes, setUserNotes] = useState("")
  const [solutions, setSolutions] = useState("")
  const [saving, setSaving] = useState(false)
  const [detailedDescription, setDetailedDescription] = useState("")

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const gameData = await getGame(gameId)
        setGame(gameData)
        setIsFavorite(gameData?.favorite || false)

        // Setze die Notizen und Lösungen für die Bearbeitung
        if (gameData) {
          setUserNotes(gameData.userNotes || "")
          setSolutions(gameData.solutions || "")

          // Wenn das Spiel aus der RAWG API stammt und keine detaillierte Beschreibung hat,
          // versuche, detailliertere Informationen abzurufen
          if (!gameData.isCustom && (!gameData.description || gameData.description.length < 100)) {
            try {
              const detailedGame = await getGameDetails(Number.parseInt(gameData.id))
              if (detailedGame.description_raw) {
                setDetailedDescription(detailedGame.description_raw)

                // Aktualisiere das Spiel mit der detaillierten Beschreibung
                const updatedGame = {
                  ...gameData,
                  description: detailedGame.description_raw,
                }
                await saveGame(updatedGame)
                setGame(updatedGame)
              }
            } catch (error) {
              console.error("Failed to fetch detailed game info:", error)
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch game:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchGame()
  }, [gameId])

  const handleToggleFavorite = async () => {
    if (!game || !isAdmin || game.wishlist) return

    const updatedFavorite = !isFavorite
    setIsFavorite(updatedFavorite)

    try {
      const updatedGame = {
        ...game,
        favorite: updatedFavorite,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      setGame(updatedGame)
    } catch (error) {
      console.error("Failed to update favorite status:", error)
      setIsFavorite(!updatedFavorite) // Revert on error
    }
  }

  const handleSetStatus = async (status: Game["status"]) => {
    if (!game || !isAdmin || game.wishlist) return

    try {
      const updatedGame = {
        ...game,
        status,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      setGame(updatedGame)
    } catch (error) {
      console.error("Failed to update game status:", error)
    }
  }

  const handleSaveNotes = async () => {
    if (!game || !isAuthenticated || game.wishlist) return

    setSaving(true)

    try {
      const updatedGame = {
        ...game,
        userNotes,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      setGame(updatedGame)
      setEditingNotes(false)
    } catch (error) {
      console.error("Failed to save notes:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSolutions = async () => {
    if (!game || !isAuthenticated || game.wishlist) return

    setSaving(true)

    try {
      const updatedGame = {
        ...game,
        solutions,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      setGame(updatedGame)
      setEditingSolutions(false)
    } catch (error) {
      console.error("Failed to save solutions:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleMoveToLibrary = async () => {
    if (!game || !isAuthenticated || !game.wishlist) return

    setSaving(true)

    try {
      const updatedGame: Game = {
        ...game,
        wishlist: false,
        status: "Not Started" as const,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      setGame(updatedGame)

      toast({
        title: "Zur Bibliothek hinzugefügt",
        description: `"${game.name}" wurde von der Wunschliste in deine Bibliothek verschoben.`,
      })
    } catch (error) {
      console.error("Failed to move game to library:", error)
      toast({
        title: "Fehler beim Verschieben",
        description: "Das Spiel konnte nicht in die Bibliothek verschoben werden.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "Completed":
        return "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium"
      case "In Progress":
        return "bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium"
      case "On Hold":
        return "bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium"
      case "Not Started":
        return "bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium"
      default:
        return "bg-gradient-to-r from-slate-600 to-slate-700 text-white font-medium"
    }
  }

  if (loading) {
    return (
      <div>
        <Link href="/" className="inline-flex items-center text-white hover:text-emerald-400 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Bibliothek
        </Link>

        <GlassContainer className="p-6" intensity="medium" textContrast="high">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
            <Skeleton className="h-[450px] w-full rounded-lg bg-white/5" />
            <div>
              <Skeleton className="h-10 w-3/4 mb-2 bg-white/5" />
              <Skeleton className="h-6 w-1/2 mb-4 bg-white/5" />
              <Skeleton className="h-6 w-32 mb-6 bg-white/5" />
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full bg-white/5" />
                ))}
              </div>
              <Skeleton className="h-10 w-full mb-4 bg-white/5" />
              <Skeleton className="h-32 w-full bg-white/5" />
            </div>
          </div>
        </GlassContainer>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 flex items-center justify-center">
        <GlassContainer className="p-8 max-w-md text-center" intensity="medium" textContrast="high">
          <h1 className="text-2xl font-bold text-white mb-4">Spiel nicht gefunden</h1>
          <p className="text-white mb-6">Das gesuchte Spiel existiert nicht oder wurde entfernt.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 focus-visible:focus-visible">
              Zurück zur Bibliothek
            </Button>
          </Link>
        </GlassContainer>
      </div>
    )
  }

  const isWishlist = game.wishlist || false

  return (
    <div>
      <Link href="/" className="inline-flex items-center text-white hover:text-emerald-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Bibliothek
      </Link>

      <GlassContainer
        className={`p-6 ${isWishlist ? "border border-amber-500/50 ring-2 ring-amber-500/30" : ""}`}
        intensity="medium"
        textContrast="high"
      >
        {isWishlist && (
          <div className="mb-4 bg-amber-500/20 p-4 rounded-lg border border-amber-500/30">
            <h2 className="text-white font-bold flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2 text-amber-400" />
              Dieses Spiel ist auf deiner Wunschliste
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Du besitzt dieses Spiel noch nicht. Einige Funktionen sind erst verfügbar, wenn du das Spiel zu deiner
              Bibliothek hinzufügst.
            </p>
            {isAuthenticated && (
              <Button
                onClick={handleMoveToLibrary}
                disabled={saving}
                className="mt-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
              >
                <Check className="w-4 h-4 mr-2" />
                {saving ? "Wird verschoben..." : "Jetzt zur Bibliothek hinzufügen"}
              </Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <div className="relative">
            <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />

              <Image
                src={game.background_image || "/placeholder.svg?height=600&width=400"}
                alt={game.name}
                fill
                className={`object-cover ${isWishlist ? "opacity-70" : ""}`}
              />

              {game.status && !isWishlist && (
                <Badge className={`absolute top-4 left-4 z-20 ${getStatusColor(game.status)} shadow-lg`}>
                  {game.status}
                </Badge>
              )}

              {isWishlist && (
                <Badge className="absolute top-4 left-4 z-20 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium shadow-lg">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Wunschliste
                </Badge>
              )}

              {/* Favorite button (only for admin and non-wishlist games) */}
              {isAdmin && !isWishlist && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-4 right-4 z-20 backdrop-blur-sm hover:bg-white/10 h-8 w-8 text-white border border-white/20 transition-colors duration-300 ${
                    isFavorite ? "bg-rose-500/30 text-rose-400 border-rose-500/50" : "bg-black/50"
                  }`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-rose-400" : ""}`} />
                </Button>
              )}
            </div>

            {isAdmin && !isWishlist && (
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    className={`${game.status === "Completed" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-black/50 hover:bg-white/10"} backdrop-blur-sm border border-white/20 text-white`}
                    onClick={() => handleSetStatus("Completed")}
                  >
                    Abgeschlossen
                  </Button>
                  <Button
                    className={`${game.status === "In Progress" ? "bg-blue-600 hover:bg-blue-700" : "bg-black/50 hover:bg-white/10"} backdrop-blur-sm border border-white/20 text-white`}
                    onClick={() => handleSetStatus("In Progress")}
                  >
                    In Bearbeitung
                  </Button>
                  <Button
                    className={`${game.status === "On Hold" ? "bg-amber-600 hover:bg-amber-700" : "bg-black/50 hover:bg-white/10"} backdrop-blur-sm border border-white/20 text-white`}
                    onClick={() => handleSetStatus("On Hold")}
                  >
                    Pausiert
                  </Button>
                  <Button
                    className={`${game.status === "Not Started" ? "bg-slate-600 hover:bg-slate-700" : "bg-black/50 hover:bg-white/10"} backdrop-blur-sm border border-white/20 text-white`}
                    onClick={() => handleSetStatus("Not Started")}
                  >
                    Nicht begonnen
                  </Button>
                </div>
              </div>
            )}

            {isAuthenticated && !isWishlist && (
              <div className="mt-4">
                <WishlistToggle game={game} onUpdate={setGame} />
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {game.platforms?.map((p) => (
                <Badge
                  key={p.platform.id}
                  variant="outline"
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white font-medium flex items-center gap-2"
                >
                  <PlatformIcon platformName={p.platform.name} showTooltip={false} />
                  {p.platform.name}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">{game.name}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {game.rating && (
                <GlassContainer className="flex items-center p-2" intensity="high" textContrast="high">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-white font-medium">{game.rating.toFixed(1)}</span>
                  <span className="text-white text-sm ml-1">({game.ratings_count || 0})</span>
                </GlassContainer>
              )}

              {game.metacritic && (
                <GlassContainer
                  className={`flex items-center p-2 border-r-2 ${
                    game.metacritic >= 75
                      ? "border-green-500"
                      : game.metacritic >= 50
                        ? "border-yellow-500"
                        : "border-red-500"
                  }`}
                  intensity="high"
                  textContrast="high"
                >
                  <Award className="w-4 h-4 mr-1" />
                  <span className="font-medium">{game.metacritic}</span>
                </GlassContainer>
              )}

              {game.released && (
                <GlassContainer className="flex items-center p-2" intensity="high" textContrast="high">
                  <Calendar className="w-4 h-4 text-white mr-1" />
                  {new Date(game.released).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </GlassContainer>
              )}
            </div>

            <GlassContainer
              className="p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4"
              intensity="medium"
              textContrast="high"
            >
              {game.genres && game.genres.length > 0 && (
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Genre</p>
                  <p className="text-white">{game.genres.map((g) => g.name).join(", ")}</p>
                </div>
              )}

              {game.isCustom !== undefined && (
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Quelle</p>
                  <p className="text-white">{game.isCustom ? "Manuell hinzugefügt" : "RAWG API"}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-emerald-300 font-medium">Hinzugefügt am</p>
                <p className="text-white">
                  {new Date(game.addedDate).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-emerald-300 font-medium">Zuletzt bearbeitet</p>
                <p className="text-white">
                  {new Date(game.lastModified).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </GlassContainer>

            <Tabs defaultValue="about" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-black/50 backdrop-blur-sm border border-white/20 p-1">
                <TabsTrigger
                  value="about"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
                >
                  Über das Spiel
                </TabsTrigger>
                <TabsTrigger
                  value="notes"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
                >
                  Meine Notizen
                </TabsTrigger>
                <TabsTrigger
                  value="solutions"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
                >
                  Lösungen & Guides
                </TabsTrigger>
                <TabsTrigger
                  value="tracking"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
                >
                  Tracking
                </TabsTrigger>
                <TabsTrigger
                  value="prices"
                  className="data-[state=active]:bg-white/15 data-[state=active]:text-emerald-400 rounded-md text-white"
                >
                  <Euro className="w-3 h-3 mr-1" />
                  Preise
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4">
                <GlassContainer className="p-4" intensity="medium" textContrast="high">
                  {game.description ? (
                    <p className="text-white whitespace-pre-line leading-relaxed">{game.description}</p>
                  ) : (
                    <p className="text-slate-400 italic">Keine Beschreibung verfügbar.</p>
                  )}
                </GlassContainer>

                {isAuthenticated && !isWishlist && (
                  <div className="mt-4">
                    <TagManager game={game} onUpdate={setGame} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <GlassContainer className="p-4" intensity="medium" textContrast="high">
                  {isWishlist ? (
                    <div className="text-center py-4">
                      <p className="text-white/70">
                        Notizen sind erst verfügbar, wenn du das Spiel zu deiner Bibliothek hinzufügst.
                      </p>
                    </div>
                  ) : editingNotes ? (
                    <div className="space-y-4">
                      <Textarea
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        placeholder="Füge hier deine persönlichen Notizen zum Spiel hinzu..."
                        className="min-h-[200px] bg-black/30 border-white/20 text-white"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingNotes(false)
                            setUserNotes(game.userNotes || "")
                          }}
                          className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleSaveNotes}
                          disabled={saving}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Speichern..." : "Speichern"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {game.userNotes ? (
                        <p className="text-white whitespace-pre-line leading-relaxed">{game.userNotes}</p>
                      ) : (
                        <p className="text-slate-400 italic">Keine Notizen vorhanden.</p>
                      )}

                      {isAuthenticated && !isWishlist && (
                        <Button
                          onClick={() => setEditingNotes(true)}
                          className="mt-4 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {game.userNotes ? "Notizen bearbeiten" : "Notizen hinzufügen"}
                        </Button>
                      )}
                    </div>
                  )}
                </GlassContainer>
              </TabsContent>

              <TabsContent value="solutions" className="mt-4">
                <GlassContainer className="p-4" intensity="medium" textContrast="high">
                  {isWishlist ? (
                    <div className="text-center py-4">
                      <p className="text-white/70">
                        Lösungen sind erst verfügbar, wenn du das Spiel zu deiner Bibliothek hinzufügst.
                      </p>
                    </div>
                  ) : editingSolutions ? (
                    <div className="space-y-4">
                      <Textarea
                        value={solutions}
                        onChange={(e) => setSolutions(e.target.value)}
                        placeholder="Füge hier Lösungen, Tipps und Guides zum Spiel hinzu..."
                        className="min-h-[200px] bg-black/30 border-white/20 text-white"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingSolutions(false)
                            setSolutions(game.solutions || "")
                          }}
                          className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Abbrechen
                        </Button>
                        <Button
                          onClick={handleSaveSolutions}
                          disabled={saving}
                          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Speichern..." : "Speichern"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {game.solutions ? (
                        <p className="text-white whitespace-pre-line leading-relaxed">{game.solutions}</p>
                      ) : (
                        <p className="text-slate-400 italic">Keine Lösungen oder Guides vorhanden.</p>
                      )}

                      {isAuthenticated && !isWishlist && (
                        <Button
                          onClick={() => setEditingSolutions(true)}
                          className="mt-4 bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {game.solutions ? "Lösungen bearbeiten" : "Lösungen hinzufügen"}
                        </Button>
                      )}
                    </div>
                  )}
                </GlassContainer>
              </TabsContent>

              <TabsContent value="tracking" className="mt-4 space-y-4">
                {isWishlist ? (
                  <GlassContainer className="p-4" intensity="medium" textContrast="high">
                    <div className="text-center py-4">
                      <p className="text-white/70">
                        Tracking-Funktionen sind erst verfügbar, wenn du das Spiel zu deiner Bibliothek hinzufügst.
                      </p>
                    </div>
                  </GlassContainer>
                ) : (
                  isAuthenticated && (
                    <>
                      <PlayTimeTracker game={game} onUpdate={setGame} />
                      <ProgressTracker game={game} onUpdate={setGame} />
                    </>
                  )
                )}
              </TabsContent>

              <TabsContent value="prices" className="mt-4 space-y-4">
                {game && <PriceWatcher game={game} />}
              </TabsContent>
            </Tabs>

            {isAuthenticated && !isWishlist && (
              <div className="mt-6">
                <UserRating game={game} onRatingChange={(updatedGame) => setGame(updatedGame)} />
              </div>
            )}
          </div>
        </div>
      </GlassContainer>
    </div>
  )
}
