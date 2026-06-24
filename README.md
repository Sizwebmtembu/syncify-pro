# AI Productivity Hub

**Smart Email Generator · Meeting Notes Summarizer · AI Task Planner**

A modern, AI-powered productivity suite that combines three tools into one seamless workspace — draft professional emails, turn raw meeting transcripts into structured summaries, and generate prioritized task plans, all from a single dashboard.

🔗 **Live preview:** https://id-preview--d36a6e06-6b5b-4a2a-a338-6b5090ba1f98.lovable.app
🚀 **Published:** https://syncify-pro.lovable.app

---

## ✨ Features

### 📧 Smart Email Generator (`/email`)
- Generate professional emails from a short prompt
- Multiple types: job applications, follow-ups, business proposals, customer support, formal requests, and more
- Tone and language selection
- Editable drafts with copy / export

### 📝 Meeting Notes Summarizer (`/meetings`)
- Paste a raw transcript and get a clean structured output
- Concise summary, key decisions, and action items
- Markdown export

### ✅ AI Task Planner (`/tasks`)
- Daily and weekly schedule generation
- Eisenhower Priority Matrix (Urgent/Important quadrants)
- Smart reordering based on goals and deadlines

### 📊 Supporting modules
- **Dashboard** — productivity stats, recent activity, AI insights
- **History** — full log of generated content
- **Analytics** — usage trends visualized with Recharts
- **Settings** & **Help** — preferences and Responsible AI disclaimer

---

## 🛠️ Tech Stack

- **Framework:** [TanStack Start v1](https://tanstack.com/start) (React 19, file-based routing, SSR-ready)
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- **Charts:** Recharts
- **Icons:** lucide-react
- **AI:** Vercel AI SDK + `@ai-sdk/openai-compatible` via the Lovable AI Gateway
  - Model: `google/gemini-3-flash-preview`
  - Structured output with `experimental_output`
- **Persistence:** `localStorage` (no backend required for activity history)
- **Runtime:** Cloudflare Workers (edge)

---

## 🚀 Getting Started

```bash
# install dependencies
bun install

# start dev server
bun dev

# production build
bun run build
```

The app runs locally on `http://localhost:8080`.

---

## 📁 Project Structure

```text
src/
├── routes/                  # File-based routes (TanStack Start)
│   ├── __root.tsx           # App shell + sidebar layout
│   ├── index.tsx            # Dashboard
│   ├── email.tsx            # Smart Email Generator
│   ├── meetings.tsx         # Meeting Notes Summarizer
│   ├── tasks.tsx            # AI Task Planner
│   ├── history.tsx
│   ├── analytics.tsx
│   ├── settings.tsx
│   └── help.tsx
├── lib/
│   ├── ai.functions.ts      # createServerFn entry points (email, meeting, tasks)
│   ├── ai-gateway.server.ts # AI SDK client configured for Lovable AI Gateway
│   └── history.ts           # localStorage-backed activity log
├── components/
│   └── app-sidebar.tsx      # Collapsible navigation sidebar
└── styles.css               # Tailwind v4 + design tokens (oklch palette)
```

---

## 🔒 AI & Privacy

All AI generations are processed server-side via the Lovable AI Gateway. Activity history is stored **locally in your browser** (`localStorage`) and never leaves your device. See the in-app **Help** page for the full Responsible AI disclaimer.

---

## 📦 Deployment

This project is built and hosted on [Lovable](https://lovable.dev/). Pushes to the connected GitHub repository sync automatically in both directions.

---

## 📄 License

MIT