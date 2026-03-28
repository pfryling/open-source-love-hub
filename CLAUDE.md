# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Community platform for discovering, sharing, and contributing to open source Lovable projects. Users can browse/submit projects, upvote, favorite, leave ratings/comments, and manage profiles. Built with the same stack as other projects in `~/code/`.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build
npm run lint       # ESLint
npm run preview    # Preview production build
```

No test suite currently exists.

## Architecture

Standard React 18 + TypeScript + Vite + Supabase stack (see global `~/CLAUDE.md` for shared architecture notes).

**Notable difference from other projects:** Uses React `contexts/` directory for Auth and Waitlist providers (instead of hooks-only auth pattern). Check `src/contexts/` before assuming auth state comes from a hook.

**Votes** are stored in `localStorage` — not in Supabase. The `VoteCounter` component reads/writes directly to localStorage, so votes don't sync across devices.

**Mock/demo data fallback**: The app renders mock data when Supabase is unavailable, so missing `.env` won't break the UI.

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

No `.env.example` exists in the repo yet — create `.env` directly.
