# ORION AI Workspace
A dark-first AI operating workspace prototype that turns conversations into research, plans, projects, files, and created outputs.

## Masterplan
- Give individual builders, students, and product teams one place to move from an idea to a structured, actionable result.
- Combine chat, research, creation, planning, project tracking, file analysis, workflows, and code-oriented assistance behind a consistent workspace shell.
- Preserve useful workspace state locally or through the enabled GenMB KV capability while keeping future AI-provider integration modular.
- Deliver a premium, responsive “AI operating system” feel without exposing hidden reasoning; show concise plans, findings, outputs, and next actions.

## Tech Stack & Architecture
- **Runtime/build:** Vite configured in `vite.config.ts`.
- **UI:** React with JSX/TSX. The primary application is currently a single large module in `src/App.jsx`; `src/main.tsx` mounts it.
- **Routing:** `react-router-dom` using `HashRouter`. Hash-based routes avoid server-side rewrite requirements in static deployments.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`, with global design tokens, utilities, atmosphere effects, and animations in `src/styles/main.css`.
- **Icons:** `lucide-react`.
- **Fonts:** Google Fonts loaded in `index.html`: **Manrope** for UI text and **DM Mono** for code/technical content.
- **Authentication:** GenMB browser SDK injected by `index.html`; app auth state is initialized through `window.genmb.auth` in `useAuth()` within `src/App.jsx`.
- **Persistence:** `window.genmb.kv` when available. `src/storageFallback.ts` installs a localStorage-backed compatible KV implementation if GenMB supplies `window.genmb` without KV.
- **Search:** GenMB search capability is typed in `src/types/genmb.d.ts` as `window.genmb.search.web()` and `.news()`. Research UI can use this capability; no external search API is directly configured.
- **State:** Route/UI state and demo workspace data are held in React hooks. Seed records (`seedChats`, `seedProjects`, `seedFiles`) in `src/App.jsx` provide the current realistic demo baseline. Persistence is client-side capability based; there is no application backend or REST API in this repository.
- **Error containment:** `src/components/AppErrorBoundary.tsx` wraps the whole application and provides a reloadable fallback instead of a blank screen.

**Important architecture constraint:** this is a connected client application/prototype, but it does **not** include an LLM API, server routes, file-processing service, or database schema. Do not claim generated AI content, uploaded files, or research citations are server-persisted unless adding that infrastructure.

## File Structure
```text
index.html                           # HTML shell, SEO metadata, Google font imports, injected GenMB auth capability
package.json                         # Vite/React/Tailwind and UI dependency scripts
vite.config.ts                       # Enables React and Tailwind Vite plugins

src/
├── main.tsx                         # Imports fallback/storage/styles and mounts App inside AppErrorBoundary
├── App.jsx                          # Main ORION application: routes, layouts, views, seed data, interaction logic
├── storageFallback.ts               # localStorage-compatible fallback for window.genmb.kv
├── types/
│   └── genmb.d.ts                   # Global TypeScript declarations for GenMB auth, KV, and web/news search
├── components/
│   └── AppErrorBoundary.tsx         # Top-level crash fallback with error reporting and reload action
└── styles/
    └── main.css                     # Tailwind import, ORION tokens, glass surfaces, animated atmosphere, accessibility motion override

