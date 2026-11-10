# Environment variables

The server loads `server/.env` and then root `.env` from `server/config/env.js`. Render configuration is in `render.yaml`; Vite reads `VITE_*` values at build time. Values below are names only; use placeholders in local configuration. “Required” means required by startup/config checks, not that a particular external feature is enabled. Optional scripts and tests have their own safety gates.

## Core runtime and frontend

| Variable | Required? | Purpose / expected format | Safe example |
|---|---|---|---|
| `MONGODB_URI` | Required | MongoDB connection URI; must name intended database. | `mongodb://127.0.0.1:27017/hussein_mboya_dev` |
| `JWT_SECRET` | Required | JWT signing key; production validator requires strong mixed-case numeric secret. | `<generate-a-long-random-secret>` |
| `JWT_EXPIRES_IN` | Optional / configuration-dependent | Authentication token lifetime or compatibility alias. | `<placeholder>` |
| `JWT_EXPIRE` | Optional / configuration-dependent | Authentication token lifetime or compatibility alias. | `<placeholder>` |
| `PORT` | Optional / configuration-dependent | HTTP listen port (integer). | `5000` |
| `NODE_ENV` | Optional / configuration-dependent | Runtime mode, e.g. development or production. | `development` |
| `DEPLOYMENT_ENV` | Optional / configuration-dependent | Deployment label used for database URI validation. | `<placeholder>` |
| `STAGING_DATABASE_NAME` | Optional / configuration-dependent | Approved isolated staging database name. | `<placeholder>` |
| `MONGODB_SERVER_SELECTION_TIMEOUT_MS` | Optional / configuration-dependent | Positive timeout in milliseconds, bounded by code. | `<placeholder>` |
| `MONGODB_STARTUP_MIGRATION_TIMEOUT_MS` | Optional / configuration-dependent | Positive timeout in milliseconds, bounded by code. | `<placeholder>` |
| `CLIENT_URL` | Optional / configuration-dependent | Exact browser origin(s); production uses HTTPS origins. | `http://localhost:5173` |
| `CLIENT_ORIGINS` | Optional / configuration-dependent | Exact browser origin(s); production uses HTTPS origins. | `http://localhost:5173` |
| `PLATFORM_HOST` | Optional / configuration-dependent | Platform hostname without scheme/path. | `example.invalid` |
| `ALLOW_SINGLE_TENANT_DEV_FALLBACK` | Optional / configuration-dependent | Boolean string feature/fallback gate; unsafe fallback forbidden in production. | `<placeholder>` |
| `VITE_API_URL` | Build-required in production | Frontend build-time public configuration; never put credentials here. | `https://api.example.invalid/api` |
| `VITE_PLATFORM_API_URL` | Build-required in production | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |
| `VITE_PLATFORM_MODE` | Optional / configuration-dependent | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |
| `VITE_SOCKET_URL` | Optional / configuration-dependent | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |
| `VITE_PLATFORM_HOST` | Optional / configuration-dependent | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |
| `VITE_TENANT_SLUG` | Optional / configuration-dependent | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |
| `VITE_PUBLIC_TENANT_SLUG` | Optional / configuration-dependent | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |
| `VITE_PUBLIC_TENANT_KEY` | Optional / configuration-dependent | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |
| `VITE_SITE_URL` | Optional / configuration-dependent | Frontend build-time public configuration; never put credentials here. | `<placeholder>` |

## Provider, encryption, and optional integrations

