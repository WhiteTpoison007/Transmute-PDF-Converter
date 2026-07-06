# TRANSMUTE — File Converter

A privacy-first, client-side file conversion tool. All processing happens locally in the browser — no files are ever uploaded to a server.

## Features

- **PDF → Images (PNG/JPG)** — Renders each page as a high-quality image
- **PDF → Text** — Extracts all text content from a PDF
- **PDF → HTML** — Converts PDF pages to a self-contained HTML file
- **Images → PDF** — Combines multiple images (JPG, PNG, WEBP, GIF) into a single PDF with configurable page size, orientation, and margins
- **Drag-to-reorder** image queue before building PDF
- **Batch download** as ZIP (for multi-file outputs)
- 100% offline capable after first load

## Deploy to Netlify

### Option 1: Drag & Drop
1. Zip this folder
2. Go to [app.netlify.com](https://app.netlify.com)
3. Drag the zip onto the "Deploy manually" area

### Option 2: Git
1. Push this folder to a GitHub/GitLab repo
2. In Netlify, click "New site from Git"
3. Select your repo — build settings are auto-detected via `netlify.toml`
4. Deploy!

## Tech Stack

- Pure HTML + CSS + Vanilla JS (no build step needed)
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF rendering & text extraction
- [pdf-lib](https://pdf-lib.js.org/) — PDF creation from images
- [JSZip](https://stuk.github.io/jszip/) — ZIP packaging for batch downloads
- All fonts from Google Fonts (Syne + DM Sans)

## Files

```
index.html    — Main app shell
style.css     — All styles
app.js        — All conversion logic
netlify.toml  — Netlify deployment config
```
