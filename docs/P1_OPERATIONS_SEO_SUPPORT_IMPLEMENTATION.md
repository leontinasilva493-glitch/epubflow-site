# P1 Operations + SEO + Support Implementation (v0.4.0)

## Scope
- Implement operability baseline for EPUB conversion metrics.
- Fix SEO indexing baseline for current reachable pages.
- Add visible support paths in conversion failure flow and footer.

## 1) Operability Metrics

### Architecture
- Web app acts as a stateless proxy:
  - `POST /api/metrics`
  - `GET /api/metrics?days=7`
- Converter service is the persistent writer/reader:
  - `POST /v1/metrics` append one JSON line event
  - `GET /v1/metrics` return aggregated metrics
- Storage format:
  - daily files: `metrics-YYYY-MM-DD.jsonl`
  - retention: 30 days

### Implemented Events
- `upload_started` (from web)
- `upload_rejected` (from converter validation)
- `convert_started` (from converter)
- `convert_succeeded` (from converter)
- `convert_failed` (from converter)
- `download_started` (from web download click)

### Aggregation Output
- uploads
- success / failed
- successRate / failureRate
- avgDurationMs
- timeout and timeoutRate
- failureByType distribution

### Failure Type Mapping
- `drm_protected`
- `corrupted_file`
- `timeout`
- `converter_unavailable`
- `invalid_file`
- `oversized_file`
- `unknown`

## 2) SEO Baseline
- `robots` simplified to allow crawl and expose sitemap.
- `sitemap` trimmed to only currently reachable pages:
  - `/`
  - `/pricing`
  - `/contact`
  - `/privacy`
  - `/terms`
  - `/cookie`
  - `/refund`
  - `/data-retention`
- fixed Chinese metadata title/description in `messages/zh.json` top-level `Metadata`.

## 3) Support Path
- Upload/privacy block includes support entry:
  - `Having issues? Contact support`
- Conversion failure panel now includes:
  - error reason
  - error code
  - `Retry` action
  - `Contact support` mailto with `job_id` in subject
- Footer now displays direct support email:
  - `support@epubflow.com`

## Validation
- Build and type checks must pass via:
  - `pnpm build`

## Follow-up Fixes (Data Accuracy + Reliability)
- Implemented `download_failed` event reporting:
  - Download now uses fetch + blob flow, and reports `download_failed` on exceptions or non-2xx HTTP.
- Removed silent event-loss behavior:
  - `/api/metrics` now returns `503` when converter URL is not configured.
  - proxy forward failures now return non-2xx with explicit error payload.
  - frontend `trackEvent` now logs non-2xx / exceptions via console warnings.
- Improved funnel accuracy:
  - added `rejectedUploads`, `acceptanceRate`, `downloadStarted`, `downloadFailed` in metrics aggregation.
  - added matching cards on admin metrics page.
- SEO guardrail note:
  - `Routes` contains anchor paths (`/#faqs`, `/#features`, etc.); keep them out of sitemap.
