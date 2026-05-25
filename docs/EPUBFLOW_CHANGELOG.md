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

## v0.2.0-pdf-execution-plan (2026-05-23)

### Scope
- Lock execution path for first real conversion capability: **EPUB -> PDF**.
- Keep MVP deployment strategy stable while introducing backend runtime incrementally.

### Deliverables
- New implementation plan doc:
  - `docs/EPUB_TO_PDF_EXECUTION_PLAN.md`
- Defined rollout order:
  - upload pipeline
  - conversion job lifecycle
  - downloadable result delivery
  - observability and failure handling

### Notes
- `EPUBFLOW_STATIC_ONLY=true` remains default for production stability until conversion worker is ready.
- Functional rollout should be enabled in staged manner (dev -> preview -> production).

## v0.3.0-epub-pdf-mvp-implementation (2026-05-23)

### Implemented
- Added real EPUB -> PDF conversion workflow for MVP:
  - Upload `.epub` (50MB max)
  - Conversion state lifecycle
  - Download generated PDF
- Added conversion APIs:
  - `POST /api/conversions/epub-to-pdf`
  - `GET /api/conversions/[jobId]`
  - `GET /api/conversions/[jobId]/download`
- Added detailed user-facing state UI in homepage core functional area.

### Conversion engine
- Local mode:
  - Uses `ebook-convert` directly when executable is available.
  - Temporary files are auto-cleaned after 1 hour.
- Remote mode (production-compatible):
  - Added remote converter forwarding support with:
    - `EPUBFLOW_CONVERTER_API_URL`
    - `EPUBFLOW_CONVERTER_API_KEY`
  - Website routes proxy requests to external Calibre service.

### New standalone converter service
- Added `services/calibre-converter` with API-compatible endpoints:
  - `POST /v1/conversions/epub-to-pdf`
  - `GET /v1/conversions/:jobId`
  - `GET /v1/conversions/:jobId/download`
  - `GET /healthz`
- Includes:
  - 50MB validation
  - 1-hour TTL cleanup
  - timeout protection
  - user-friendly error mapping

### Docs
- Added deployment guide:
  - `docs/CALIBRE_DEPLOYMENT_GUIDE.md`

## v0.3.1-p0-privacy-and-download-fix (2026-05-23)

### P0-2 Privacy UX (Required)
- Added mandatory privacy/security notice directly near EPUB upload area:
  - "Private by default..."
  - encrypted upload
  - auto-delete after conversion
  - no AI training usage
  - DRM not supported
- Added both EN + ZH copy for clarity.
- File:
  - `src/components/epub/epub-pdf-workbench.tsx`

### Conversion Flow Reliability
- Fixed remote-mode download URL normalization:
  - status API now always returns website-side download proxy URL
  - prevents 404 when remote converter returns relative `/v1/...` paths
- File:
  - `src/app/api/conversions/[jobId]/route.ts`

### Converter Runtime Compatibility
- Fixed Render/root runtime sandbox failure:
  - set `QTWEBENGINE_DISABLE_SANDBOX=1`
  - set `QTWEBENGINE_CHROMIUM_FLAGS=--no-sandbox`
- Added converter diagnostics in health endpoint and failure logs for faster debugging.
- Files:
  - `services/calibre-converter/server.mjs`
  - `src/lib/epub-pdf/job-store.ts`

## v0.3.2-trust-privacy-loop-plan-a (2026-05-25)

### Scope
- Execute Trust & Privacy Plan A for static + MVP conversion experience.
- Make privacy promises visible, navigable, and policy-backed.

### Implemented
- Homepage trust chips refreshed in hero and aligned with privacy-first language:
  - Private by default
  - Auto-delete in 1 hour
  - No AI training
  - DRM not supported
- Added trust deep links from homepage/upload flow:
  - Privacy Policy
  - Data Retention
- Rebuilt EPUB upload workbench trust copy (EN + ZH) with clear legal anchors.

