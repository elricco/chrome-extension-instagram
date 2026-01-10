# Instagram Reels Controls - Chrome Extension

## Projekt-Übersicht

Chrome Extension (Manifest V3) die Video-Scrubbing, persistente Lautstärkeregelung und Keyboard-Shortcuts für Instagram Reels hinzufügt.

## Features

1. **Video-Scrubbing** - Timeline-Navigation innerhalb von Reels
2. **Volume-Control** - Lautstärkeregelung (nicht nur Mute/Unmute)
3. **Persistente Lautstärke** - Wird via `chrome.storage.local` gespeichert
4. **Keyboard-Shortcuts** - Schnelle Navigation und Steuerung

## Keyboard-Shortcuts

| Taste | Aktion |
|-------|--------|
| `←` | -5 Sekunden |
| `→` | +5 Sekunden |
| `↑` | +10% Lautstärke |
| `↓` | -10% Lautstärke |
| `M` | Mute/Unmute |

## Dateistruktur

```
chrome-extension-instagram/
├── CLAUDE.md           # Dieser Plan
├── manifest.json       # Extension-Konfiguration (Manifest V3)
├── content.js          # Hauptlogik
├── content.css         # Styling
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Implementierungs-Plan

### Step 1: Manifest & Grundstruktur ✅
- [x] `manifest.json` mit Manifest V3
- [x] Permissions: `storage`
- [x] Content Scripts für `instagram.com/*`
- [x] PNG-Icons (Platzhalter)

### Step 2: Video-Detection ✅
- [x] `MutationObserver` für DOM-Überwachung
- [x] Tracking via `data-reels-enhanced="true"`
- [x] `loadedmetadata`-Event abwarten
- **Test:** Console-Log bei erkanntem Video

### Step 3: Controls-UI ✅
- [x] Container-DIV mit Scrubber, Volume, Zeitanzeige
- [x] Inline-SVGs für Icons
- [x] Injection als Child des Video-Containers
- **Test:** Controls visuell sichtbar

### Step 4: Scrubbing-Logik ✅
- [x] Progress-Bar sync mit `currentTime`/`duration`
- [x] `input`-Event für Seeking
- [x] `timeupdate`-Event für Sync
- [x] `stopPropagation` gegen Instagram-Konflikte
- **Test:** Video an beliebige Position spulen

### Step 5: Volume-Control mit Persistenz ✅
- [x] Volume-Slider (0.0–1.0)
- [x] `chrome.storage.local` für Persistenz
- [x] Icon-Wechsel (Lautsprecher/Muted)
- **Test:** Volume bleibt nach Reload erhalten

### Step 6: Keyboard-Shortcuts ✅
- [x] `keydown`-Listener auf `document`
- [x] Nur aktiv bei Video im Viewport
- [x] Alle Shortcuts implementieren
- **Test:** Jeden Shortcut einzeln verifizieren

### Step 7: Styling & Polish ✅
- [x] Controls am unteren Rand
- [x] Hover-Effekt für Sichtbarkeit
- [x] Instagram-ähnliches Design
- [x] Hoher `z-index`

## Test-URL

https://www.instagram.com/p/DTIZI0fjDQT/

## Fallback-Strategien

- **Video nicht erkannt:** Alternative Selektoren (`video`, `[src*="blob"]`)
- **Controls überdeckt:** `z-index` erhöhen, Shadow DOM
- **Events blockiert:** `capture: true` bei Listeners
- **Seeking funktioniert nicht:** `video.fastSeek()` statt `currentTime`

## Installation (Entwicklung)

1. Chrome öffnen → `chrome://extensions/`
2. "Entwicklermodus" aktivieren (oben rechts)
3. "Entpackte Erweiterung laden"
4. Diesen Ordner auswählen
5. Instagram öffnen und testen
