"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, Loader2, Upload, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassContainer } from "@/components/ui/glass-container"
import { useAuth } from "@/components/auth-provider"
import { getSettings, saveSettings, getUser, saveUser, downloadBackup, uploadBackup, createBackup, restoreFromBackup, getAuthToken } from "@/lib/client-storage"
import { ThemeSwitcher } from "@/components/theme-switcher"
import type { AppSettings, User } from "@/lib/types"

export default function SettingsPage() {
  const { isAdmin, isAuthenticated } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ text: "", type: "" })

  // Neue Passwörter für Änderung
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Automatische Backup-Einstellung
  const [autoBackup, setAutoBackup] = useState(false)

  // Backup-Verwaltung
  const [isBackupLoading, setIsBackupLoading] = useState(false)
  const [backupMessage, setBackupMessage] = useState({ text: "", type: "" })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Wenn der Benutzer nicht angemeldet oder kein Admin ist, zur Login-Seite weiterleiten
    if (!isAuthenticated || !isAdmin) {
      router.push("/login")
      return;
    }
    
    const loadData = async () => {
      try {
        const settingsData = await getSettings();
        if (settingsData) {
          setSettings(settingsData);
          setAutoBackup(settingsData.autoBackup || false);
        }
        
        // Benutzer aus dem Auth-Token laden
        const token = getAuthToken();
        if (token) {
          // Extrahiere Benutzernamen aus Token (gleiche Methode wie in auth.ts)
          const username = token.split('_')[0];
          if (username) {
            console.log("Lade Benutzer:", username);
            const userData = await getUser(username);
            if (userData) {
              console.log("Benutzerdaten geladen:", userData);
              setUser(userData);
            } else {
              console.error("Keine Benutzerdaten für", username, "gefunden");
            }
          }
        }
      } catch (error) {
        console.error("Failed to load settings or user data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, isAdmin, router]);

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      setSettings({
        ...settings,
        [e.target.name]: e.target.value,
      })
    }
  }

  const saveAppSettings = () => {
    if (!settings) return

    setLoading(true)

    try {
      // Aktualisiere die autoBackup-Einstellung
      const updatedSettings = {
        ...settings,
        autoBackup,
      }

      saveSettings(updatedSettings)
      setSettings(updatedSettings)
      setMessage({ text: "Einstellungen erfolgreich gespeichert.", type: "success" })
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage({ text: "Fehler beim Speichern der Einstellungen.", type: "error" })
    } finally {
      setLoading(false)

      // Nachricht nach 3 Sekunden ausblenden
      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    }
  }

  const changePassword = () => {
    if (!user) return

    // Validierung
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ text: "Bitte fülle alle Passwortfelder aus.", type: "error" })
      return
    }

    if (currentPassword !== user.password) {
      setMessage({ text: "Das aktuelle Passwort ist nicht korrekt.", type: "error" })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Die neuen Passwörter stimmen nicht überein.", type: "error" })
      return
    }

    setLoading(true)

    try {
      // Aktualisiere das Passwort
      const updatedUser = {
        ...user,
        password: newPassword,
      }

      saveUser(updatedUser)
      setUser(updatedUser)

      // Felder zurücksetzen
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setMessage({ text: "Passwort erfolgreich geändert.", type: "success" })
    } catch (error) {
      console.error("Error changing password:", error)
      setMessage({ text: "Fehler beim Ändern des Passworts.", type: "error" })
    } finally {
      setLoading(false)

      // Nachricht nach 3 Sekunden ausblenden
      setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 3000)
    }
  }

  const toggleAutoBackup = () => {
    setAutoBackup(!autoBackup)
  }

  const handleCreateBackup = async () => {
    setIsBackupLoading(true)
    setBackupMessage({ text: "", type: "" })
    
    try {
      await createBackup()
      setBackupMessage({ 
        text: "Backup wurde erfolgreich erstellt und kann heruntergeladen werden.", 
        type: "success" 
      })
    } catch (error) {
      console.error("Error creating backup:", error)
      setBackupMessage({ 
        text: "Fehler beim Erstellen des Backups.", 
        type: "error" 
      })
    } finally {
      setIsBackupLoading(false)
    }
  }

  const handleDownloadBackup = async () => {
    setIsBackupLoading(true)
    setBackupMessage({ text: "", type: "" })
    
    try {
      await downloadBackup()
      setBackupMessage({ 
        text: "Backup-Download wurde gestartet.", 
        type: "success" 
      })
    } catch (error) {
      console.error("Error downloading backup:", error)
      setBackupMessage({ 
        text: "Fehler beim Herunterladen des Backups.", 
        type: "error" 
      })
    } finally {
      setIsBackupLoading(false)
    }
  }

  const handleUploadBackupClick = () => {
    // Trigger das versteckte Datei-Input-Element
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsBackupLoading(true)
    setBackupMessage({ text: "", type: "" })
    
    try {
      const result = await uploadBackup(file)
      setBackupMessage({ 
        text: `Backup erfolgreich wiederhergestellt. ${result.gamesRestored} Spiele wurden importiert.`, 
        type: "success" 
      })
    } catch (error) {
      console.error("Error uploading backup:", error)
      setBackupMessage({ 
        text: "Fehler beim Wiederherstellen des Backups. Überprüfe das Dateiformat.", 
        type: "error" 
      })
    } finally {
      setIsBackupLoading(false)
      // Setze das Datei-Input-Element zurück
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-6">
        <GlassContainer className="p-6 mx-auto max-w-4xl" intensity="medium" textContrast="high">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            <p className="mt-4 text-white">Einstellungen werden geladen...</p>
          </div>
        </GlassContainer>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-6">
        <GlassContainer className="p-6 mx-auto max-w-4xl" intensity="medium" textContrast="high">
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-white">Du musst als Administrator angemeldet sein, um auf diese Seite zuzugreifen.</p>
            <Link href="/login" className="mt-4">
              <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400">
                Zum Login
              </Button>
            </Link>
          </div>
        </GlassContainer>
      </div>
    );
  }

  if (!settings || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-6">
        <GlassContainer className="p-6 mx-auto max-w-4xl" intensity="medium" textContrast="high">
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-white">Einstellungen oder Benutzerdaten konnten nicht geladen werden.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
            >
              Erneut versuchen
            </Button>
          </div>
        </GlassContainer>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin" className="inline-flex items-center text-white hover:text-emerald-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zum Admin-Bereich
      </Link>

      <GlassContainer className="p-6 mb-8" intensity="medium" textContrast="high">
        <h1 className="text-2xl font-bold text-white mb-6">Einstellungen</h1>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-md ${message.type === "success" ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"}`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Bibliothekseinstellungen</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="libraryName" className="text-white">
                  Name der Bibliothek
                </Label>
                <Input
                  id="libraryName"
                  name="libraryName"
                  value={settings.libraryName}
                  onChange={handleSettingsChange}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoBackup"
                  checked={autoBackup}
                  onChange={toggleAutoBackup}
                  className="h-4 w-4 rounded border-white/20 bg-black/30 text-emerald-500 focus:ring-emerald-500"
                />
                <Label htmlFor="autoBackup" className="text-white">
                  Automatische Backups aktivieren (täglich)
                </Label>
              </div>

              <Button
                onClick={saveAppSettings}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Einstellungen speichern
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Erscheinungsbild</h2>
            <ThemeSwitcher />
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Passwort ändern</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword" className="text-white">
                  Aktuelles Passwort
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="newPassword" className="text-white">
                  Neues Passwort
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword" className="text-white">
                  Neues Passwort bestätigen
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/30 border-white/20 text-white"
                />
              </div>

              <Button
                onClick={changePassword}
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ändern...
                  </>
                ) : (
                  "Passwort ändern"
                )}
              </Button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Gefahrenzone</h2>

            <div>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Alle Daten zurücksetzen
              </Button>
              <p className="text-sm text-slate-400 mt-2">
                Diese Aktion löscht alle Spiele und setzt die Bibliothek zurück. Dies kann nicht rückgängig gemacht
                werden.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 mb-6">
            <h2 className="text-xl font-bold text-white mb-4">Backup-Verwaltung</h2>
            
            {backupMessage.text && (
              <div
                className={`mb-6 p-4 rounded-md ${
                  backupMessage.type === "success" ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"
                }`}
              >
                {backupMessage.text}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Button
                onClick={handleCreateBackup}
                disabled={isBackupLoading}
                className="bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
              >
                {isBackupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Backup erstellen...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Backup jetzt erstellen
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleDownloadBackup}
                disabled={isBackupLoading}
                className="bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-white/10"
              >
                {isBackupLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird heruntergeladen...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Backup herunterladen
                  </>
                )}
              </Button>
            </div>
            
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            
            <Button
              onClick={handleUploadBackupClick}
              disabled={isBackupLoading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400"
            >
              {isBackupLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Backup wird wiederhergestellt...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Backup hochladen und wiederherstellen
                </>
              )}
            </Button>
            
            <p className="text-sm text-white/60 mt-2">
              Warnung: Das Wiederherstellen eines Backups überschreibt alle vorhandenen Daten in deiner Bibliothek.
              Stelle sicher, dass du vorher ein Backup erstellt hast.
            </p>
          </div>
        </div>
      </GlassContainer>
    </div>
  )
}
