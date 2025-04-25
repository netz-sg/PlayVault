"use client"

import { useState, useEffect } from "react"
import { Euro, Bell, BellOff, ExternalLink, Loader2, Search, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassContainer } from "@/components/ui/glass-container"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import type { Game } from "@/lib/types"

interface PriceWatcherProps {
  game: Game
}

// Typen für die CheapShark API
interface Store {
  storeID: string
  storeName: string
  isActive: number
  images: {
    banner: string
    logo: string
    icon: string
  }
}

interface PriceGame {
  gameID: string
  steamAppID?: string
  cheapest: string
  cheapestDealID: string
  external: string
  thumb: string
}

interface Deal {
  dealID: string
  storeID: string
  price: string
  retailPrice: string
  savings: string
}

export function PriceWatcher({ game }: PriceWatcherProps) {
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<PriceGame[]>([])
  const [selectedGame, setSelectedGame] = useState<PriceGame | null>(null)
  const [deals, setDeals] = useState<Deal[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [alertPrice, setAlertPrice] = useState("")
  const [alertEmail, setAlertEmail] = useState("")
  const [alerts, setAlerts] = useState<any[]>([])
  const [settingAlert, setSettingAlert] = useState(false)
  const [showAlertForm, setShowAlertForm] = useState(false)
  const { toast } = useToast()

  // Lade Stores beim ersten Rendern
  useEffect(() => {
    const loadStores = async () => {
      try {
        const response = await fetch("https://www.cheapshark.com/api/1.0/stores")
        if (!response.ok) throw new Error("Failed to fetch stores")
        const storesData = await response.json()
        setStores(storesData)
      } catch (error) {
        console.error("Error loading stores:", error)
      }
    }

    loadStores()
  }, [])

  // Lade gespeicherte Alarme
  useEffect(() => {
    if (selectedGame) {
      const savedAlerts = getPriceAlerts(selectedGame.gameID)
      setAlerts(savedAlerts)
    }
  }, [selectedGame])

  // Suche nach dem Spiel, wenn die Komponente geladen wird
  useEffect(() => {
    if (game.name) {
      handleSearch()
    }
  }, [game.name])

  const handleSearch = async () => {
    setLoading(true)
    setSearchResults([])
    setSelectedGame(null)
    setDeals([])

    try {
      const response = await fetch(
        `https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(game.name)}&limit=5`,
      )
      if (!response.ok) throw new Error("Failed to search games")
      const results = await response.json()
      setSearchResults(results)

      // Wenn es ein Ergebnis gibt, wähle es automatisch aus
      if (results.length > 0) {
        handleSelectGame(results[0])
      }
    } catch (error) {
      console.error("Error searching for game:", error)
      toast({
        title: "Fehler bei der Suche",
        description: "Das Spiel konnte nicht gefunden werden. Bitte versuche es später erneut.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectGame = async (priceGame: PriceGame) => {
    setSelectedGame(priceGame)
    setLoading(true)

    try {
      const response = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${priceGame.gameID}`)
      if (!response.ok) throw new Error("Failed to fetch game deals")
      const data = await response.json()
      setDeals(data.deals || [])
    } catch (error) {
      console.error("Error fetching deals:", error)
      toast({
        title: "Fehler beim Laden der Angebote",
        description: "Die Angebote konnten nicht geladen werden. Bitte versuche es später erneut.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetAlert = async () => {
    if (!selectedGame || !alertPrice || Number.parseFloat(alertPrice) <= 0) {
      toast({
        title: "Ungültiger Preis",
        description: "Bitte gib einen gültigen Preis ein.",
        variant: "destructive",
      })
      return
    }

    setSettingAlert(true)

    try {
      // In einer echten Anwendung würde hier eine E-Mail-Validierung stattfinden
      const email = alertEmail || "beispiel@email.de"

      const success = await setPriceAlert(selectedGame.gameID, Number.parseFloat(alertPrice), email)

      if (success) {
        toast({
          title: "Preisalarm gesetzt",
          description: `Du wirst benachrichtigt, wenn ${game.name} für ${alertPrice}€ oder weniger verfügbar ist.`,
        })

        // Aktualisiere die Alarmliste
        const updatedAlerts = getPriceAlerts(selectedGame.gameID)
        setAlerts(updatedAlerts)

        // Formular zurücksetzen
        setAlertPrice("")
        setShowAlertForm(false)
      } else {
        throw new Error("Failed to set price alert")
      }
    } catch (error) {
      console.error("Error setting price alert:", error)
      toast({
        title: "Fehler beim Setzen des Alarms",
        description: "Der Preisalarm konnte nicht gesetzt werden. Bitte versuche es später erneut.",
        variant: "destructive",
      })
    } finally {
      setSettingAlert(false)
    }
  }

  const handleDeleteAlert = (index: number) => {
    if (!selectedGame) return

    const success = deletePriceAlert(selectedGame.gameID, index)

    if (success) {
      toast({
        title: "Preisalarm gelöscht",
        description: "Der Preisalarm wurde erfolgreich gelöscht.",
      })

      // Aktualisiere die Alarmliste
      const updatedAlerts = getPriceAlerts(selectedGame.gameID)
      setAlerts(updatedAlerts)
    } else {
      toast({
        title: "Fehler beim Löschen",
        description: "Der Preisalarm konnte nicht gelöscht werden.",
        variant: "destructive",
      })
    }
  }

  // Finde den Store-Namen anhand der ID
  const getStoreName = (storeID: string): string => {
    const store = stores.find((s) => s.storeID === storeID)
    return store ? store.storeName : "Unbekannter Shop"
  }

  // Formatiert einen Preis als Euro-Betrag
  const formatPrice = (price: string | number): string => {
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return `${numPrice.toFixed(2)} €`
  }

  // Berechnet den Rabatt in Prozent
  const calculateDiscount = (retailPrice: string, salePrice: string): number => {
    const retail = Number.parseFloat(retailPrice)
    const sale = Number.parseFloat(salePrice)

    if (retail <= 0 || sale >= retail) return 0

    const discount = ((retail - sale) / retail) * 100
    return Math.round(discount)
  }

  // Lokaler Speicher für Preisalarme
  const PRICE_ALERTS_KEY = "game_price_alerts"

  // Setzt einen Preisalarm für ein Spiel
  const setPriceAlert = async (gameId: string, price: number, email: string): Promise<boolean> => {
    try {
      // In einer echten Anwendung würde hier ein API-Aufruf erfolgen
      // Da wir keine Backend-API haben, speichern wir die Alarme lokal

      const alerts = getPriceAlerts(gameId)
      alerts.push({ price, email, createdAt: new Date().toISOString() })

      // Speichere alle Alarme
      const allAlerts = getAllPriceAlerts()
      allAlerts[gameId] = alerts
      localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(allAlerts))

      return true
    } catch (error) {
      console.error("Error setting price alert:", error)
      return false
    }
  }

  // Holt alle Preisalarme für ein Spiel
  const getPriceAlerts = (gameId: string): any[] => {
    const allAlerts = getAllPriceAlerts()
    return allAlerts[gameId] || []
  }

  // Löscht einen Preisalarm
  const deletePriceAlert = (gameId: string, index: number): boolean => {
    try {
      const alerts = getPriceAlerts(gameId)

      if (index >= 0 && index < alerts.length) {
        alerts.splice(index, 1)

        // Speichere aktualisierte Alarme
        const allAlerts = getAllPriceAlerts()
        allAlerts[gameId] = alerts
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(allAlerts))

        return true
      }

      return false
    } catch (error) {
      console.error("Error deleting price alert:", error)
      return false
    }
  }

  // Hilfsfunktion: Holt alle Preisalarme
  const getAllPriceAlerts = (): Record<string, any[]> => {
    try {
      const alertsJson = localStorage.getItem(PRICE_ALERTS_KEY)
      return alertsJson ? JSON.parse(alertsJson) : {}
    } catch (error) {
      console.error("Error getting all price alerts:", error)
      return {}
    }
  }

  return (
    <GlassContainer className="p-4" intensity="medium" textContrast="high">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <Euro className="w-5 h-5 mr-2 text-emerald-400" />
        Preisüberwachung
      </h3>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-2" />
            <p className="text-white mb-4">Keine Preisinformationen gefunden.</p>
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
            >
              <Search className="w-4 h-4 mr-2" />
              Erneut suchen
            </Button>
          </div>
        ) : selectedGame ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              {selectedGame.thumb && (
                <img
                  src={selectedGame.thumb || "/placeholder.svg"}
                  alt={selectedGame.external}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div>
                <h4 className="text-white font-medium">{selectedGame.external}</h4>
                <p className="text-sm text-emerald-400">Günstigster Preis: {formatPrice(selectedGame.cheapest)}</p>
              </div>
            </div>

            {deals.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-white font-medium">Aktuelle Angebote:</h4>
                {deals.map((deal, index) => (
                  <div
                    key={index}
                    className="bg-black/30 rounded-lg p-3 border border-white/10 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-white font-medium">{getStoreName(deal.storeID)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-emerald-400 font-bold">{formatPrice(deal.price)}</span>
                        {Number.parseFloat(deal.retailPrice) > Number.parseFloat(deal.price) && (
                          <>
                            <span className="text-white/50 line-through text-sm">{formatPrice(deal.retailPrice)}</span>
                            <Badge className="bg-emerald-600">
                              -{calculateDiscount(deal.retailPrice, deal.price)}%
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <a
                      href={`https://www.cheapshark.com/redirect?dealID=${deal.dealID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Zum Shop
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/70 text-center py-2">Keine aktuellen Angebote verfügbar.</p>
            )}

            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-white font-medium">Preisalarme:</h4>
                <Button
                  size="sm"
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  className="bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                >
                  {showAlertForm ? (
                    <>
                      <BellOff className="w-4 h-4 mr-1" />
                      Abbrechen
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4 mr-1" />
                      Alarm hinzufügen
                    </>
                  )}
                </Button>
              </div>

              {showAlertForm && (
                <div className="bg-black/30 rounded-lg p-3 border border-white/10 mb-3">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-white mb-1 block">Benachrichtigen, wenn der Preis unter</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="z.B. 19.99"
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(e.target.value)}
                          className="bg-black/30 border-white/20 text-white"
                        />
                        <span className="flex items-center text-white">€</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-white mb-1 block">E-Mail (optional)</label>
                      <Input
                        type="email"
                        placeholder="beispiel@email.de"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        className="bg-black/30 border-white/20 text-white"
                      />
                      <p className="text-xs text-white/50 mt-1">
                        Wenn keine E-Mail angegeben wird, werden Benachrichtigungen in der App angezeigt.
                      </p>
                    </div>
                    <Button
                      onClick={handleSetAlert}
                      disabled={settingAlert || !alertPrice}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
                    >
                      {settingAlert ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Wird gespeichert...
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 mr-2" />
                          Preisalarm setzen
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {alerts.length > 0 ? (
                <div className="space-y-2">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className="bg-black/20 rounded-lg p-2 border border-white/10 flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <Bell className="w-4 h-4 text-amber-400 mr-2" />
                        <span className="text-white">Alarm bei {formatPrice(alert.price)}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteAlert(index)}
                        className="h-8 w-8 p-0 text-white/50 hover:text-red-400 hover:bg-transparent"
                      >
                        <BellOff className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/70 text-sm text-center py-2">
                  Keine Preisalarme gesetzt. Füge einen hinzu, um benachrichtigt zu werden, wenn der Preis sinkt.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-white/70">Wähle ein Spiel aus, um Preise zu vergleichen und Preisalarme zu setzen.</p>
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((result) => (
                  <GlassContainer
                    key={result.gameID}
                    className="p-2 hover:bg-white/5 cursor-pointer transition-colors"
                    intensity="low"
                    onClick={() => handleSelectGame(result)}
                  >
                    <div className="flex items-center gap-2">
                      {result.thumb && (
                        <img
                          src={result.thumb || "/placeholder.svg"}
                          alt={result.external}
                          className="w-10 h-10 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <p className="text-white">{result.external}</p>
                        <p className="text-xs text-emerald-400">Ab {formatPrice(result.cheapest)}</p>
                      </div>
                    </div>
                  </GlassContainer>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassContainer>
  )
}
