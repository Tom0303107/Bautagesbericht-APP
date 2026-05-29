# Bau-Tagesbericht – Zimmerei Schwaighofer GmbH

Tablet-App zum Erstellen, Speichern und PDF-Export von Bau-Tagesberichten direkt auf der Baustelle.

## Funktionen

- Berichte nach Baustellen sortiert (Ordnerstruktur)
- Autocomplete für Baustellen-Namen (vermeidet Tippfehler)
- Arbeiter-Tabelle mit automatischer Stundenberechnung
- Leistungsergebnisse und Regie-Leistungen als Punkte-Listen
- Foto-Import für Baufortschritt
- Unterschrift per Finger oder Stift
- PDF-Export mit Logo, Tabelle und Foto-Seite
- Funktioniert offline (Daten auf dem Tablet gespeichert)

## Lokal starten

```bash
npm install
npm run dev
```

Danach auf `http://localhost:5173` öffnen.

## Für Produktion bauen

```bash
npm run build
```

Der fertige Build liegt im Ordner `dist/` – diesen Ordner kann man bei jedem statischen Hoster ablegen (Netlify, Vercel, GitHub Pages, eigener Webspace).

## Auf dem iPad als App nutzen

1. App-URL im Safari öffnen
2. Auf das Teilen-Symbol tippen
3. „Zum Home-Bildschirm" wählen
4. Bestätigen – die App erscheint als Icon und läuft im Vollbild
