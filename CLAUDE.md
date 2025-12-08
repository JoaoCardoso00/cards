# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Vision

A flashcard app focused on delivering the best UX of any flashcard apps. Students of any subject (languages, medicine, etc.) can create decks, modify, and study with them. AI features will be added after core UX is solid.

## Commands

```bash
# Development (runs Next.js + Convex in parallel)
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
pnpm lint:fix          # in apps/web

# Type check
pnpm typecheck         # in apps/web

# Format
pnpm format

# Add shadcn/ui component
pnpm dlx shadcn@latest add <component> -c apps/web
```

## Architecture

Turbo monorepo for a flashcard study app with real-time capabilities.

### Monorepo Structure
- `apps/web` - Next.js 15 app with Convex backend
- `packages/ui` - Shared shadcn/ui component library (import as `@workspace/ui/components/<name>`)

### Backend (Convex)
Located in `apps/web/convex/`:
- `schema.ts` - Database schema with 8 tables: folders, tags, decks, deckTags, cards, cardProgress, studySessions, userStats
- `auth.ts` - Better Auth integration with Convex plugin and magic link authentication
- Uses Better Auth user IDs (strings) for userId fields, not Convex IDs

### Auth Flow
- Better Auth with magic link via Resend email service
- Client: `lib/auth-client.ts` exports `authClient`
- Hooks: `lib/auth-hooks.ts` exports `useSession`, `useUser`, `useIsAuthenticated`
- Server: `lib/auth-server.ts` for server-side auth checks
- Protected route: `/dashboard` (middleware checks session token)

## Database Schema

| Table | Purpose |
|-------|---------|
| `folders` | Hierarchical deck organization |
| `tags` | Reusable tag entities per user |
| `decks` | Deck metadata, public/private, fork tracking |
| `deckTags` | Many-to-many deck-tag relationships |
| `cards` | Simple front/back with text and/or image |
| `cardProgress` | SM-2 spaced repetition data per user/card |
| `studySessions` | Session tracking for analytics |
| `userStats` | Streaks & gamification stats |

## Key Design Decisions

- **Cards**: Simple front/back with optional text and/or image on each side (no cloze/multiple choice in MVP)
- **Spaced repetition**: SM-2 algorithm (cardProgress tracks easeFactor, interval, repetitions)
- **Public decks**: Fork/copy model - users copy public decks to their account to study
- **Organization**: Hierarchical folders + reusable tag entities (not just text labels)
- **Real-time**: Convex provides instant updates (important for AI-assisted editing later)

## MVP Roadmap

1. Core flashcard CRUD (decks, cards)
2. Study mode with configurable options (order, randomize)
3. Spaced repetition tracking
4. Daily streaks (Duolingo-style)
5. Export/import features

## Future Features (Post-MVP)

- AI auto-generation and study assistance
- Cloze deletion cards
- Multiple choice cards
- Image support for cards (kanji, diagrams, etc.)
- Mobile app with sync
