# NexFlow — Local Development Setup

A step-by-step guide to running the full NexFlow stack in VS Code on your own machine.

---

## System Requirements

Install these tools before you begin:

| Tool | Minimum Version | Download |
|------|----------------|---------|
| Node.js | 20 (LTS) or higher | https://nodejs.org |
| pnpm | 10 or higher | `npm install -g pnpm@latest` |
| PostgreSQL | 14 or higher | https://www.postgresql.org/download |
| Git | Any recent version | https://git-scm.com |
| Expo Go (mobile only) | Latest | App Store / Google Play |

> **Tip for VS Code users:** Install the **ESLint**, **Prettier**, and **TypeScript** extensions for the best editing experience.

---

## Step 1 — Get the code

### Option A — Download from Replit
In Replit, click the three-dot menu → **Download as zip** → extract to a folder on your machine.

### Option B — Git clone
If the project is connected to a GitHub repo:
```bash
git clone <your-repo-url> nexflow
cd nexflow
```

---

## Step 2 — Install dependencies

From the **project root** (where `pnpm-workspace.yaml` lives):

```bash
pnpm install
```

This installs all packages for every workspace in one go — the API server, web app, mobile app, shared libraries, and slide decks.

---

## Step 3 — Create the PostgreSQL database

Open a terminal and run:

```bash
psql -U postgres
```

Then inside the PostgreSQL shell:

```sql
CREATE DATABASE nexflow;
\q
```

> If your PostgreSQL uses a different username or has a password, adjust the connection string in Step 4 accordingly.

---

## Step 4 — Set environment variables

Create a file called `.env` inside `artifacts/api-server/`:

```bash
# artifacts/api-server/.env
```

Paste this content and fill in your values:

```env
# ── Required ──────────────────────────────────────────────────────────────────

# Port the API server listens on
PORT=8080

# Your local PostgreSQL connection string
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nexflow

# Secret used to sign session cookies (any long random string)
SESSION_SECRET=change-me-to-something-long-and-random

# ── AI Features (optional — app works with sample data without these) ──────────

# OpenAI — used for GPT-4o calls in enrichment, lead scoring, campaign builder
OPENAI_API_KEY=sk-...

# Anthropic — used for Claude validation and synthesis steps
ANTHROPIC_API_KEY=sk-ant-...

# Perplexity — used for live web research in the intel engines
PERPLEXITY_API_KEY=pplx-...

# Google Gemini — used for OCR, structured synthesis, and vision tasks
GEMINI_API_KEY=AIza...

# ── Optional services ─────────────────────────────────────────────────────────

# Resend — used for transactional email (e.g. notifications)
RESEND_API_KEY=re_...

# Investor data-room passcode (any string you choose)
INVESTOR_PASSCODE=demo1234
```

> **None of the AI keys are required to run the app.** Every AI feature falls back to realistic sample data when a key is missing, so the full UI is demoable without any third-party accounts.

---

## Step 5 — Push the database schema

This creates all tables in your local PostgreSQL database:

```bash
pnpm --filter @workspace/db run push
```

You should see a list of tables being created (contacts, companies, activities, deals, etc.). This only needs to run once, or again after schema changes.

---

## Step 6 — Start the services

Open **four separate terminals** in VS Code (`Ctrl+Shift+\`` to split). Run one command per terminal:

### Terminal 1 — API Server
```bash
PORT=8080 DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nexflow SESSION_SECRET=any-secret pnpm --filter @workspace/api-server run dev
```

Wait until you see:
```
Server listening   port: 8080
```

### Terminal 2 — Web App (NexFlow CRM)
```bash
PORT=5173 pnpm --filter @workspace/nexflow run dev
```

Open your browser at: **http://localhost:5173**

### Terminal 3 — Mobile App (optional)
```bash
EXPO_PUBLIC_DOMAIN=localhost:8080 pnpm --filter @workspace/mobile run dev
```

Scan the QR code with the **Expo Go** app on your phone. Both phone and computer must be on the same Wi-Fi network.

### Terminal 4 — Slide Decks (optional)
```bash
# Investor deck
PORT=5174 pnpm --filter @workspace/investor-deck run dev

# Company profile deck (run in a 5th terminal if you want both)
PORT=5175 pnpm --filter @workspace/company-profile-deck run dev
```

---

## Step 7 — Seed demo data

