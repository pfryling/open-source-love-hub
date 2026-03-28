# Open Source Love Hub

A community platform for discovering, sharing, and contributing to open source projects built with [Lovable](https://lovable.dev). Connect with passionate developers, showcase your work, and find projects worth contributing to.

## Features

- **Browse Projects** — Explore open source Lovable projects with tags, contributor counts, and update dates
- **Submit Your Project** — Add your own Lovable project to be discovered by the community
- **Vote & Favorite** — Upvote projects you find valuable and save favorites for later
- **Ratings & Comments** — Leave reviews and discuss projects directly on their detail pages
- **User Profiles** — Manage your submitted projects and profile info
- **Authentication** — Email-based sign-up/sign-in with Supabase Auth

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI primitives) |
| Backend / Auth | Supabase (PostgreSQL + Auth + Storage) |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Routing | React Router v6 |

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or [Bun](https://bun.sh))
- A [Supabase](https://supabase.com) project (for auth and database features)

### Local Setup

```sh
# 1. Clone the repository
git clone https://github.com/pfryling/open-source-love-hub.git
cd open-source-love-hub

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and add your Supabase project URL and anon key

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Find these values in your Supabase project under **Settings → API**.

> **Note:** The app falls back to demo/mock data when Supabase is unavailable, so you can explore the UI without a backend configured.

## Available Scripts

```sh
npm run dev        # Start development server (hot reload)
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/            # shadcn/ui primitives
│   ├── ProjectCard.tsx
│   ├── ProjectForm.tsx
│   ├── ProjectComments.tsx
│   ├── VoteCounter.tsx
│   └── ...
├── contexts/          # React context providers (Auth, Waitlist)
├── hooks/             # Custom React hooks
├── integrations/      # Supabase client setup
├── pages/             # Route-level page components
│   ├── Index.tsx      # Home page
│   ├── Projects.tsx   # Project listing
│   ├── ProjectDetail.tsx
│   ├── AddProject.tsx
│   ├── MyProjects.tsx
│   └── ...
└── types/             # TypeScript type definitions
```

## Contributing

Contributions are welcome! Here's how to get involved:

1. **Fork** this repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and ensure the app runs without errors (`npm run dev`)
4. **Lint your code**: `npm run lint`
5. **Commit** with a clear message: `git commit -m "Add: short description"`
6. **Push** your branch and open a Pull Request

Please keep PRs focused — one feature or fix per PR makes review easier.

### Good First Issues

- Improving mobile responsiveness
- Adding missing meta/OG tags for SEO
- Writing tests
- Improving accessibility (ARIA labels, keyboard navigation)

## Deployment

### Lovable (recommended)

Open the [Lovable project](https://lovable.dev/projects/24840d82-5b4f-4103-bdf9-9bc78496b7c4) and click **Share → Publish**.

### Netlify / Vercel

```sh
npm run build
# Deploy the contents of the `dist/` folder
```

Set the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables in your hosting provider's dashboard.

### Custom Domain

For custom domain setup, see the [Lovable custom domains guide](https://docs.lovable.dev/tips-tricks/custom-domain/).

## Known Limitations

- **Votes are stored in `localStorage`** — they do not sync across devices or browsers
- Mobile hamburger menu is not yet implemented
- Image uploads require Supabase Storage to be configured

## License

This project is open source. See [LICENSE](LICENSE) for details.
