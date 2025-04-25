// CheapShark API Typen
export interface Deal {
  storeID: string
  dealID: string
  price: string
  retailPrice: string
  salePrice: string
  savings: string
  storeName: string
  dealURL: string
  isOnSale: boolean
}

interface CheapSharkGame {
  gameID: string
  steamAppID: string | null
  cheapest: string
  cheapestDealID: string
  external: string
  thumb: string
}

interface CheapSharkDeal {
  internalName: string
  title: string
  dealID: string
  storeID: string
  gameID: string
  salePrice: string
  normalPrice: string
  isOnSale: string
  savings: string
  metacriticScore: string
  steamRatingText: string
  steamRatingPercent: string
  steamRatingCount: string
  steamAppID: string
  releaseDate: number
  lastChange: number
  dealRating: string
  thumb: string
}

// Speichert die Store-Informationen, um sie nicht bei jedem Aufruf neu laden zu müssen
const storeCache: Record<string, { storeName: string; images: { banner: string; logo: string; icon: string } }> = {}

// Lädt die Store-Informationen
async function loadStores() {
  if (Object.keys(storeCache).length > 0) return

  try {
    const response = await fetch("https://www.cheapshark.com/api/1.0/stores")
    const stores = await response.json()

    stores.forEach((store: any) => {
      storeCache[store.storeID] = {
        storeName: store.storeName,
        images: {
          banner: `https://www.cheapshark.com${store.images.banner}`,
          logo: `https://www.cheapshark.com${store.images.logo}`,
          icon: `https://www.cheapshark.com${store.images.icon}`,
        },
      }
    })
  } catch (error) {
    console.error("Fehler beim Laden der Store-Informationen:", error)
  }
}

// Sucht nach Spielen mit dem angegebenen Titel
export async function searchGames(title: string): Promise<CheapSharkGame[]> {
  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}&limit=10`)
    return await response.json()
  } catch (error) {
    console.error("Fehler bei der Spielsuche:", error)
    return []
  }
}

// Sucht nach Angeboten für ein Spiel mit der angegebenen ID
export async function getGameDeals(gameId: string): Promise<Deal[]> {
  await loadStores()

  try {
    const response = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameId}`)
    const data = await response.json()

    if (!data || !data.deals) return []

    return data.deals.map((deal: any) => ({
      ...deal,
      storeName: storeCache[deal.storeID]?.storeName || `Store ${deal.storeID}`,
      dealURL: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
      isOnSale: Number.parseFloat(deal.savings) > 0,
    }))
  } catch (error) {
    console.error("Fehler beim Laden der Angebote:", error)
    return []
  }
}

// Sucht nach Angeboten für ein Spiel mit dem angegebenen Titel
export async function searchGameDeals(title: string): Promise<Deal[]> {
  if (!title) return []

  try {
    // Suche zuerst nach dem Spiel
    const games = await searchGames(title)
    if (games.length === 0) return []

    // Verwende die erste Übereinstimmung
    const gameId = games[0].gameID

    // Lade die Angebote für dieses Spiel
    return await getGameDeals(gameId)
  } catch (error) {
    console.error("Fehler bei der Angebotssuche:", error)
    return []
  }
}
