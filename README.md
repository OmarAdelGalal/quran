# Beautiful Quran Recitations — Next.js Migration

This project was migrated from a Vite + React setup to **Next.js (App Router)** with **TypeScript** and **Tailwind CSS**.

## What I changed
- Added `next.config.js` and an `app/` directory using the Next App Router.
- Created `app/layout.tsx`, `app/page.tsx`, and `app/not-found.tsx`.
- Added a client `Providers` wrapper at `src/components/Providers.tsx` to host React Query, tooltips and toasters.
- Replaced Vite scripts with Next scripts in `package.json` and updated dependencies (added `next`, removed `react-router-dom` and Vite-related dev deps).
- Marked client components that use hooks with `"use client"`.
- Updated `tsconfig.node.json` to remove `vite.config.ts` from `include`.

## How to run (local)
1. Install dependencies:

   npm install

   Note: On Windows PowerShell you may see an execution policy error when running `npm` scripts. If that happens run PowerShell as Administrator and set:

   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

2. Start the dev server:

   npm run dev

3. Build for production:

   npm run build
   npm start

## Next steps (suggested)
- Run `npm install` locally (the environment here prevented running npm due to PowerShell policy).
- Start the dev server and report any runtime or type errors; I'll fix them and complete the migration (cleanup Vite files, update CI, and adjust any remaining imports).

If you want, I can continue and tidy up leftover Vite files and update the README with deployment tips (Vercel, Netlify, etc.).

