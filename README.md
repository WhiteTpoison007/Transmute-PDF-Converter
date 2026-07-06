# ⚗️ TRANSMUTE

[![Netlify Status](https://api.netlify.com/api/v1/badges/e2e50cf6-a791-4475-b38d-ec8cc06c04f9/deploy-status)](https://transmute-pdfconverter.netlify.netlify.app/)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![Type](https://img.shields.io/badge/Architecture-100%25%20Client--Side-blue)
![PWA](https://img.shields.io/badge/PWA-Offline--Ready-orange)

**TRANSMUTE** is a privacy-first, zero-server file conversion suite that handles your files entirely inside your browser tab. No file uploads, no remote servers, and zero data leaves your device. 

🔗 **Live Demo:** [transmute-pdfconverter.netlify.app](https://transmute-pdfconverter.netlify.app/)

---

## ⚡ Core Philosophy: Why TRANSMUTE?

Traditional file converters require uploading private documents to external servers, exposing sensitive information to privacy risks, queues, and bandwidth bottlenecks. 

TRANSMUTE treats your browser like a dedicated local machine, capitalizing on modern client-side JavaScript APIs to parse, manipulate, and compile binary file structures in execution memory (RAM).

### Key Features
* 📄 **PDF Converter:** Transmute PDFs into high-quality images (PNG/JPG), extracted plain text (`.txt`), or structural web documents (`.html`).
* 🖼 **Image → PDF Builder:** Combine single or multiple images (JPG, PNG, WEBP, GIF) into unified PDFs with customizable page constraints (A4, Letter, Original sizing), margins, and page orientation.
* 🔒 **100% Client-Side Privacy:** Your assets are read as binary blobs in isolated client memory; data breaches are fundamentally impossible.
* 📴 **Offline Capable & Installable:** Built as a Progressive Web App (PWA)—once loaded, it converts files perfectly with no active internet connection.

---

## 🏗 System Architecture & Data Flow

Unlike typical full-stack architectures, TRANSMUTE collapses the client-server paradigm into a singular sandbox environment.

### TRANSMUTE vs. Traditional Architectures

```mermaid
graph TD
    subgraph Traditional Architecture
        UserA[User Device] -->|1. Upload File over Internet| Server[Remote Cloud Server]
        Server -->|2. Compute / Process| Server
        Server -->|3. Download File| UserA
        style Server fill:#f9f,stroke:#333,stroke-width:2px
    end

    subgraph TRANSMUTE Local Sandbox
        UserB[User Device] -->|1. Drag & Drop File| RAM[Browser RAM / FileReader API]
        RAM -->|2. Client-Side Parsing Engine| Engines[PDF.js / pdf-lib / JSZip]
        Engines -->|3. Memory Blobs| Canvas[HTML5 Canvas Render Engine]
        Canvas -->|4. Local Anchor Download| UserB
        style TRANSMUTE Local Sandbox fill:#bbf,stroke:#333,stroke-width:2px
    end
sequenceDiagram
    autonumber
    actor User as User Browser
    participant FR as FileReader API
    participant PJS as Mozilla PDF.js Engine
    participant CNV as HTML5 Canvas Workspace
    participant JSZ as JSZip Utility
    participant DOM as Virtual Anchor Element

    User->>FR: Select and input .pdf file
    FR->>User: Parse file array buffer directly into RAM
    User->>PJS: Send Binary Array Buffer
    loop For Each Document Page
        PJS->>CNV: Draw structural page coordinates onto invisible raster graphics layer
        CNV->>JSZ: Export raster frame to local compressed Memory Blob
    end
    JSZ->>DOM: Bundle multiple blobs into unique compressed virtual zip link
    DOM->>User: Automatically trigger programmatic download click to disk
    🛠 Tech Stack
The workspace relies completely on the browser engine and utilizes three high-performance open-source client libraries:

HTML5 Canvas & FileReader API: Performs low-level, local asynchronous file stream reading and arbitrary graphical asset rendering.

PDF.js (by Mozilla): Decouples and extracts internal elements, layouts, fonts, and structures out of binary PDF streams.

pdf-lib: Handles the programmatic generation and multi-asset composition of PDF documents from scratch in pure JavaScript.

JSZip: Consolidates multiple asynchronous asset outputs into zero-overhead compressed client-side zip bundles.

🚀 Getting Started Locally
Since TRANSMUTE requires no server engines, running it locally is incredibly straightforward.

Prerequisites
A standard modern web browser (Chrome, Firefox, Safari, Edge).

Installation & Launch
Clone the repository:
stallation & Launch
Clone the repository:

Bash
git clone [https://github.com/YOUR_USERNAME/transmute.git](https://github.com/YOUR_USERNAME/transmute.git)
cd transmute
Because the application consumes modular third-party library components, open it using a local development server environment to avoid CORS restrictions on local asset layers.

If you use VS Code, right-click index.html and click "Open with Live Server".

Alternatively, launch a simple local pipeline from your terminal:

Bash
# Using Python 3.x
python -m http.server 8080

# Using Node.js (via serve)
npx serve .
Navigate your browser to: http://localhost:8080 or http://localhost:3000

💡 PWA (Progressive Web App) Support
TRANSMUTE is integrated with a lightweight service worker strategy that caches core structural assets, layouts, and external content distribution network dependency layers upon its initial execution.

To run standalone: Tap your browser's application options menu (or Safari's Share button) and select "Add to Home Screen". It will operate entirely as a localized application workspace utility.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Managed and developed with ♥ by Ashmit Mohanty. Built to democratize and secure utility development tools.
