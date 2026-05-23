# EPUBFlow

EPUBFlow 官网初版（静态首页优先），基于 Next.js。

## 当前阶段

- 已上线目标：稳定展示静态营销首页（Hero、核心功能区、Features、FAQ、CTA）。
- 后端能力（Auth/支付/数据库/API）保留代码，但默认不启用，避免影响静态站部署稳定性。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 `http://localhost:3000`

## Vercel 稳定部署（静态模式）

当前默认是静态安全模式：

- `EPUBFLOW_STATIC_ONLY` 默认按 `true` 处理（不配置也生效）
- `/api/auth/*` 默认返回 `404`，避免因为缺失数据库/Auth环境变量导致部署失败

如需切换到完整 SaaS 模式，再配置以下变量并设置：

- `EPUBFLOW_STATIC_ONLY=false`
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`（或 `AUTH_SECRET`）
- 第三方登录变量（可选）：`GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`、`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

## 变更记录

- 详见：`docs/EPUBFLOW_CHANGELOG.md`
