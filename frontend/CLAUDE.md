    # CLAUDE.md

    This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

    ## Overview

    Webrand is a single-page marketing site for a digital agency (React 18 + TypeScript + Vite + Tailwind + Framer Motion). All UI copy and content is in Russian. There is no backend, database, or test suite — it is a static front-end deployed to Vercel.

    ## Commands

    ```bash
    npm run dev      # Vite dev server on http://localhost:5173 (auto-opens browser)
    npm run build    # tsc -b (typecheck) then vite build -> dist/
    npm run preview  # serve the production build locally
    ```

    There is no linter or test runner configured. `npm run build` is the only correctness gate — it fails on TypeScript errors (`strict: true`), so run it after non-trivial changes. Note `noUnusedLocals`/`noUnusedParameters` are intentionally off, so unused variables will *not* fail the build.

    ## Architecture

    **Single-page app, content-driven.** `App.tsx` renders one `Home` component (a fixed vertical stack of section components: Hero → About → Services → Process → Portfolio → Partners → Careers → CTA, plus Navbar/Footer and two always-mounted modals). In-page navigation uses anchor links (`#about`, `#services`, etc.) scrolling to section `id`s — not router pages.

    **Nav links and section ids are a contract.** `nav` in `content.ts` lists `{ label, href }`; each `href` (e.g. `#careers`) must match an `id` on a section rendered in `Home`, or the link is dead. `Navbar` also drives its active-link underline from these via an `IntersectionObserver` over those ids (and reads scroll state with Framer's `useScroll`/`useMotionValueEvent`, not a raw scroll listener). When adding an anchored section, give it `scroll-mt-*` so its heading clears the fixed navbar.

    **Content lives in `src/data/content.ts`.** This is the single source of truth for all page data: services (with nested `SubService[]`), portfolio items, partners, vacancies, contacts, nav links. To change site copy or add a service/portfolio/vacancy entry, edit this file rather than the components — components map over these exported arrays. Type definitions (`Service`, `SubService`, `PortfolioItem`, `Vacancy`, `Partner`) are exported from here and imported elsewhere.

    **Routing is used only for portfolio filtering, not for distinct pages.** Every route (`/`, `/devprojects`, `/smmprojects`, `*`) renders the same `Home`. `Portfolio.tsx` reads `location.pathname` and maps it to a category filter (`pathToFilter` / `filterToPath`): `/devprojects` → "Разработка", `/smmprojects` → "SMM", everything else → "Все". Clicking a filter calls `navigate()` to change the URL, and landing directly on a filter URL auto-scrolls to the `#portfolio` section. Because routing is client-side only, `vercel.json` rewrites all paths to `/` so deep links work on refresh.

    **Modals are global via Context.** `ModalContext` (`src/context/ModalContext.tsx`) manages two independent modals — the contact form (`isOpen`/`open`/`close`) and the service-detail popup (`serviceDetail`/`openServiceDetail`/`closeServiceDetail`). Any component opens a modal via the `useModal()` hook; the modal components themselves (`ContactModal`, `ServiceDetailModal`) are mounted once in `Home` and render based on context state. `openServiceDetail` takes a `{ parent, sub }` payload so the detail modal knows which sub-service to show.

    ## Conventions

    - **Styling:** Tailwind utility classes only; no CSS modules or styled-components (`src/index.css` is just Tailwind directives + a few globals). The brand color scale (`brand.50`–`brand.900`) and custom animations (`float`, `marquee`, `gradient`, etc.) are defined in `tailwind.config.js` — reuse these rather than hardcoding hex values or new keyframes.
    - **One brand blue.** The scale is anchored to the logo blue `#2B5ED3` = `brand-600`. There is exactly one blue identity on the site — always use `brand-*` tokens (or `rgba(43,94,211,…)` for glows/shadows that can't be a token), never a raw or Tailwind-default blue. Note `text-${var}`-style dynamic class names are NOT picked up by Tailwind's JIT — map to literal class strings instead.
    - **Animation:** Framer Motion for scroll-reveal and transitions; the common pattern is `initial`/`whileInView` with `viewport={{ once: true }}`. `AnimatePresence` wraps modal mount/unmount.
    - **Icons:** `lucide-react`.
    - Components are presentational and read from `content.ts` + `useModal()`; keep new data in `content.ts` rather than inlining it in JSX.


    ## Local dev workflow

    A dev server is usually already running on http://localhost:5173 (started by me, with HMR). When you need to verify UI changes in a browser:

    - Do NOT run `npm run dev`, `npm run preview`, or `vite` yourself. Vite sees 5173 busy and silently starts on 5174/5175, so you'd be testing a different instance than the one I'm looking at.
    - Check that a server is live on 5173 first (`curl -s -o /dev/null -w "%{http_code}" http://localhost:5173` → 200, or `lsof -i :5173`). If it's up, point any headless browser at http://localhost:5173.
    - The server has HMR: after editing a file, just wait ~1s for hot-reload, then re-check 5173. No restart needed.
    - If nothing is listening on 5173, tell me to start it — do NOT spin up your own server on another port.
    - Never kill my dev server.

    `npm run build` is still fine to run for typechecking — it writes to dist/ and doesn't touch the dev server.