| Variable | Purpose / notes | Safe placeholder |
|---|---|---|
| `ACCOUNT_CACHE_TTL_MS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `AI_MODEL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `AI_RATE_LIMIT_MAX` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `AI_RATE_LIMIT_WINDOW_MS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ALLOW_AGENT_REGISTRATIONS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ALLOW_ATLAS_DEMO_SEED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ALLOW_GLOBAL_MPESA_FALLBACK` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ALLOW_REGISTRATIONS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `AT_API_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `AT_SENDER_ID` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `AT_USERNAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `BACKGROUND_JOB_RETENTION_DAYS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `BANK_ACCOUNT_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `BANK_ACCOUNT_NUMBER` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `BANK_BRANCH` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `BANK_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `BANK_SWIFT_CODE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `CLOUDINARY_API_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `CLOUDINARY_API_SECRET` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `CLOUDINARY_CLOUD_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `COMPANY_ADDRESS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `COMPANY_CITY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `COMPANY_COUNTRY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `COMPANY_LOGO` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `COMPANY_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `COMPANY_WEBSITE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DATA_RETENTION_INTERVAL_MS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_BOOKING_DEPOSIT_PERCENTAGE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_COMMISSION_RATE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_CURRENCY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_CURRENCY_SYMBOL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_LANGUAGE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_PUBLIC_TENANT_SLUG` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_TAX_RATE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_TENANT_ID` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `DEFAULT_TIMEZONE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `EMAIL_FROM_ADDRESS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `EMAIL_FROM_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ENABLE_BANK_TRANSFER` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ENABLE_MPESA` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ENABLE_PAYPAL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ENABLE_STRIPE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ETIMS_ADAPTER_TOKEN` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ETIMS_ADAPTER_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `ETIMS_CREDENTIAL_ENCRYPTION_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `FACEBOOK_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `GIT_COMMIT` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `INSTAGRAM_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `JWT_EXPIRES` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MAIL_FROM_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MAINTENANCE_MODE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MFA_DEV_MODE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MFA_ENABLED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_CALLBACK_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_CONSUMER_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_CONSUMER_SECRET` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_ENVIRONMENT` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_INITIATOR_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_PASSKEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_PRODUCTION_BASE_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_PRODUCTION_CALLBACK_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_SANDBOX_BASE_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_SANDBOX_CALLBACK_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_SECURITY_CREDENTIAL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `MPESA_SHORTCODE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `OPENAI_API_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `OPERATIONAL_RECORD_RETENTION_DAYS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRIVACY_REQUEST_RETENTION_DAYS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRODUCTION_BACKUP_VERIFIED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRODUCTION_ETIMS_VERIFIED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRODUCTION_MONITORING_VERIFIED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRODUCTION_PAYMENT_VERIFIED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRODUCTION_READINESS_RUNTIME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRODUCTION_RESTORE_TESTED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PRODUCTION_WEBHOOKS_VERIFIED` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PUBLIC_TENANT_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `PUBLIC_TENANT_SLUG` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `RENDER_GIT_COMMIT` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `REQUIRE_EMAIL_VERIFICATION` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `REQUIRE_PHONE_VERIFICATION` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `RESEND_API_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `RESEND_FROM_EMAIL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `RESEND_FROM_NAME` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `SEO_DESCRIPTION` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `SEO_TITLE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `STRIPE_SECRET_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `STRIPE_WEBHOOK_SECRET` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `SUBSCRIPTION_GRACE_PERIOD_DAYS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `SUPPORT_EMAIL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `SUPPORT_PHONE` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `TEST_DEMO_SEED_PASSWORD` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `TWITTER_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `WEBHOOK_DELIVERY_RETENTION_DAYS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `WEBHOOK_SECRET_KEY` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `WEBHOOK_TIMEOUT_MS` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `WHATSAPP_ACCESS_TOKEN` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `WHATSAPP_API_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |
| `YOUTUBE_URL` | Referenced by source or deployment template; optional/integration-specific. Check `server/.env.example`, `render.yaml` and the complete reference index for consumers. | `<configure-through-secret-store>` |

## Seed, repair, and test-only variables

These names are consumed by seed/repair/test scripts rather than required by normal web startup. Many are confirmation flags; inspect the particular script and target database before use.

| Variable | Typical use |
|---|---|
| `ADMIN1_EMAIL` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN1_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN2_EMAIL` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN2_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN_EMAIL` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN_NAME` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN_PHONE` | Script/test configuration or demo/test data; verify its exact consumer. |
| `ADMIN_TENANT_ID` | Script/test configuration or demo/test data; verify its exact consumer. |
| `APPLY_HUSSEINDB_CATALOGUE_REPAIR` | Script/test configuration or demo/test data; verify its exact consumer. |
| `APPLY_ROLE_NORMALIZATION` | Script/test configuration or demo/test data; verify its exact consumer. |
| `APPLY_TENANT_ITINERARY_REPAIR` | Script/test configuration or demo/test data; verify its exact consumer. |
| `BOOTSTRAP_ADMIN_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `BOOTSTRAP_SUPERADMIN_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_DEMO_ACCOUNT_MIGRATION` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_DEMO_DATA_REPAIR` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_DEMO_PASSWORD_RESET` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_DEMO_RESET` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_ORPHAN_STAFF_MIGRATION` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_RESET` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_TENANT_HOMEPAGE_REPAIR` | Script/test configuration or demo/test data; verify its exact consumer. |
| `CONFIRM_TEST_SEED` | Script/test configuration or demo/test data; verify its exact consumer. |
| `DEMO_API_BASE_URL` | Script/test configuration or demo/test data; verify its exact consumer. |
| `DEMO_API_REPORT_PATH` | Script/test configuration or demo/test data; verify its exact consumer. |
| `DEMO_SEED_MODE` | Script/test configuration or demo/test data; verify its exact consumer. |
| `DEMO_SMOKE_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `DEMO_TEST_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `FIRST_TENANT_TEST_MONGODB_URI` | Script/test configuration or demo/test data; verify its exact consumer. |
| `HEALTH_TEST_MONGODB_URI` | Script/test configuration or demo/test data; verify its exact consumer. |
| `RUN_DATABASE_INTEGRATION_TESTS` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_ADMIN_EMAIL` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_ADMIN_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_AGENT_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_CUSTOMER_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_DEMO_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_FINANCE_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_GUIDE_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SEED_MANAGER_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SUPERADMIN_EMAIL` | Script/test configuration or demo/test data; verify its exact consumer. |
| `SUPERADMIN_PASSWORD` | Script/test configuration or demo/test data; verify its exact consumer. |
| `TENANT_ID` | Script/test configuration or demo/test data; verify its exact consumer. |
| `TENANT_NAME` | Script/test configuration or demo/test data; verify its exact consumer. |
| `TENANT_PLAN_BUSINESS_PRICE_KES` | Script/test configuration or demo/test data; verify its exact consumer. |
| `TENANT_PLAN_ENTERPRISE_PRICE_KES` | Script/test configuration or demo/test data; verify its exact consumer. |
| `TENANT_PLAN_PROFESSIONAL_PRICE_KES` | Script/test configuration or demo/test data; verify its exact consumer. |
| `TENANT_PLAN_STARTER_PRICE_KES` | Script/test configuration or demo/test data; verify its exact consumer. |
| `TENANT_SLUG` | Script/test configuration or demo/test data; verify its exact consumer. |