The API server seeds demo data automatically on first start if the database is empty. You will see this in the Terminal 1 logs:

```
[autoSeed] Seeding 45 contacts...
[autoSeed] Done.
```

If you ever want to reset to fresh demo data, drop and recreate the database (Step 3) then run the schema push (Step 5) and restart the API server.

---

## Quick-start with a `.env` loader (recommended)

Instead of typing the env vars into every terminal command, use a tool like **direnv** or simply create a shell script:

Create `start-api.sh` in the project root:

```bash
#!/bin/bash
export $(cat artifacts/api-server/.env | grep -v '#' | xargs)
pnpm --filter @workspace/api-server run dev
```

Then:
```bash
chmod +x start-api.sh
./start-api.sh
```

---

## VS Code: run everything with one click

Create `.vscode/tasks.json` in the project root:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "API Server",
      "type": "shell",
      "command": "PORT=8080 DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/nexflow SESSION_SECRET=any-secret pnpm --filter @workspace/api-server run dev",
      "group": "build",
      "presentation": { "panel": "dedicated", "reveal": "always" }
    },
    {
      "label": "Web App",
      "type": "shell",
      "command": "PORT=5173 pnpm --filter @workspace/nexflow run dev",
      "group": "build",
      "presentation": { "panel": "dedicated", "reveal": "always" }
    },
    {
      "label": "Mobile",
      "type": "shell",
      "command": "EXPO_PUBLIC_DOMAIN=localhost:8080 pnpm --filter @workspace/mobile run dev",
      "group": "build",
      "presentation": { "panel": "dedicated", "reveal": "always" }
    },
    {
      "label": "Start All",
      "dependsOn": ["API Server", "Web App"],
      "group": { "kind": "build", "isDefault": true }
    }
  ]
}
```

Then press `Ctrl+Shift+B` to start the API server and web app together.

---

## Signing in

The app ships with 5 demo personas — no password required. On the sign-in page click any persona pill to sign in instantly:

| Persona | Role |
|---------|------|
| Khalid Al-Otaibi | Senior Sales Executive |
| Layla Al-Sabah | Head of Sales, Gulf Region |
| Faisal Al-Harbi | CEO |
| Sara Al-Mansouri | CRM Operations Lead |
| Reem Al-Qahtani | Head of Marketing |

---

## Feature availability by configuration

| Feature | No keys needed | With AI keys |
|---------|---------------|-------------|
| Full UI and all screens | ✅ | ✅ |
| Demo data (contacts, deals, calls) | ✅ | ✅ |
| AI briefing and KPI cards | Sample data | Live AI |
| Enrichment engine | Sample results | Live multi-model research |
| Campaign builder AI | Sample copy | Live GPT/Claude generation |
| AI voice agents | UI only | Live Twilio/voice calls |
| Email notifications | Logged only | Live via Resend |
| Investor data room | ✅ (uses INVESTOR_PASSCODE) | ✅ |

---

## Troubleshooting

**`EADDRINUSE: address already in use`**
Another process is using the port. Either stop it or change the PORT value.

**`Cannot find module '@workspace/db'`**
Run `pnpm install` from the project root, then `pnpm --filter @workspace/db run push`.

**Web app shows blank page or API errors**
Make sure the API server (Terminal 1) started successfully before opening the web app. Check Terminal 1 for errors.

**Mobile can't connect to the API**
Ensure `EXPO_PUBLIC_DOMAIN` points to your machine's local IP (e.g. `192.168.1.x:8080`), not `localhost` — mobile devices on the same Wi-Fi need the LAN IP.

**Database push fails**
Double-check the `DATABASE_URL` connection string. Make sure PostgreSQL is running (`pg_ctl status` or check Services on Windows).

---

## Project structure (quick reference)

```
nexflow/
├── artifacts/
│   ├── api-server/        ← Express + Drizzle ORM backend (port 8080)
│   ├── nexflow/           ← React + Vite web CRM (port 5173)
│   ├── mobile/            ← Expo React Native mobile app
│   ├── investor-deck/     ← Investor slide deck
│   └── company-profile-deck/ ← Company profile slides
├── lib/
│   ├── db/                ← Shared PostgreSQL schema + Drizzle client
│   ├── api-spec/          ← OpenAPI spec (source of truth for API types)
│   └── api-client-react/  ← Generated React Query hooks
└── pnpm-workspace.yaml    ← Monorepo workspace definition
```
