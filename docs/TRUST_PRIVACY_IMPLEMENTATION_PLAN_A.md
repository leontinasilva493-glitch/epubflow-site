# Trust & Privacy Plan A (Implemented)

## Goal
- Build a visible trust/privacy loop around EPUB upload and conversion.
- Keep messaging consistent across upload UI, legal pages, and footer navigation.

## Implementation Checklist
1. Upload area trust messaging (P0)
- Add clear privacy promise near upload CTA.
- Explicitly state:
  - private by default
  - auto-delete timeline
  - no AI training usage
  - DRM not supported

2. Link trust message to legal details (P0)
- Add direct links from upload area to:
  - Privacy Policy
  - Data Retention page

3. Add missing legal pages (P0/P1)
- Add Refund Policy page.
- Add Data Retention page with lifecycle details.

4. Footer legal completion (P1)
- Add entry points in footer:
  - Data Retention
  - Refund Policy
  - Contact Support

5. Route accessibility check (P1)
- Ensure `contact` route is reachable (not blocked by middleware).

6. Build verification (P0)
- Run production build and confirm no compile/type errors.

## Execution Status
- Completed:
  - Upload area trust copy and legal links integrated.
  - New legal pages added:
    - `/[locale]/refund`
    - `/[locale]/data-retention`
  - Footer legal links expanded.
  - `contact` route unblocked in middleware.
  - Build validated successfully (`pnpm build` passed).

## Notes
- This phase focuses on trust/privacy UX and policy visibility.
- Conversion backend/security hardening remains tracked in functional roadmap items.
