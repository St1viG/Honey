# Honey

A desktop app for automated invoice processing against a product database. Built for fast, repeatable workflows — load an invoice, run batch operations, review changes, and export.

Built with **Tauri 2** (Rust backend) + **React 19** (Vite frontend).

---

## Why

Built for a large makeup distributor that was spending hours every week manually processing invoices — matching product codes against their database, fixing barcodes, updating names, normalizing prices, converting decimal separators. All repetitive, error-prone work.

Honey automates these steps in bulk while keeping the user in control through interactive review modals. Load a file, click Apply, review the flagged items, export. What used to take hours takes minutes.

---

## Features

### Batch Operations
- **Update names** from database by product code
- **Format prices** to 4 decimals, quantities and MP prices to 2 decimals
- **Remove duplicate barcodes** (comma/dot-delimited)
- **Auto-update barcodes** from database
- **Swap commas to dots** (decimal separator normalization)
- **Detect duplicate names** (same name, different code in database)
- **Auto-update prices** above a configurable threshold

### Interactive Review
Operations that need human input trigger sequential modals:
1. **Barcode modal** — enter missing barcodes (remembers previous entries per invoice)
2. **Name modal** — resolve duplicate name conflicts
3. **Price modal** — adjust prices above threshold with live percentage feedback

### Dual-Pane View
- Left pane: original invoice or database
- Right pane: transformed preview or `.dat` export
- Synced scrolling (hold Cmd/Ctrl)
- Independent zoom per pane (40–200%)

### Virtualized Tables
Large datasets render smoothly via `@tanstack/react-virtual` — only visible rows hit the DOM. Column resizing, full-text search, and change highlighting with before/after tooltips.

### Persistence
- Database cached locally with timestamp
- Default operations and price threshold saved to settings
- Barcode entries remembered per invoice filename
- Language and theme preferences in localStorage

### i18n & Theming
- English and Serbian
- Dark theme (VS Code-style) and Light theme (cream/honey palette)

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://rustup.rs/) (stable)
- [Tauri CLI prerequisites](https://v2.tauri.app/start/prerequisites/)

### Development
```bash
npm install
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

The installer will be at `src-tauri/target/release/bundle/`.

### Build for Windows (GitHub Actions)
The repo includes a workflow at `.github/workflows/build.yml`. Go to **Actions → Build Windows → Run workflow**. The `.exe` installer is uploaded as an artifact.

---

## Project Structure

```
src/                          # React frontend
├── App.jsx                   # Main orchestrator, state hub
├── App.css                   # All styles + theme variables
├── components/
│   ├── Header.jsx            # File loading, status display
│   ├── TableView.jsx         # Virtualized table with search, zoom, resize
│   ├── BarcodeModal.jsx      # Missing barcode entry
│   ├── NameUpdateModal.jsx   # Duplicate name resolution
│   ├── PriceUpdateModal.jsx  # Price threshold review
│   └── BottomPanel/
│       ├── BottomPanel.jsx   # Tab container
│       ├── OperationsTab.jsx # Operation checkboxes, apply, log
│       └── SettingsTab.jsx   # Database info, defaults, theme, language
├── context/                  # React contexts (data, settings, log)
└── i18n/
    ├── LanguageContext.jsx    # Language + theme state management
    └── translations.js       # EN/SR translation strings

src-tauri/src/                # Rust backend
├── lib.rs                    # Tauri setup, command registration
├── commands.rs               # 9 Tauri commands (load, process, persist)
├── types.rs                  # Table type, Row (IndexMap), operations impl
└── exel.rs                   # Excel read (calamine) + .dat export
```

### How it fits together

**Frontend** handles presentation — file dialogs, table rendering, modal flows, and user preferences. State lives mostly in `App.jsx`, with contexts for language/theme.

**Backend** handles all data operations — Excel parsing, name/barcode/price matching, formatting, diffing, and file I/O. Operations run in Rust for performance; the frontend is a thin orchestration layer.

Communication is via Tauri's `invoke()` IPC. The backend maintains an `AppState` (invoice + transformed + database tables behind `Mutex`) for thread-safe access.

### Key technical choices
- **IndexMap** for rows — preserves Excel column order through the read → process → export pipeline
- **Sequential modal chain** — each operation result can trigger a review modal before the next
- **CSS custom properties** for theming — `[data-theme="light"]` overrides `:root` variables, no JS style logic
- **Virtual scrolling** — only ~30 DOM rows regardless of dataset size

---

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Runtime  | Tauri 2                             |
| Backend  | Rust (calamine, serde, indexmap)     |
| Frontend | React 19, Vite 7                    |
| Tables   | @tanstack/react-virtual             |
| Dialogs  | @tauri-apps/plugin-dialog           |

---

## License

MIT
