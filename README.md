# SeraphAI 🕊️

> Telegram WebApp AI assistant for chat, content generation (text, images, video), and smart document tools – built with Next.js + NestJS.

---

## ✨ What is SeraphAI

SeraphAI is an **AI assistant in the form of a Telegram WebApp**:

- 📱 works directly inside Telegram
- 💬 GPT‑style conversational chat
- 🎨 image and media generation (later stages)
- 📚 document tools (upload, Q&A, semantic search)
- 🔐 incognito mode and transparent data policy
- 💳 monetization via Telegram Stars / subscriptions

---

## 🧱 Tech Stack

**Frontend (WebApp)**

- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- shadcn/ui
- Telegram WebApp SDK

**Backend (API)**

- NestJS 10
- Node.js 20 LTS
- BullMQ + Redis (queues)
- Supabase Postgres + pgvector (memory / search)
- Cloudflare R2 (file storage)

**Other**

- pnpm workspaces (monorepo)
- Husky + lint-staged + commitlint (Conventional Commits)
- Prettier + ESLint (formatting & linting)

---

## 📁 Monorepo Structure

```text
seraphai/
  apps/
    web/         # Next.js WebApp (Telegram)
    api/         # NestJS backend (API + jobs)
  packages/
    ui/          # shared React components (future)
    config/      # shared configs (tsconfig/eslint/prettier)
  package.json   # root scripts, husky, lint-staged
  pnpm-workspace.yaml
  .nvmrc
  LICENSE
  README.md
```