tsconfig.app.json                    # Strict browser TypeScript settings for src/
tsconfig.node.json                   # TypeScript settings for Vite config
tsconfig.json                        # Project references
```

## Key Features

### Application shell and navigation
- ORION brand identity and workspace shell are implemented in `src/App.jsx`.
- Main workspace navigation covers:
  - `/dashboard` — overview and quick actions.
  - `/chat` — multi-turn chat workspace.
  - `/projects` — project management area.
  - `/files` — file workspace.
  - `/workspaces` — workspace grouping/entry point.
  - `/create` — output-type selection.
  - `/roadmap` — goal-to-roadmap builder.
  - `/workflows` — visual process/workflow builder.
  - `/research` — normal/deep research experience.
  - `/code` — coding workspace.
  - Settings/saved/auth-related routes and overlays where exposed by the current UI.
- Navigation uses `HashRouter`; use `Link`/`NavLink`, not hard-coded full-page URLs.

### Dashboard and workspace data
- Dashboard is designed around “Good evening. What will we build today?” with actionable entry points for chat, creation, image generation, roadmaps, workflows, files, projects, and research.
- Existing seed models:
  - **Chat:** `{ id, title, updatedAt, messages[] }`
  - **Message:** `{ id, role: "user" | "assistant", content }`
  - **Project:** `{ id, name, description, progress, goals, milestones }`
  - **File:** `{ id, name, kind, size, summary }`
- Seed data is intentionally defined near the top of `src/App.jsx` and acts as demo/fallback content.

### Chat
- Supports conversation history, new-chat behavior, message display, composer actions, and demo/streaming-style response UX.
- Composer affordances include attachment, image, research, deep research, create, tools, voice, and send.
- Assistant output is structured for useful visible reasoning artifacts such as headings, lists, code-oriented content, plans, and next steps.
- There is no real model provider in the repository. Keep demo responses explicit as demo behavior and isolate a future provider behind a service interface rather than calling model APIs directly from components.

### Projects, files, creation, and planning
- Projects present scoped context such as goals, milestones, progress, notes, conversations, and artifacts.
- File workspace presents supported concepts including PDF, DOCX, TXT, CSV, XLSX, images, and source code, with analysis/summarization/question affordances.
- Create area exposes document, report, essay, resume, study notes, guide, research report, image, roadmap, workflow, and code options through `createTypes`.
- Roadmaps follow the intended sequence: **Goal → Phases → Skills → Tasks → Resources → Milestones → Projects → Evaluation**.
- Workflows visualize operational stages, such as research through monitoring and improvement.

### Auth and persistence capability surface
The GenMB SDK interface declared in `src/types/genmb.d.ts` provides:
- **Auth:** `ready`, Google `signIn`, email/password sign-up and sign-in, magic links, password reset, `signOut`, `getUser`, and `onAuthStateChange`.
- **KV:** `get`, `set`, `delete`, and prefix `list`.
- **Search:** `web(query, options?)` and `news(query, options?)`.

`useAuth()` must tolerate capability failures: it already catches initialization errors and treats the visitor as signed out. Any new capability usage should have similarly friendly unavailable/error states.

## Design Guidelines
- **Theme:** premium midnight/near-black interface with electric blue highlights and cool-white text.
- **Tokens:** use semantic Tailwind token classes backed by `src/styles/main.css`, especially `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, and `text-muted-foreground`. Avoid introducing arbitrary colors when an existing token applies.
- **Core palette:** background `#050812`; primary blue `#55a9ff`; foreground `#edf5ff`; success `#51d5a1`; destructive `#ff6c80`.
- **Surfaces:** use `.glass` for elevated translucent panels and `.surface` for restrained workspace panels. Borders are intentionally low contrast.
- **Identity:** rounded cards and controls (default radius `1.1rem`), subtle inner highlights, blue glow on primary actions, generous spacing, minimal visual clutter.
- **Atmosphere:** `.orion-atmosphere`, `.orb-*`, and `.light-streak` create low-opacity animated grid, glow, and streak effects. Keep any new background motion GPU-friendly (`transform`/`opacity`) and visually subordinate.
- **Typography:** Manrope for UI; DM Mono for code, IDs, technical metadata, and machine-like labels.
- **Accessibility:** use the shared `.focus-ring` pattern on interactive controls; preserve semantic buttons/inputs and `aria-live` for transient status. `prefers-reduced-motion` is handled globally in `src/styles/main.css`; do not bypass it.
- **Responsive behavior:** support a 320px minimum width, compact mobile navigation/layouts, and progressively richer multi-column workspace layouts on tablet and desktop.