### Legal & Navigation
- Added new legal pages:
  - `src/app/[locale]/(marketing)/(legal)/refund/page.tsx`
  - `src/app/[locale]/(marketing)/(legal)/data-retention/page.tsx`
- Added routes:
  - `RefundPolicy = '/refund'`
  - `DataRetention = '/data-retention'`
  - File: `src/routes.ts`
- Expanded footer legal section with:
  - Data Retention
  - Refund Policy
  - Contact Support
  - File: `src/config/footer-config.tsx`

### Route Accessibility
- Unblocked contact page from marketing route middleware blocklist.
  - File: `src/middleware.ts`

### Verification
- Production build passed:
  - `pnpm build`
- New pages confirmed in build output:
  - `/[locale]/refund`
  - `/[locale]/data-retention`

### Deployment Notes (Vercel)
- If Vercel project is connected to GitHub and production branch is `main`, this release requires **no manual code push** after merge.
- Required operator action:
  - Open Vercel `Deployments`
  - Confirm latest `main` deployment is `Ready` (green)
  - Only click `Redeploy` if latest deployment is failed/stuck.

## v0.4.0-p1-operations-seo-support (2026-05-25)

### Operability Metrics
- Added converter-side metrics ingestion and aggregation:
  - `POST /v1/metrics`
  - `GET /v1/metrics`
- Metrics storage uses daily JSONL files with retention cleanup:
  - `metrics-YYYY-MM-DD.jsonl`
  - retention window: 30 days
- Added web proxy endpoint:
  - `src/app/api/metrics/route.ts`
- Added admin metrics page:
  - `src/app/[locale]/(protected)/admin/metrics/page.tsx`
- Added admin sidebar entry and route:
  - `Routes.AdminMetrics`
  - `src/config/sidebar-config.tsx`

### Conversion Funnel Instrumentation
- Workbench now reports web-side events:
  - `upload_started`
  - `download_started`
- Converter reports server-side conversion events:
  - `upload_rejected`
  - `convert_started`
  - `convert_succeeded`
  - `convert_failed`

### Support Flow
- Upload area now includes direct support entry.
- Conversion error state now includes:
  - error code display
  - `Retry` action
  - `Contact support` mail link with `job_id` in subject
- Footer now shows direct support email:
  - `support@epubflow.com`

### SEO Baseline Fixes
- Simplified `robots` crawl rules and kept sitemap declaration.
- Replaced sitemap generation with only currently reachable routes:
  - `/`, `/pricing`, `/contact`, `/privacy`, `/terms`, `/cookie`, `/refund`, `/data-retention`
- Fixed Chinese metadata title/description in `messages/zh.json` to avoid SERP乱码.

### Docs
- Added:
  - `docs/P1_OPERATIONS_SEO_SUPPORT_IMPLEMENTATION.md`

## v0.4.1-metrics-accuracy-and-download-fail-tracking (2026-05-25)

### Data Accuracy Fixes
- Added missing `download_failed` event reporting in workbench download flow.
- Download action now uses fetch/blob with explicit failure capture to support reliable telemetry.
- Added converter metrics aggregation fields:
  - `rejectedUploads`
  - `acceptanceRate`
  - `downloadStarted`
  - `downloadFailed`
- Updated admin metrics page cards to expose funnel quality and download failure signal.

### Metrics Reliability Fixes
- `/api/metrics` no longer returns pseudo-success when converter is not configured.
- Missing converter endpoint now returns `503 CONVERTER_NOT_CONFIGURED`.
- Forwarding failures from web -> converter now return explicit non-2xx responses.
- Frontend metrics client now warns on non-2xx and network exceptions instead of fully silent failure.

### UX/Content Correction
- Fixed upload privacy block Chinese text rendering in workbench.

### SEO Guardrail
- Kept sitemap route scope unchanged and documented that anchor routes (`/#faqs`, `/#features`, etc.) must not be added to sitemap.
