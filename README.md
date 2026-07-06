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
