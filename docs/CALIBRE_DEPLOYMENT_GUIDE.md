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

Start command:
- `npm install`
- `npm start`

Health check endpoint:
- `GET /healthz`

Main API:
- `POST /v1/conversions/epub-to-pdf` (multipart form with `file`)
- `GET /v1/conversions/:jobId`
- `GET /v1/conversions/:jobId/download`

---

## 2) Configure Vercel website env vars

In Vercel project settings, set:

- `EPUBFLOW_STATIC_ONLY=true`
- `NEXT_PUBLIC_BASE_URL=https://epubflow.org`
- `EPUBFLOW_CONVERTER_API_URL=https://<your-converter-domain>`
- `EPUBFLOW_CONVERTER_API_KEY=<same-secret-as-converter>`

Then redeploy `main`.

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
