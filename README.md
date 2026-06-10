# ATScv — Free CV Builder

Build a professional, ATS-friendly CV in minutes. Fill in your details, watch a clean CV assemble itself live, and export a crisp PDF. An AI review flags gaps and weak spots before you send it.

## Features

- **Live preview** — see your CV update as you type
- **AI review** — score out of 100, ATS check, weak phrasing flags, keyword hints (uses Gemini; falls back to a built-in offline analyzer)
- **CV checker** — upload an existing PDF, Word, or text CV and get instant feedback
- **PDF export** — clean, print-ready output via the browser print dialog
- **All sections** — experience, education, skills, projects, certifications, languages, awards, volunteer, custom
- **Mobile-first** — full editing, preview, and export on any screen size
- **Private** — everything runs in the browser; nothing is uploaded

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## AI setup (optional)

1. Get a free Gemini API key at https://aistudio.google.com/apikey
2. Copy `.env.example` to `.env`
3. Add your key:

```
VITE_GEMINI_API_KEY=your_key_here
```

> **Note:** `VITE_` variables are embedded in the client bundle at build time. For a production deployment, proxy the Gemini call through a backend so the key stays server-side.

Without a key the app works fully — it uses a built-in rules-based analyzer instead.

## Project structure

```
src/
  main.jsx              Entry point
  App.jsx               View router (home / builder / checker)
  index.css             All styles
  data/cv.js            CV data model
  lib/
    ai.js               Gemini API + offline analyzer
    export.js           PDF export
    pdf.js              In-browser PDF text extraction
    utils.js            Shared helpers
  components/
    Home.jsx            Landing page
    Builder.jsx         CV editor + form
    CVSheet.jsx         CV document renderer
    AIPanel.jsx         AI review panel
    ReviewResult.jsx    Score + feedback display
    Checker.jsx         Upload & check an existing CV
    Logo.jsx            Logo component
    ui/                 Reusable primitives (Field, Accordion, Repeater …)
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server at localhost:5173 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |

## Tech stack

- React 18 + Vite 6
- lucide-react (icons)
- mammoth (Word file parsing)
- pdf.js via CDN (PDF text extraction)
- Gemini API (optional AI review)