## App Flow
1. **Visitor lands on ORION:** the landing experience communicates the “One Intelligence. Infinite Possibilities.” proposition and directs users to start or explore capabilities.
2. **Authentication resolution:** `useAuth()` waits for `window.genmb.auth.ready()`. Signed-in UI can show user context; unauthenticated users continue through the public/demo experience or sign in.
3. **Dashboard entry:** users select a quick action or navigate through the sidebar.
4. **Conversation to output:** users start/select a chat, provide a goal, choose optional research/create/tool modes, then receive a structured result and next-action path.
5. **Project context:** users create/select a project to organize goals, milestones, conversations, files, and generated work.
6. **Specialized workspaces:** research, roadmap, workflow, code, files, and create routes provide task-specific entry points while maintaining the same visual system.

Key edge cases:
- Auth SDK may be unavailable or fail; do not crash the workspace.
- KV may be unavailable; `src/storageFallback.ts` only works when `window.genmb` exists but has no `kv`. Guard direct `window.genmb` access if changing bootstrapping assumptions.
- Search results must be rendered as returned; never invent citations, URLs, sources, or publication metadata.
- File upload UI must validate type/size before any future processing integration and clearly explain unavailable analysis.
- Async actions need pending, success, empty, error, and retry states; use existing toast/status patterns in `src/App.jsx`.

## Conventions
- Keep route-level UI and existing shared helpers in `src/App.jsx` until a feature is large enough to extract coherently; do not create generic abstraction layers prematurely.
- Use PascalCase for React components, camelCase for functions/state, and kebab-case stable IDs (`"orion-launch"`, `"product-strategy"`).
- Use the `cn(...values)` helper in `src/App.jsx` for conditional class strings.
- Prefer existing `PrimaryButton`, `SecondaryButton`, `OrionMark`, toast behavior, and `.focus-ring` instead of duplicating button/brand patterns.
- Use Lucide icons already imported from `lucide-react`; align icon size and stroke weight with surrounding controls.
- Keep visible AI content action-oriented: summaries, plans, evidence, outputs, and follow-up options—not hidden chain-of-thought.
- Store user/workspace data under clearly namespaced keys if using KV. The fallback prefixes browser storage keys with `orion:kv-fallback:` automatically; pass logical keys only.
- Do not add secrets to frontend code or `index.html`. A future model/file backend must use server-side environment variables and authenticated API endpoints.

### Adding a page or feature
1. Add the route and navigation entry in `src/App.jsx`, using a hash route path.
2. Build the view with semantic markup, token-based Tailwind classes, and existing surface/button primitives.
3. Add responsive and keyboard behavior before polishing animation.
4. If data must persist, define a small typed model and a namespaced KV adapter; retain seed/empty states for capability failures.
5. For external AI, file analysis, or search work, create an isolated client/service boundary with explicit loading and safe error handling—never embed provider keys or provider-specific logic throughout route components.

## Platform (GenMB)

This app is built and hosted on GenMB.

**Runtime:** Browser sandbox (iframe) or Cloud Run. No Node.js server — all code runs client-side unless `backend/` exists.

**Dependencies:** CDN-only (esm.sh, cdn.tailwindcss.com, unpkg). Use ES module imports with full CDN URLs. No `npm install` at runtime.

**Entry point:** `index.html` must include all CDN script tags. Tailwind via CDN with inline config.

**Built-in services (relative API paths only, never hardcode domains):**
- `/api/ai/completion` — AI proxy | `/api/data/{appId}/*` — PostgreSQL (DataConnect SDK)
- `/api/storage/{appId}/*` — File uploads (GCS) | `/api/auth/google/*` — Google OAuth
- `/api/contact/submit` — Contact form | SDKs: `window.genmb.db`, `.storage`, `.auth`

**File structure:** `index.html` (entry), `src/` (source), `styles/` (CSS), `backend/` (optional FastAPI), `CLAUDE.md` (this file).

**Cannot:** Install npm packages at runtime, access filesystem, make direct server-side calls from frontend, modify infra.
