# EPUBFlow Website Changelog

## v0.1.0-static-launch (2026-05-23)

### Scope
- Initial static landing release for EPUBFlow based on PRD + design references.
- Goal: ship a clean, reviewable static homepage first; postpone real conversion logic to next versions.

### Core Changes
- Rebuilt homepage as a high-fidelity static SaaS landing:
  - Hero section with announcement, value proposition, CTAs, feature chips.
  - Product mockup section with reserved core zones:
    - upload area
    - reading-goal selector
    - recommended output
    - preview/progress panel
  - Feature grid, comparison section, bottom CTA, lightweight FAQ.
- Files:
  - `src/app/[locale]/(marketing)/(home)/page.tsx`

### P0/P1 Launch Fixes (Brand + Structure)
- Replaced default MkSaaS metadata with EPUBFlow metadata (EN/ZH).
  - `messages/en.json`
  - `messages/zh.json`
- Reworked website-level config for launch alignment:
  - default theme switched to `light`
  - social/support identity switched to EPUBFlow context
  - blog/docs/newsletter defaults constrained for static launch
  - `src/config/website.tsx`
- Simplified navbar to launch IA:
  - `Features / Pricing / FAQ / Docs`
  - removed template-heavy navigation structure for v1 static
  - `src/config/navbar-config.tsx`
  - `src/components/layout/navbar.tsx`
- Simplified footer links for launch:
  - `src/config/footer-config.tsx`
- Aligned routes for homepage anchor navigation:
  - `src/routes.ts`
- Added middleware guard to block template marketing routes and redirect back to locale home:
  - blocked prefixes include `/ai`, `/blog`, `/docs`, `/about`, `/contact`, `/waitlist`, `/changelog`, `/roadmap`, `/magicui`
  - `src/middleware.ts`

### Deployment/Runtime Notes
- Static build is successful (`pnpm build` passed during validation).
- Better Auth warning still appears in logs when default secret is used in local env; not blocking static homepage delivery but should be cleaned for production.

## v0.1.1-static-stability (2026-05-23)

### P0 Stability Fixes
- Auth API now runs in **static-only safe mode by default**:
  - `/api/auth/*` returns `404` unless `EPUBFLOW_STATIC_ONLY=false` is explicitly set.
  - This prevents Vercel deploy failures when database/auth env vars are not configured for static launch.
  - File: `src/app/api/auth/[...all]/route.ts`
- Better Auth secret now has explicit fallback to avoid default-secret runtime errors:
  - Uses `BETTER_AUTH_SECRET` or `AUTH_SECRET` first.
  - Falls back to a non-default placeholder string for static deployment stability.
  - File: `src/lib/auth.ts`
- OAuth providers are now conditionally enabled only when corresponding env vars exist:
  - GitHub provider requires both `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
  - Google provider requires both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
  - File: `src/lib/auth.ts`

### Impact
- Reduces Vercel “latest deployment failed” probability for static homepage phase.
- Keeps path open for future full SaaS mode by setting `EPUBFLOW_STATIC_ONLY=false` and completing backend env configuration.

### Review Checklist (Completed)
- Brand metadata no longer shows MkSaaS default title/description.
- Template-heavy nav/footer replaced by EPUBFlow-focused IA.
- Non-launch template marketing pages no longer publicly reachable from normal routing path (redirected by middleware).
- Homepage core functional zones are preserved for future backend integration.

### Next Version (Planned)
- Connect real upload/conversion workflow.
- Replace placeholder branding assets (`logo`, `og`) with finalized EPUBFlow assets.
- Optional repository slimming (remove unused template modules/routes) after first stable deploy.
