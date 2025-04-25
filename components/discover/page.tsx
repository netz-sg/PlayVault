"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { getAllGames, saveGame } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, BookmarkPlus } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const DiscoverPage = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [games, setGames] = useState<any[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [addingGame, setAddingGame] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    const checkAdmin = async () => {
      setIsAdmin(true)
    }
    checkAdmin()
  }, [])

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}&search=${searchTerm}`,
      )
      const data = await response.json()
      setGames(data.results)
    } catch (error) {
      console.error("Error fetching games:", error)
    }
  }

  const getGameDetails = async (gameId: string) => {
    try {
      const response = await fetch(
        `https://api.rawg.io/api/games/${gameId}?key=${process.env.NEXT_PUBLIC_RAWG_API_KEY}`,
      )
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching game details:", error)
      return null
    }
  }

  const convertRawgGameToGame = (rawgGame: any) => {
    return {
      id: rawgGame.id.toString(),
      name: rawgGame.name,
      background_image: rawgGame.background_image,
      genres: rawgGame.genres.map((genre: any) => genre.name),
      platforms: rawgGame.platforms.map((platform: any) => platform.platform.name),
      stores: rawgGame.stores.map((store: any) => store.store.name),
      description: rawgGame.description,
      metacritic: rawgGame.metacritic,
      released: rawgGame.released,
    }
  }

  const handleAddGame = async (game: any, addToWishlist = false) => {
    if (!isAdmin) return

    setAddingGame(game.id)

    try {
      // Prüfe, ob das Spiel bereits in der Bibliothek existiert
      const existingGames = await getAllGames()
      const exists = existingGames.some((g) => g.id === game.id.toString() && !g.wishlist)
      const existsInWishlist = existingGames.some((g) => g.id === game.id.toString() && g.wishlist)

      if (exists) {
        toast({
          title: "Spiel existiert bereits",
          description: `"${game.name}" ist bereits in deiner Bibliothek.`,
          variant: "destructive",
        })
        setAddingGame(null)
        return
      }

      if (addToWishlist && existsInWishlist) {
        toast({
          title: "Spiel existiert bereits",
          description: `"${game.name}" ist bereits auf deiner Wunschliste.`,
          variant: "destructive",
        })
        setAddingGame(null)
        return
      }

      // Hole detaillierte Informationen zum Spiel
      const detailedGame = await getGameDetails(game.id)
      const gameData = convertRawgGameToGame(detailedGame)

      // Wenn zur Wunschliste hinzugefügt werden soll
      if (addToWishlist) {
        gameData.wishlist = true
      }

      await saveGame(gameData)
      toast({
        title: addToWishlist ? "Zur Wunschliste hinzugefügt" : "Spiel hinzugefügt",
        description: `"${game.name}" wurde ${addToWishlist ? "zur Wunschliste" : "zur Bibliothek"} hinzugefügt.`,
      })
    } catch (error) {
      console.error("Error adding game:", error)
      toast({
        title: "Fehler beim Hinzufügen",
        description: "Das Spiel konnte nicht hinzugefügt werden. Bitte versuche es erneut.",
        variant: "destructive",
      })
    } finally {
      setAddingGame(null)
    }
  }

  const handleAddToWishlist = async (game: any) => {
    await handleAddGame(game, true)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Entdecke neue Spiele</h1>
      <div className="flex items-center mb-4">
        <Input
          type="text"
          placeholder="Suche nach einem Spiel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch} className="ml-2">
          Suchen
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {games.map((game) => (
          <Card key={game.id}>
            <CardHeader>
              <CardTitle>{game.name}</CardTitle>
              <CardDescription>
                {game.genres.map((genre: any) => (
                  <Badge key={genre.id} className="mr-1">
                    {genre.name}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <img
                src={game.background_image || "/placeholder.svg"}
                alt={game.name}
                className="w-full h-32 object-cover rounded-md mb-2"
              />
              <p>Erscheinungsdatum: {game.released}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleAddGame(game)}
                  disabled={addingGame === game.id}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                >
                  {addingGame === game.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Zur Bibliothek
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleAddToWishlist(game)}
                  disabled={addingGame === game.id}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                >
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Wunschliste
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default DiscoverPage