## Complete source reference index

The table lists environment identifiers referenced directly by first-party JS/JSX, plus variables in the server template. It includes names only, never configured values.
- `ACCOUNT_CACHE_TTL_MS` — `server/services/operationalAccountingService.js`
- `ADMIN1_EMAIL` — `server/scripts/createGlobalToursAdmins.js`
- `ADMIN1_PASSWORD` — `server/scripts/createGlobalToursAdmins.js`
- `ADMIN2_EMAIL` — `server/scripts/createGlobalToursAdmins.js`
- `ADMIN2_PASSWORD` — `server/scripts/createGlobalToursAdmins.js`
- `ADMIN_EMAIL` — `server/scripts/createAdmin.js`
- `ADMIN_NAME` — `server/scripts/createAdmin.js`
- `ADMIN_PASSWORD` — `server/scripts/createAdmin.js`
- `ADMIN_PHONE` — `server/scripts/createAdmin.js`
- `ADMIN_TENANT_ID` — `server/scripts/createAdmin.js`
- `AI_MODEL` — `server/config/env.js`
- `AI_RATE_LIMIT_MAX` — `server/middleware/aiRateLimiter.js`
- `AI_RATE_LIMIT_WINDOW_MS` — `server/middleware/aiRateLimiter.js`
- `ALLOW_AGENT_REGISTRATIONS` — `server/services/settingsService.js`
- `ALLOW_ATLAS_DEMO_SEED` — `server/scripts/reconcileDemoLoginAccounts.js`, `server/scripts/repairTenantHomepages.js`, `server/tests/completeTestDemoSeedSafety.test.js` and 1 more
- `ALLOW_GLOBAL_MPESA_FALLBACK` — `server/scripts/production-readiness-check.js`, `server/tests/completeTestDemoSeedSafety.test.js`, `server/tests/firstTenantAcceptance.integration.test.js` and 2 more
- `ALLOW_REGISTRATIONS` — `server/services/settingsService.js`
- `ALLOW_SINGLE_TENANT_DEV_FALLBACK` — `server/scripts/production-readiness-check.js`, `server/middleware/tenantMiddleware.js`, `server/tests/completeTestDemoSeedSafety.test.js` and 2 more
- `APPLY_HUSSEINDB_CATALOGUE_REPAIR` — `server/scripts/repairHusseindbTenantCatalogues.js`
- `APPLY_ROLE_NORMALIZATION` — `server/seeds/migrateLegacyRoles.js`
- `APPLY_TENANT_ITINERARY_REPAIR` — `server/scripts/repairTenantTourItineraries.js`
- `AT_API_KEY` — `server/services/smsService.js`
- `AT_SENDER_ID` — `server/services/smsService.js`
- `AT_USERNAME` — `server/services/smsService.js`
- `BACKGROUND_JOB_RETENTION_DAYS` — declared in deployment template
- `BANK_ACCOUNT_NAME` — `server/services/settingsService.js`
- `BANK_ACCOUNT_NUMBER` — `server/services/settingsService.js`
- `BANK_BRANCH` — `server/services/settingsService.js`
- `BANK_NAME` — `server/services/settingsService.js`
- `BANK_SWIFT_CODE` — `server/services/settingsService.js`
- `BOOTSTRAP_ADMIN_PASSWORD` — `server/scripts/bootstrapFirstSuperAdmin.js`
- `BOOTSTRAP_SUPERADMIN_PASSWORD` — `server/scripts/bootstrapFirstSuperAdmin.js`
- `CLIENT_ORIGINS` — `server/scripts/production-readiness-check.js`, `server/config/env.js`, `server/tests/firstTenantAcceptance.integration.test.js` and 1 more
- `CLIENT_URL` — `server/scripts/production-readiness-check.js`, `server/config/env.js`, `server/controllers/paypalController.js` and 6 more
- `CLOUDINARY_API_KEY` — `server/config/cloudinary.js`, `server/controllers/systemHealthController.js`
- `CLOUDINARY_API_SECRET` — `server/config/cloudinary.js`, `server/controllers/systemHealthController.js`
- `CLOUDINARY_CLOUD_NAME` — `server/config/cloudinary.js`, `server/controllers/systemHealthController.js`
- `COMPANY_ADDRESS` — `server/services/settingsService.js`
- `COMPANY_CITY` — `server/services/settingsService.js`
- `COMPANY_COUNTRY` — `server/services/settingsService.js`
- `COMPANY_LOGO` — `server/services/settingsService.js`
- `COMPANY_NAME` — `server/services/settingsService.js`
- `COMPANY_WEBSITE` — `server/services/settingsService.js`
- `CONFIRM_DEMO_ACCOUNT_MIGRATION` — `server/scripts/reconcileDemoLoginAccounts.js`
- `CONFIRM_DEMO_DATA_REPAIR` — `server/scripts/reconcileDemoSeedData.js`
- `CONFIRM_DEMO_PASSWORD_RESET` — `server/scripts/reset-demo-passwords.js`
- `CONFIRM_DEMO_RESET` — `server/scripts/reset-and-seed-demo.js`
- `CONFIRM_ORPHAN_STAFF_MIGRATION` — `server/scripts/migrateOrphanStaffToTenant.js`
- `CONFIRM_RESET` — `server/scripts/resetGlobalToursData.js`
- `CONFIRM_TENANT_HOMEPAGE_REPAIR` — `server/scripts/repairTenantHomepages.js`
- `CONFIRM_TEST_SEED` — `server/tests/completeTestDemoSeedSafety.test.js`, `server/seeds/completeTestDemoSeed.js`
- `DATA_RETENTION_INTERVAL_MS` — `server/services/dataRetentionService.js`
- `DEFAULT_BOOKING_DEPOSIT_PERCENTAGE` — `server/services/settingsService.js`
- `DEFAULT_COMMISSION_RATE` — `server/services/settingsService.js`
- `DEFAULT_CURRENCY` — `server/controllers/stripeController.js`, `server/controllers/paymentController.js`, `server/controllers/hospitalityPaymentController.js` and 1 more
- `DEFAULT_CURRENCY_SYMBOL` — `server/services/settingsService.js`
- `DEFAULT_LANGUAGE` — `server/services/settingsService.js`
- `DEFAULT_PUBLIC_TENANT_SLUG` — `server/middleware/tenantMiddleware.js`, `server/tests/firstTenantAcceptance.integration.test.js`
- `DEFAULT_TAX_RATE` — `server/services/settingsService.js`
- `DEFAULT_TENANT_ID` — declared in deployment template
- `DEFAULT_TIMEZONE` — `server/services/settingsService.js`
- `DEMO_API_BASE_URL` — `server/scripts/verifyDemoApi.js`
- `DEMO_API_REPORT_PATH` — `server/scripts/verifyDemoApi.js`
- `DEMO_SEED_MODE` — `server/models/Booking.js`, `server/seeds/financialDashboardSeed.js`, `server/services/webhookDeliveryService.js`
- `DEMO_SMOKE_PASSWORD` — `server/scripts/verifyDemoApi.js`
- `DEMO_TEST_PASSWORD` — `server/scripts/verifyDemoApi.js`, `server/scripts/verifyDemoLocalApi.js`
- `DEPLOYMENT_ENV` — `server/config/env.js`
- `DEV` — `client/src/main.jsx`, `client/src/api/heroApi.js`
- `EMAIL_FROM_ADDRESS` — `server/services/settingsService.js`
- `EMAIL_FROM_NAME` — `server/services/settingsService.js`
- `ENABLE_BANK_TRANSFER` — `server/services/settingsService.js`
- `ENABLE_MPESA` — `server/services/settingsService.js`
- `ENABLE_PAYPAL` — `server/services/settingsService.js`
- `ENABLE_STRIPE` — `server/services/settingsService.js`
- `ETIMS_ADAPTER_TOKEN` — `server/scripts/production-readiness-check.js`, `server/config/env.js`, `server/services/etimsNoteService.js` and 1 more
- `ETIMS_ADAPTER_URL` — `server/scripts/production-readiness-check.js`, `server/config/env.js`, `server/services/kenyaFinanceReadinessGuard.js` and 2 more
- `ETIMS_CREDENTIAL_ENCRYPTION_KEY` — `server/scripts/production-readiness-check.js`, `server/config/env.js`, `server/models/EtimsCredential.js`
- `FACEBOOK_URL` — `server/services/settingsService.js`
- `FIRST_TENANT_TEST_MONGODB_URI` — `server/tests/firstTenantAcceptance.integration.test.js`
- `GIT_COMMIT` — `server/app.js`
- `HEALTH_TEST_MONGODB_URI` — `server/scripts/cleanupReadinessTestDatabases.js`, `server/tests/healthReadiness.test.js`
- `INSTAGRAM_URL` — `server/services/settingsService.js`
- `JWT_EXPIRE` — `server/config/env.js`, `server/utils/generateToken.js`
- `JWT_EXPIRES` — `server/utils/generateToken.js`
- `JWT_EXPIRES_IN` — `server/config/env.js`
- `JWT_SECRET` — `server/scripts/production-readiness-check.js`, `server/config/env.js`, `server/middleware/tenantMiddleware.js` and 9 more
- `MAIL_FROM_NAME` — `server/controllers/authController.js`
- `MAINTENANCE_MODE` — `server/services/settingsService.js`
- `MFA_DEV_MODE` — `server/scripts/production-readiness-check.js`, `server/controllers/mfaController.js`, `server/controllers/authController.js` and 2 more
- `MFA_ENABLED` — `server/controllers/authController.js`, `server/tests/firstTenantAcceptance.integration.test.js`
- `MONGODB_SERVER_SELECTION_TIMEOUT_MS` — `server/config/database.js`
- `MONGODB_STARTUP_MIGRATION_TIMEOUT_MS` — `server/server.js`
- `MONGODB_URI` — `server/scripts/reconcileDemoSeedData.js`, `server/scripts/migrateBookingPaymentLedger.js`, `server/scripts/verifyDemoApi.js` and 58 more
- `MPESA_CALLBACK_URL` — `server/config/mpesa.js`
- `MPESA_CONSUMER_KEY` — `server/config/mpesa.js`
- `MPESA_CONSUMER_SECRET` — `server/config/mpesa.js`
- `MPESA_ENVIRONMENT` — `server/config/mpesa.js`
- `MPESA_INITIATOR_NAME` — `server/config/mpesa.js`
- `MPESA_PASSKEY` — `server/config/mpesa.js`
- `MPESA_PRODUCTION_BASE_URL` — `server/config/mpesa.js`
- `MPESA_PRODUCTION_CALLBACK_URL` — declared in deployment template
- `MPESA_SANDBOX_BASE_URL` — `server/config/mpesa.js`, `server/tests/mpesaConfiguration.test.js`
- `MPESA_SANDBOX_CALLBACK_URL` — declared in deployment template
- `MPESA_SECURITY_CREDENTIAL` — `server/config/mpesa.js`
- `MPESA_SHORTCODE` — `server/config/mpesa.js`
- `NODE_ENV` — `server/app.js`, `server/scripts/verifyDemoLocalApi.js`, `server/scripts/reconcileDemoLoginAccounts.js` and 30 more
- `NODE_OPTIONS` — `server/tests/healthReadiness.test.js`
- `OPENAI_API_KEY` — `server/config/env.js`
- `OPERATIONAL_RECORD_RETENTION_DAYS` — declared in deployment template
- `PATH` — `server/tests/healthReadiness.test.js`
- `PAYMENT_CREDENTIAL_ENCRYPTION_KEY` — `server/scripts/production-readiness-check.js`, `server/models/EtimsCredential.js`, `server/models/PaymentGatewayConfig.js` and 1 more
- `PLATFORM_HOST` — `server/app.js`, `server/scripts/production-readiness-check.js`, `server/config/env.js` and 4 more
- `PORT` — `server/config/env.js`
- `PRIVACY_REQUEST_RETENTION_DAYS` — declared in deployment template
- `PROD` — `client/src/api/apiUrls.js`, `client/src/api/axios.js`
- `PRODUCTION_BACKUP_VERIFIED` — declared in deployment template
- `PRODUCTION_ETIMS_VERIFIED` — declared in deployment template
- `PRODUCTION_MONITORING_VERIFIED` — declared in deployment template
- `PRODUCTION_PAYMENT_VERIFIED` — declared in deployment template
- `PRODUCTION_READINESS_RUNTIME` — `server/scripts/production-readiness-check.js`
- `PRODUCTION_RESTORE_TESTED` — declared in deployment template
- `PRODUCTION_WEBHOOKS_VERIFIED` — declared in deployment template
- `PUBLIC_TENANT_KEY` — declared in deployment template
- `PUBLIC_TENANT_SLUG` — `server/middleware/tenantMiddleware.js`, `server/tests/firstTenantAcceptance.integration.test.js`
- `RENDER_GIT_COMMIT` — `server/app.js`
- `REQUIRE_EMAIL_VERIFICATION` — `server/services/settingsService.js`
- `REQUIRE_PHONE_VERIFICATION` — `server/services/settingsService.js`
- `RESEND_API_KEY` — `server/tests/resendEmailService.test.js`, `server/services/emailService.js`
- `RESEND_FROM_EMAIL` — `server/tests/resendEmailService.test.js`, `server/services/emailService.js`
- `RESEND_FROM_NAME` — `server/tests/resendEmailService.test.js`, `server/services/emailService.js`
- `RUN_DATABASE_INTEGRATION_TESTS` — `server/tests/hospitalityPaymentLifecycleIntegration.test.js`, `server/tests/tourLifecycleIntegration.test.js`
- `SEED_ADMIN_EMAIL` — `server/scripts/resetGlobalToursData.js`, `server/seeds/adminSeed.js`
- `SEED_ADMIN_PASSWORD` — `server/scripts/resetGlobalToursData.js`, `server/seeds/resetAdminPassword.js`, `server/seeds/adminSeed.js`
- `SEED_AGENT_PASSWORD` — `server/seeds/bookingAgentSeed.js`, `server/seeds/agentSeed.js`, `server/seeds/resetBookingAgentPassword.js`
- `SEED_CUSTOMER_PASSWORD` — `server/seeds/customerSeed.js`, `server/seeds/resetCustomerPassword.js`
- `SEED_DEMO_PASSWORD` — `server/scripts/verifyDemoApi.js`, `server/scripts/reset-demo-passwords.js`, `server/scripts/reconcileDemoLoginAccounts.js` and 2 more
- `SEED_FINANCE_PASSWORD` — `server/seeds/resetFinanceOfficerPassword.js`
- `SEED_GUIDE_PASSWORD` — `server/seeds/guideSeed.js`, `server/seeds/resetTourGuidePassword.js`, `server/seeds/tourGuideSeed.js`
- `SEED_MANAGER_PASSWORD` — `server/seeds/resetManagerPassword.js`, `server/seeds/tourManagerSeed.js`
- `SEO_DESCRIPTION` — `server/services/settingsService.js`
- `SEO_TITLE` — `server/services/settingsService.js`
- `STAGING_DATABASE_NAME` — `server/config/env.js`
- `STRIPE_SECRET_KEY` — `server/controllers/stripeController.js`, `server/controllers/hospitalityPaymentController.js`, `server/controllers/paymentGatewayController.js`
- `STRIPE_WEBHOOK_SECRET` — `server/controllers/stripeController.js`, `server/controllers/settingsController.js`, `server/controllers/paymentGatewayController.js`
- `SUBSCRIPTION_GRACE_PERIOD_DAYS` — `server/middleware/planFeatureMiddleware.js`, `server/services/tenantSubscriptionService.js`
- `SUPERADMIN_EMAIL` — `server/scripts/createGlobalToursAdmins.js`
- `SUPERADMIN_PASSWORD` — `server/scripts/createGlobalToursAdmins.js`
- `SUPPORT_EMAIL` — `server/utils/emailTemplates.js`, `server/services/settingsService.js`
- `SUPPORT_PHONE` — `server/services/settingsService.js`
- `TENANT_ID` — `server/scripts/migrateOrphanStaffToTenant.js`, `server/seeds/guideSeed.js`, `server/seeds/agentSeed.js` and 2 more
- `TENANT_NAME` — `server/scripts/migrateOrphanStaffToTenant.js`, `server/seeds/guideSeed.js`, `server/seeds/agentSeed.js` and 1 more
- `TENANT_PLAN_BUSINESS_PRICE_KES` — `server/controllers/platformBillingController.js`, `server/services/tenantSubscriptionService.js`
- `TENANT_PLAN_ENTERPRISE_PRICE_KES` — `server/controllers/platformBillingController.js`, `server/services/tenantSubscriptionService.js`
- `TENANT_PLAN_PROFESSIONAL_PRICE_KES` — `server/controllers/platformBillingController.js`, `server/services/tenantSubscriptionService.js`
- `TENANT_PLAN_STARTER_PRICE_KES` — `server/controllers/platformBillingController.js`, `server/services/tenantSubscriptionService.js`
- `TENANT_SLUG` — `server/scripts/migrateOrphanStaffToTenant.js`, `server/seeds/guideSeed.js`, `server/seeds/agentSeed.js` and 2 more
- `TEST_DEMO_SEED_PASSWORD` — `server/scripts/verifyDemoApi.js`, `server/tests/demoSeedAuthentication.test.js`, `server/tests/completeTestDemoSeedSafety.test.js` and 1 more
- `TWITTER_URL` — `server/services/settingsService.js`
- `VITE_API_URL` — `client/src/main.jsx`, `client/src/pages/admin/DestinationDetails.jsx`, `client/src/pages/admin/DestinationManagement.jsx` and 4 more
- `VITE_PLATFORM_API_URL` — `client/src/api/apiUrls.js`, `client/src/api/axios.js`
- `VITE_PLATFORM_HOST` — `client/src/pages/superadmin/SuperAdminTenants.jsx`, `client/src/pages/superadmin/SuperAdminUsers.jsx`, `client/src/context/TenantContext.jsx` and 1 more
- `VITE_PLATFORM_MODE` — `client/src/api/apiUrls.js`, `client/src/api/axios.js`
- `VITE_PUBLIC_TENANT_KEY` — `client/src/api/axios.js`
- `VITE_PUBLIC_TENANT_SLUG` — `client/src/api/axios.js`
- `VITE_SITE_URL` — `client/src/components/seo/TourSchema.jsx`, `client/src/components/seo/SEO.jsx`
- `VITE_SOCKET_URL` — `client/src/api/apiUrls.js`
- `VITE_TENANT_SLUG` — `client/src/api/axios.js`
- `WEBHOOK_DELIVERY_RETENTION_DAYS` — declared in deployment template
- `WEBHOOK_SECRET_KEY` — `server/services/webhookDeliveryService.js`
- `WEBHOOK_TIMEOUT_MS` — `server/services/webhookDeliveryService.js`
- `WHATSAPP_ACCESS_TOKEN` — `server/services/customerCommunicationService.js`, `server/services/whatsappService.js`
- `WHATSAPP_API_URL` — `server/services/customerCommunicationService.js`, `server/services/whatsappService.js`
- `YOUTUBE_URL` — `server/services/settingsService.js`
