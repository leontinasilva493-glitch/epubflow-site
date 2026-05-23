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

### Review Checklist (Completed)
- Brand metadata no longer shows MkSaaS default title/description.
- Template-heavy nav/footer replaced by EPUBFlow-focused IA.
- Non-launch template marketing pages no longer publicly reachable from normal routing path (redirected by middleware).
- Homepage core functional zones are preserved for future backend integration.

### Next Version (Planned)
- Connect real upload/conversion workflow.
- Replace placeholder branding assets (`logo`, `og`) with finalized EPUBFlow assets.
- Optional repository slimming (remove unused template modules/routes) after first stable deploy.

