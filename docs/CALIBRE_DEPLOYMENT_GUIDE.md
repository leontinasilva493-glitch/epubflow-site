# EPUBFlow Calibre Deployment Guide

This guide deploys EPUBFlow in a production-compatible split:

- Website/UI: Vercel
- Converter backend (Calibre): Render/Railway/VPS
- DNS/CDN: Cloudflare
- Domain registrar: Spaceship

## 1) Deploy Calibre converter service

Service location in repo:
- `services/calibre-converter`

Runtime requirements:
- Node.js 20+
- Calibre installed with `ebook-convert` available in PATH

Env vars for converter service:
- `PORT=4000` (or platform default)
- `EPUBFLOW_CONVERTER_API_KEY=your-strong-secret` (recommended)
- `EPUBFLOW_CONVERTER_UPLOAD_TOKEN_SECRET=your-upload-token-secret`
- `EPUBFLOW_ALLOWED_ORIGINS=https://epubflow.org,https://www.epubflow.org`

`EPUBFLOW_CONVERTER_UPLOAD_TOKEN_SECRET` is used for browser direct uploads.
If it is omitted, the service falls back to `EPUBFLOW_CONVERTER_API_KEY` for
token verification. Prefer a separate secret in production.

Start command:
- `npm install`
- `npm start`

Health check endpoint:
- `GET /healthz`

Main API:
- `POST /v1/conversions/epub-to-pdf` (multipart form with `file`)
- `POST /v1/conversions/epub-to-{format}` for `pdf`, `azw3`, `mobi`, `txt`, `docx`
- `GET /v1/conversions/:jobId`
- `GET /v1/conversions/:jobId/download`

---

## 2) Configure Vercel website env vars

In Vercel project settings, set:

- `EPUBFLOW_STATIC_ONLY=true`
- `NEXT_PUBLIC_BASE_URL=https://epubflow.org`
- `EPUBFLOW_CONVERTER_API_URL=https://<your-converter-domain>`
- `NEXT_PUBLIC_EPUBFLOW_CONVERTER_API_URL=https://<your-converter-domain>`
- `EPUBFLOW_CONVERTER_API_KEY=<same-secret-as-converter>`
- `EPUBFLOW_CONVERTER_UPLOAD_TOKEN_SECRET=<same-secret-as-converter-upload-token-secret>`

Then redeploy `main`.

Why both converter URL variables exist:
- `EPUBFLOW_CONVERTER_API_URL` is server-only. Vercel uses it for metrics,
  admin checks, and fallback proxy calls.
- `NEXT_PUBLIC_EPUBFLOW_CONVERTER_API_URL` enables the browser to upload,
  poll, and download directly from the converter service. This is required on
  Vercel because Functions reject payloads above 4.5MB. Do not send
  `EPUBFLOW_CONVERTER_API_KEY` to the browser.

The browser first requests a short-lived upload token from:
- `GET /api/conversions/upload-token?format=pdf`

Then it calls the converter directly with:
- `x-upload-token: <short-lived-token>`

This keeps large EPUB uploads and converted downloads off Vercel Functions.

---

## 3) Domain routing with Spaceship + Cloudflare

Recommended:
1. In Spaceship, set nameservers to Cloudflare.
2. In Cloudflare DNS, point:
   - `epubflow.org` -> Vercel target
   - `www.epubflow.org` -> Vercel target
3. For converter, use a subdomain:
   - `convert.epubflow.org` -> converter host

Important Cloudflare rules:
- Disable caching for converter API paths:
  - `/v1/conversions/*`
- Keep static site caching enabled.

---

## 4) Security baseline

- Keep converter behind API key (`x-api-key`).
- Browser uploads must use short-lived `x-upload-token`, not the raw API key.
- Restrict CORS with `EPUBFLOW_ALLOWED_ORIGINS`.
- Keep upload limit at 50MB (already enforced).
- Files are temporary and auto-cleaned after 1 hour.
- DRM decryption is not implemented by design.

---

## 5) MVP verification

1. Open site homepage.
2. Upload a valid `.epub` (<50MB).
3. Click convert.
4. Status transitions:
   - uploading
   - reading_epub
   - converting
   - preparing_download
   - success
5. Download generated PDF successfully.

Large-file Vercel bypass check:
1. Configure `NEXT_PUBLIC_EPUBFLOW_CONVERTER_API_URL` in production.
2. Open browser DevTools Network tab.
3. Upload a 5MB+ EPUB.
4. Confirm the create request goes to `https://<converter-domain>/v1/conversions/...`,
   not `/api/conversions/...`.
5. Confirm status and download requests also go to the converter domain.
