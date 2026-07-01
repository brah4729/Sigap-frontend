# Frontend AGENTS.md

Everything about the Next.js dashboard for SIGAP.

---

## What's In Here

```
Frontend/
├── app/
│   ├── page.tsx        ← Main dashboard (single page app)
│   ├── layout.tsx      ← Root layout, metadata
│   └── globals.css     ← Global styles, CSS variables, animations
├── lib/
│   ├── api.ts          ← All backend API calls (axios)
│   └── utils.ts        ← Severity colors, timeAgo, formatCoords
└── .env.local          ← NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Tech Stack

| Package | Purpose | Version |
|---|---|---|
| Next.js | React framework | 16.x (App Router) |
| TypeScript | Type safety | — |
| Tailwind CSS | Styling | v4 |
| axios | HTTP client to FastAPI | — |
| lucide-react | Icons | — |
| recharts | Charts (if needed) | — |

---

## Design System

**Theme:** Black/red emergency operations center

### Color Variables (globals.css)

```css
--bg-base: #0a0a0a      /* page background */
--bg-panel: #111111     /* panel backgrounds */
--bg-card: #1a1a1a      /* card backgrounds */
--border: #2a2a2a       /* default borders */
```

### Severity Colors (lib/utils.ts → severityConfig)

```
CRITICAL → red-400 text, red-950 bg, red-700 border, red-500 dot
HIGH     → orange-400, orange-950, orange-700, orange-500
MEDIUM   → yellow-400, yellow-950, yellow-700, yellow-500
LOW      → green-400, green-950, green-700, green-500
```

Always import from `severityConfig` — never hardcode colors for severity.

### Status Colors (lib/utils.ts → statusConfig)

```
DETECTED   → blue-400
ASSESSING  → yellow-400
RESPONDING → orange-400
RESOLVED   → green-400
```

---

## Key Rules

### All API calls go through lib/api.ts

Never use `axios` or `fetch` directly in components.
Always import from `sigapApi`:

```typescript
// ✅ Correct
import { sigapApi } from "@/lib/api";
const res = await sigapApi.getDisasters();

// ❌ Wrong — bypasses our central config
const res = await axios.get("http://localhost:8000/api/disasters/");
```

### Backend URL comes from .env.local

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If the dashboard shows "Network Error", first check:
1. Is uvicorn running? (`uvicorn main:app --reload --port 8000`)
2. Does `.env.local` exist with the correct URL?
3. Restart `npm run dev` after changing `.env.local`

### Auto-refresh is built in

`page.tsx` auto-refreshes all data every 30 seconds via `setInterval`.
Don't add more polling — it'll overload the backend.

---

## Dashboard Layout

```
┌─────── Header (SIGAP logo + LIVE + Refresh) ──────────┐
├─────── Stat Bar (4 cards: disasters, critical, etc) ───┤
├─── Disaster List ─┬─── Assessment Detail ─┬─ Agents ──┤
│   (scrollable)    │   (selected disaster)  │ Controls  │
│                   │                        │           │
│                   │                        │Deployments│
├───────────────────┴────────────────────────┴───────────┤
│  Agent Activity Log (horizontal scroll)                │
└────────────────────────────────────────────────────────┘
```

---

## Common Issues

### "Network Error" in browser console
→ Backend not running. Start uvicorn.

### Changes to .env.local not taking effect
→ Restart `npm run dev`. Next.js only reads env files at startup.

### Tailwind classes not applying
→ Make sure the class is in Tailwind's base stylesheet.
   Dynamic class names (string interpolation) don't work with Tailwind.

```typescript
// ❌ Tailwind can't detect this at build time
const color = `text-${severity.toLowerCase()}-400`

// ✅ Use a lookup object instead
const color = severityConfig[severity].color
```
