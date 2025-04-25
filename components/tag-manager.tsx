"use client"

import { useState, useEffect } from "react"
import { TagIcon, Plus, X, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GlassContainer } from "@/components/ui/glass-container"
import { Badge } from "@/components/ui/badge"
import { saveGame, getAllGames } from "@/lib/client-storage"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import type { Game, Tag } from "@/lib/types"

interface TagManagerProps {
  game: Game
  onUpdate?: (updatedGame: Game) => void
}

// Vordefinierte Tag-Farben
const TAG_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-lime-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
]

export function TagManager({ game, onUpdate }: TagManagerProps) {
  const [tags, setTags] = useState<string[]>(game.tags || [])
  const [newTag, setNewTag] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Gemeinsam genutzte Tags aus localStorage laden
  const [availableTags, setAvailableTags] = useState<Tag[]>([])

  useEffect(() => {
    const loadTags = () => {
      const storedTags = localStorage.getItem("game-library-tags")
      if (storedTags) {
        try {
          setAvailableTags(JSON.parse(storedTags))
        } catch (error) {
          console.error("Failed to parse tags:", error)
          setAvailableTags([])
        }
      }
    }

    loadTags()
  }, [])

  const saveTags = async (updatedTags: string[]) => {
    setSaving(true)

    try {
      const updatedGame: Game = {
        ...game,
        tags: updatedTags,
        lastModified: new Date().toISOString(),
      }

      await saveGame(updatedGame)
      onUpdate?.(updatedGame)

      toast({
        title: "Tags gespeichert",
        description: `Tags für "${game.name}" aktualisiert.`,
      })

      return true
    } catch (error) {
      console.error("Failed to save tags:", error)
      toast({
        title: "Fehler beim Speichern",
        description: "Die Tags konnten nicht gespeichert werden.",
        variant: "destructive",
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    // Prüfe, ob der Tag bereits existiert
    if (tags.includes(newTag.trim())) {
      toast({
        title: "Tag existiert bereits",
        description: `Der Tag "${newTag}" ist bereits vorhanden.`,
        variant: "destructive",
      })
      return
    }

    const updatedTags = [...tags, newTag.trim()]
    setTags(updatedTags)

    // Prüfe, ob der Tag bereits in den verfügbaren Tags existiert
    const tagExists = availableTags.some((tag) => tag.name === newTag.trim())

    if (!tagExists) {
      // Erstelle einen neuen Tag mit zufälliger Farbe
      const randomColor = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]
      const newTagObj: Tag = {
        id: uuidv4(),
        name: newTag.trim(),
        color: randomColor,
      }

      const updatedAvailableTags = [...availableTags, newTagObj]
      setAvailableTags(updatedAvailableTags)

      // Speichere die aktualisierten verfügbaren Tags
      localStorage.setItem("game-library-tags", JSON.stringify(updatedAvailableTags))
    }

    const success = await saveTags(updatedTags)
    if (success) {
      setNewTag("")
      setIsAdding(false)
    }
  }

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(updatedTags)
    await saveTags(updatedTags)
  }

  const handleSelectTag = async (tagName: string) => {
    if (tags.includes(tagName)) {
      // Tag entfernen, wenn er bereits vorhanden ist
      await handleRemoveTag(tagName)
    } else {
      // Tag hinzufügen
      const updatedTags = [...tags, tagName]
      setTags(updatedTags)
      await saveTags(updatedTags)
    }
  }

  // Finde die Farbe für einen Tag
  const getTagColor = (tagName: string) => {
    const tag = availableTags.find((t) => t.name === tagName)
    return tag?.color || "bg-slate-500"
  }

  return (
    <GlassContainer className="p-4" intensity="medium" textContrast="high">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center">
        <TagIcon className="w-5 h-5 mr-2 text-emerald-400" />
        Tags
      </h3>

      <div className="space-y-4">
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} className={`${getTagColor(tag)} text-white font-medium`}>
                {tag}
                <button className="ml-1 hover:text-white/80" onClick={() => handleRemoveTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-white/70 text-sm">
            Keine Tags vorhanden. Füge Tags hinzu, um deine Spiele zu organisieren.
          </p>
        )}

        {isAdding ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Neuen Tag eingeben..."
                className="bg-black/30 border-white/20 text-white"
              />
              <Button
                onClick={handleAddTag}
                disabled={!newTag.trim() || saving}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
              >
                <Save className="w-4 h-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="w-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
            >
              Abbrechen
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAdding(true)}
            className="w-full bg-black/50 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tag hinzufügen
          </Button>
        )}

        {availableTags.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-white font-medium mb-2">Häufig verwendete Tags</h4>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Badge
                  key={tag.id}
                  className={`${tag.color} text-white font-medium cursor-pointer ${tags.includes(tag.name) ? "ring-2 ring-white" : ""}`}
                  onClick={() => handleSelectTag(tag.name)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassContainer>
  )
}
