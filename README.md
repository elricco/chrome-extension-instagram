# Instagram Reels Controls

Eine Chrome-Erweiterung, die Video-Scrubbing, Lautstärkeregelung und Keyboard-Shortcuts für Instagram Reels hinzufügt.

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green)
![License](https://img.shields.io/badge/license-MIT-purple)

## ✨ Features

- **🎬 Video-Scrubbing** – Navigiere frei innerhalb des Videos mit der Progress-Bar
- **🔊 Lautstärkeregelung** – Stufenlose Lautstärke von 0-100% (nicht nur Mute/Unmute)
- **� Auto-Unmute** – Videos werden automatisch mit deiner Lautstärke abgespielt (abschaltbar)
- **💾 Persistente Einstellungen** – Lautstärke und Einstellungen werden gespeichert
- **⚙️ Einstellbares Popup** – Sprungweite, Lautstärke-Schritte und Auto-Unmute anpassbar
- **⌨️ Keyboard-Shortcuts** – Schnelle Steuerung ohne Maus
- **🙈 Versteckter Instagram-Sound-Button** – Der native Mute-Button wird ausgeblendet

## ⌨️ Keyboard-Shortcuts

| Taste | Aktion |
|-------|--------|
| `←` | Zurück springen (einstellbar: 0,5s - 5s) |
| `→` | Vorwärts springen (einstellbar: 0,5s - 5s) |
| `↑` | Lautstärke erhöhen (einstellbar: 5% - 25%) |
| `↓` | Lautstärke verringern (einstellbar: 5% - 25%) |
| `M` | Mute/Unmute |
| `P` | Play/Pause |

> 💡 **Tipp:** Klicke auf das Extension-Icon in der Toolbar um die Einstellungen anzupassen.

## ⚙️ Einstellungen

Klicke auf das Extension-Icon in der Chrome-Toolbar um folgende Einstellungen anzupassen:

| Einstellung | Optionen | Standard |
|-------------|----------|----------|
| **Sprungweite** | 0,5s / 1s / 2s / 3s / 5s | 5 Sekunden |
| **Lautstärke-Schritte** | 5% / 10% / 20% / 25% | 10% |
| **Auto-Unmute** | An / Aus | An |

### Auto-Unmute

Wenn aktiviert (Standard), werden Videos beim Abspielen automatisch mit deiner zuletzt eingestellten Lautstärke entmutet. Falls keine Lautstärke gespeichert ist, wird 50% verwendet.

Wenn deaktiviert, bleiben Videos gemutet wie von Instagram vorgesehen.

## 🚀 Installation

### Methode 1: Aus ZIP-Datei (empfohlen)

1. **ZIP-Datei entpacken**
   - Entpacke `instagram-reels-controls.zip` in einen Ordner deiner Wahl
   - Merke dir den Pfad zu diesem Ordner

2. **Chrome Extensions öffnen**
   - Öffne Chrome und gehe zu: `chrome://extensions/`
   - Oder: Menü (⋮) → Weitere Tools → Erweiterungen

3. **Entwicklermodus aktivieren**
   - Aktiviere den Toggle **"Entwicklermodus"** oben rechts

4. **Erweiterung laden**
   - Klicke auf **"Entpackte Erweiterung laden"**
   - Wähle den entpackten Ordner aus
   - Die Erweiterung erscheint in der Liste

5. **Fertig!**
   - Öffne Instagram und navigiere zu einem Reel
   - Hover über das Video → Controls erscheinen

### Methode 2: Aus Quellcode

```bash
# Repository klonen
git clone <repository-url>
cd chrome-extension-instagram

# In Chrome laden (siehe Schritte 2-5 oben)
```

## 🎮 Verwendung

1. **Öffne ein Instagram Reel**, z.B.:
   https://www.instagram.com/p/DTIZI0fjDQT/

2. **Hover mit der Maus über das Video**
   - Die Controls erscheinen am unteren Rand

3. **Progress-Bar (unten)**
   - Ziehe den Slider um im Video zu navigieren
   - Rechts wird die aktuelle Zeit angezeigt

4. **Volume-Control (rechts)**
   - Hover über das Lautsprecher-Icon
   - Ein vertikaler Slider erscheint
   - Klick auf das Icon: Mute/Unmute

5. **Keyboard-Shortcuts**
   - Funktionieren wenn ein Video sichtbar ist
   - Nicht aktiv bei Texteingabe (Kommentare, Suche)

## 📁 Dateistruktur

```
instagram-reels-controls/
├── manifest.json      # Extension-Konfiguration
├── content.js         # Hauptlogik
├── content.css        # Styling
├── README.md          # Diese Datei
└── icons/
    ├── icon16.png     # Toolbar-Icon (klein)
    ├── icon48.png     # Extension-Liste
    └── icon128.png    # Chrome Web Store
```

## 🔧 Troubleshooting

### Controls erscheinen nicht
- Stelle sicher, dass die Erweiterung aktiviert ist (`chrome://extensions/`)
- Lade die Instagram-Seite neu (F5 oder Cmd+R)
- Prüfe die Browser-Konsole auf Fehler (F12 → Console)

### Scrubbing funktioniert nicht
- Manche Videos laden verzögert – warte bis das Video vollständig geladen ist
- Bei sehr kurzen Videos kann Scrubbing eingeschränkt sein

### Lautstärke wird nicht gespeichert
- Prüfe ob die Extension Speicherrechte hat
- Deinstalliere und installiere die Extension neu

## 🛠️ Entwicklung

### Nach Code-Änderungen:
1. Gehe zu `chrome://extensions/`
2. Klicke auf das Reload-Symbol (↻) bei der Extension
3. Lade die Instagram-Seite neu

### Debug-Modus:
In `content.js` ist `CONFIG.DEBUG = true` gesetzt. Logs erscheinen in der Browser-Konsole mit dem Prefix `[Reels Controls]`.

## 📝 Changelog

### v1.1.0 (Januar 2026)
- **NEU:** Auto-Unmute – Videos werden automatisch mit gespeicherter Lautstärke abgespielt
- **NEU:** Popup-Einstellungen für Sprungweite (0,5s - 5s)
- **NEU:** Popup-Einstellungen für Lautstärke-Schritte (5% - 25%)
- **NEU:** Auto-Unmute Einstellung (Opt-Out möglich)
- **NEU:** Einstellungen werden live übernommen (ohne Seiten-Reload)
- Fallback auf 50% Lautstärke wenn keine gespeichert

### v1.0.0 (Januar 2026)
- Initial Release
- Video-Scrubbing mit Progress-Bar
- Vertikaler Volume-Slider
- Persistente Lautstärke-Einstellung
- Keyboard-Shortcuts (←→↑↓, M, P)
- Instagram Sound-Button ausgeblendet

## 📄 Lizenz

MIT License – Frei zur Verwendung und Modifikation.

---

**Erstellt mit ❤️ für bessere Instagram Reels**
