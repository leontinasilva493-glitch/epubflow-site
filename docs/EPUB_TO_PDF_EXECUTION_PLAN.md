# EPUBFlow MVP Execution Plan: EPUB -> PDF

## 1. Goal

Ship a production-usable MVP for **EPUB to PDF** conversion with a stable user flow:

1. Upload EPUB
2. Start conversion
3. View status
4. Download PDF

Success criteria (MVP):
- Conversion success rate >= 90% on curated sample EPUB set
- Typical completion time <= 60s for normal-sized books
- Clear user-visible error message on failure

---

## 2. MVP Scope (In / Out)

In scope:
- Single-file EPUB upload
- One output format: PDF
- Async job processing (no blocking request)
- Result download link
- Basic progress/status

Out of scope (next versions):
- Batch conversion
- Advanced layout controls
- OCR / scanned content recovery
- User account billing/quotas

---

## 3. Recommended Architecture

## 3.1 Components
- Next.js web app (existing): upload UI + status UI + API gateway
- Object storage: store input EPUB + output PDF
- Database: store conversion jobs and file metadata
- Worker process: execute conversion asynchronously

## 3.2 Runtime split
- Vercel (web/API): lightweight orchestration endpoints only
- Worker (separate runtime, container/VM): heavy conversion task

Reason:
- PDF conversion can exceed serverless time/memory limits.
- Keeps website deployment stable while conversion scales independently.

---

## 4. Data Model (Minimal)

## 4.1 `conversion_jobs`
- `id` (uuid)
- `user_id` (nullable for anonymous MVP)
- `input_file_url`
- `output_file_url` (nullable)
- `target_format` (`pdf`)
- `status` (`pending|processing|success|failed`)
- `error_code` (nullable)
- `error_message` (nullable)
- `created_at`
- `updated_at`
- `started_at` (nullable)
- `finished_at` (nullable)

## 4.2 `conversion_files`
- `id` (uuid)
- `job_id` (fk)
- `kind` (`input|output`)
- `storage_url`
- `filename`
- `mime_type`
- `size_bytes`
- `created_at`

---

## 5. API Design (MVP)

## 5.1 `POST /api/conversions/epub-to-pdf`
Purpose:
- create job record
- upload/validate EPUB metadata
- enqueue worker task

Response:
- `jobId`
- initial `status`

## 5.2 `GET /api/conversions/:id`
Purpose:
- poll job status

Response:
- `status`
- `progress` (optional in MVP, can be coarse)
- `downloadUrl` when success
- `errorMessage` when failed

---

## 6. Conversion Engine Strategy

Use a dedicated conversion backend implementation behind one interface:

- Interface: `convertEpubToPdf(inputPath, outputPath, options)`
- Adapter implementation can evolve without changing API/UI contract.

Execution rules:
- validate extension and MIME before queue
- set max input size (e.g. 50MB MVP)
- timeout per job (e.g. 120s)
- always write structured logs with `jobId`

---

## 7. Frontend MVP Flow

Homepage core functional area:
- Upload box -> format fixed to PDF (MVP)
- Convert button -> create job
- Status panel -> `pending/processing/success/failed`
- Success -> show `Download PDF`

UX requirements:
- Disable repeated submit while job active
- Preserve job state on refresh via `jobId` in URL/query/local storage
- Friendly error copy (not raw stack traces)

---

## 8. Environment Variables (MVP functional phase)

Required when enabling conversion:
- `EPUBFLOW_STATIC_ONLY=false`
- `NEXT_PUBLIC_BASE_URL=https://epubflow.org`
- `DATABASE_URL=...`
- `STORAGE_ENDPOINT=...`
- `STORAGE_BUCKET_NAME=...`
- `STORAGE_ACCESS_KEY_ID=...`
- `STORAGE_SECRET_ACCESS_KEY=...`
- `STORAGE_REGION=...`
- `STORAGE_PUBLIC_URL=...` (optional if signed URL flow used)

Keep optional for later:
- auth/social/payment/AI provider keys

---

## 9. Rollout Plan (Practical)

Phase A (Local dev):
1. Implement DB schema + migration
2. Implement create-job and get-job APIs
3. Build worker stub (mock success)
4. Wire homepage upload/status/download UI

Phase B (Preview env):
1. Connect real storage
2. Connect real conversion engine
3. Run sample book regression set
4. Add failure telemetry

Phase C (Production):
1. Enable `EPUBFLOW_STATIC_ONLY=false`
2. Start with low traffic / internal test
3. Monitor success rate, latency, error buckets
4. Open public CTA after stability threshold

---

## 10. Testing Checklist

Functional:
- valid EPUB converts successfully
- invalid EPUB fails with readable message
- large EPUB rejected with limit guidance
- refresh during processing keeps status continuity

Operational:
- worker crash -> job marked failed safely
- duplicate submit -> no duplicate heavy work (idempotency key or guard)
- output URL expires or protected appropriately

---

## 11. Next After PDF

Once EPUB -> PDF is stable, reuse same pipeline for:
- EPUB -> Kindle (AZW3/MOBI/PDF recommendation layer)
- EPUB -> Markdown (chapter split + assets extraction)
- EPUB -> TXT / DOCX

The key principle: keep one shared job/storage/status pipeline, only swap converter adapters per target format.
