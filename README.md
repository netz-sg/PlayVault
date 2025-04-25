# 🎮 Game Library - Deine persönliche Spielebibliothek

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://semver.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-14.0.0-black.svg)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-4.14.0-2D3748.svg)](https://www.prisma.io)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

Eine moderne Web-Anwendung zur Verwaltung deiner Spielesammlung mit umfangreichen Funktionen zur Fortschrittsverfolgung, Spielzeiterfassung und Organisation.

![Game Library Screenshot](https://via.placeholder.com/800x400?text=Game+Library+Screenshot)

(Für ein tatsächliches Screenshot deiner Anwendung, füge ein Bild in das Repository ein und aktualisiere den Pfad entsprechend)

## 📋 Inhaltsverzeichnis

- [Features](#-features)
- [Technologie-Stack](#-technologie-stack)
- [Installation](#-installation)
- [Umgebungsvariablen](#-umgebungsvariablen)
- [Nutzung](#-nutzung)
- [Backup-System](#-backup-system)
- [API-Anbindung](#-api-anbindung)
- [Admin-Bereich](#-admin-bereich)
- [Lizenz](#-lizenz)

## ✨ Features

- **Spieleverwaltung**: Füge Spiele manuell oder über die RAWG API hinzu
- **Statusverfolgung**: Halte den Fortschritt deiner Spiele fest (Abgeschlossen, In Bearbeitung, Pausiert, Nicht begonnen)
- **Spielzeiterfassung**: Verfolge, wie viel Zeit du mit jedem Spiel verbringst
- **Wunschliste**: Verwalte Spiele, die du erwerben möchtest
- **Notizen & Lösungen**: Speichere persönliche Notizen und Lösungswege
- **Tagging-System**: Organisiere deine Spiele mit individuellen Tags
- **Plattformübergreifend**: Verwalte Spiele von verschiedenen Plattformen an einem Ort
- **Statistiken & Auswertungen**: Erhalte Einblicke in deine Spielgewohnheiten
- **Umfassendes Backup-System**: Sichere und stelle deine Daten einfach wieder her
- **Responsive Design**: Optimale Nutzung auf Desktop und mobilen Geräten
- **Dark Mode**: Angenehme Nutzung auch in dunkler Umgebung

## 🔧 Technologie-Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI Komponenten
- **Backend**: Next.js API Routes
- **Datenbank**: MySQL mit Prisma ORM
- **API**: Integration mit RAWG Gaming API
- **Authentifizierung**: Eigenes Auth-System

## 💻 Installation

Folge diesen Schritten, um die Anwendung lokal einzurichten:

1. Repository klonen
   ```bash
   git clone https://github.com/yourusername/game-library.git
   cd game-library
   ```

2. Abhängigkeiten installieren
   ```bash
   npm install
   ```

3. Datenbank einrichten
   ```bash
   npx prisma migrate dev --name init
   ```

4. Entwicklungsserver starten
   ```bash
   npm run dev
   ```

5. Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser

## 🔐 Umgebungsvariablen

Erstelle eine `.env`-Datei im Hauptverzeichnis mit folgenden Variablen:

```
DATABASE_URL="mysql://user:password@localhost:3306/game_library"
RAWG_API_KEY="deine_rawg_api_key"
```

Um eine RAWG API Key zu erhalten, registriere dich auf [rawg.io/apidocs](https://rawg.io/apidocs).

## 🎯 Nutzung

Nach der Installation und dem ersten Start musst du das Setup abschließen:

1. Erstelle einen Admin-Benutzer
2. Gib einen Namen für deine Bibliothek ein
3. Starte mit dem Hinzufügen von Spielen entweder manuell oder über die RAWG-Suche

## 💾 Backup-System

Die Anwendung bietet ein umfassendes Backup-System:

- Erstelle Backups mit einem Klick im Admin-Bereich
- Lade Backups als JSON-Datei herunter
- Importiere vorhandene Backups einfach wieder
- Aktiviere automatische tägliche Backups

## 🌐 API-Anbindung

Die Anwendung nutzt die RAWG API, um:

- Spiele zu suchen und zur Bibliothek hinzuzufügen
- Detaillierte Informationen zu Spielen abzurufen
- Cover-Bilder, Veröffentlichungsdaten und Plattforminformationen zu erhalten

## 👑 Admin-Bereich

Der Admin-Bereich bietet erweiterte Funktionen:

- Benutzer- und Einstellungsverwaltung
- Backup-Erstellung und -Wiederherstellung
- Design-Anpassungen und Themenwechsel
- Passwort-Änderungen für Admin-Konten

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz veröffentlicht.

```
MIT License

Copyright (c) 2024 Sebastian

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

Entwickelt mit ❤️ von Sebastian 