"use client"

import { useState, useEffect } from "react"
import { Database, HardDrive, Save, Download, Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { GlassContainer } from "@/components/ui/glass-container"
import { getStorageStats, exportData, importData, createBackup, restoreFromBackup } from "@/lib/storage-manager"
import { useToast } from "@/components/ui/use-toast"

interface StorageStats {
  usedSpace: number
  totalGames: number
  lastBackup: string | null
  lastModified: string | null
}

export function StorageStats() {
  const [stats, setStats] = useState<StorageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [restoreInProgress, setRestoreInProgress] = useState(false)
  const [exportInProgress, setExportInProgress] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const storageStats = await getStorageStats()
      setStats(storageStats)
    } catch (error) {
      console.error("Failed to load storage stats:", error)
      toast({
        title: "Fehler",
        description: "Speicherstatistiken konnten nicht geladen werden.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExportInProgress(true)
    try {
      await exportData()
      toast({
        title: "Export erfolgreich",
        description: "Deine Daten wurden erfolgreich exportiert.",
      })
    } catch (error) {
      console.error("Export failed:", error)
      toast({
        title: "Export fehlgeschlagen",
        description: "Deine Daten konnten nicht exportiert werden.",
        variant: "destructive",
      })
    } finally {
      setExportInProgress(false)
    }
  }

  const handleImport = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const result = await importData(file)
        toast({
          title: "Import erfolgreich",
          description: `${result.gamesImported} Spiele wurden importiert.`,
        })
        loadStats() // Aktualisiere die Statistiken
      } catch (error) {
        console.error("Import failed:", error)
        toast({
          title: "Import fehlgeschlagen",
          description: "Die Datei konnte nicht importiert werden.",
          variant: "destructive",
        })
      }
    }

    input.click()
  }

  const handleBackup = async () => {
    setBackupInProgress(true)
    try {
      await createBackup()
      toast({
        title: "Backup erstellt",
        description: "Ein Backup deiner Daten wurde erstellt.",
      })
      loadStats() // Aktualisiere die Statistiken
    } catch (error) {
      console.error("Backup failed:", error)
      toast({
        title: "Backup fehlgeschlagen",
        description: "Das Backup konnte nicht erstellt werden.",
        variant: "destructive",
      })
    } finally {
      setBackupInProgress(false)
    }
  }

  const handleRestore = async () => {
    if (!confirm("Möchtest du wirklich das letzte Backup wiederherstellen? Aktuelle Änderungen gehen verloren.")) {
      return
    }

    setRestoreInProgress(true)
    try {
      const result = await restoreFromBackup()
      toast({
        title: "Wiederherstellung erfolgreich",
        description: `${result.gamesRestored} Spiele wurden wiederhergestellt.`,
      })
      loadStats() // Aktualisiere die Statistiken
    } catch (error) {
      console.error("Restore failed:", error)
      toast({
        title: "Wiederherstellung fehlgeschlagen",
        description: "Das Backup konnte nicht wiederhergestellt werden.",
        variant: "destructive",
      })
    } finally {
      setRestoreInProgress(false)
    }
  }

  if (loading) {
    return (
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
        </div>
      </GlassContainer>
    )
  }

  if (!stats) {
    return (
      <GlassContainer className="p-6" intensity="medium" textContrast="high">
        <p className="text-white">Keine Speicherstatistiken verfügbar.</p>
      </GlassContainer>
    )
  }

  // Berechne den Prozentsatz des verwendeten Speichers (angenommen, 50MB ist das Maximum)
  const maxStorage = 50 * 1024 * 1024 // 50MB in Bytes
  const usedPercentage = Math.min(100, (stats.usedSpace / maxStorage) * 100)

  return (
    <GlassContainer className="p-6" intensity="medium" textContrast="high">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Database className="w-5 h-5 mr-2 text-emerald-400" />
        Lokaler Speicher
      </h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-white">Speichernutzung</span>
            <span className="text-sm text-white">{(stats.usedSpace / (1024 * 1024)).toFixed(2)} MB / 50 MB</span>
          </div>
          <Progress value={usedPercentage} className="h-2 bg-white/10" indicatorClassName="bg-emerald-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <div className="flex items-center text-emerald-400 mb-2">
              <HardDrive className="w-4 h-4 mr-2" />
              <span className="font-medium">Bibliothek</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalGames}</p>
            <p className="text-xs text-white/70">Spiele in deiner Sammlung</p>
          </div>

          <div className="bg-black/30 rounded-lg p-4 border border-white/10">
            <div className="flex items-center text-emerald-400 mb-2">
              <Save className="w-4 h-4 mr-2" />
              <span className="font-medium">Letztes Backup</span>
            </div>
            <p className="text-sm font-medium text-white">
              {stats.lastBackup
                ? new Date(stats.lastBackup).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Kein Backup"}
            </p>
            <p className="text-xs text-white/70">
              {stats.lastModified && stats.lastBackup && new Date(stats.lastModified) > new Date(stats.lastBackup)
                ? "Änderungen seit letztem Backup"
                : "Alle Änderungen gesichert"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={handleBackup}
            disabled={backupInProgress}
            className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
          >
            {backupInProgress ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Backup...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Backup erstellen
              </>
            )}
          </Button>

          <Button
            onClick={handleRestore}
            disabled={restoreInProgress || !stats.lastBackup}
            className="bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
          >
            {restoreInProgress ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Wiederherstellen...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Backup wiederherstellen
              </>
            )}
          </Button>
        </div>

        <div className="pt-4 border-t border-white/10">
          <h3 className="text-lg font-medium text-white mb-3">Daten übertragen</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleExport}
              disabled={exportInProgress}
              className="bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
            >
              {exportInProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exportieren...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Daten exportieren
                </>
              )}
            </Button>

            <Button
              onClick={handleImport}
              className="bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
            >
              <Upload className="w-4 h-4 mr-2" />
              Daten importieren
            </Button>
          </div>
          <p className="text-xs text-white/70 mt-2">
            Exportiere deine Daten, um sie zu sichern oder auf ein anderes Gerät zu übertragen.
          </p>
        </div>
      </div>
    </GlassContainer>
  )
}
