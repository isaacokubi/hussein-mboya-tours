# Documentation index

This guide documents the checked-in code and the evidence available in the repository. A module existing in source does not prove it is configured or deployed.

## 1. Getting started

- [Project overview](PROJECT_OVERVIEW.md)
- [Installation and development setup](INSTALLATION.md)
- [Environment variables](ENVIRONMENT_VARIABLES.md)

## 2. Understanding the system

- [Exact file creation order and frontend/backend communication](FROM_ZERO_TO_PRODUCTION_BUILD_SEQUENCE.md)
- [Build the platform from scratch](SYSTEM_FROM_SCRATCH_GUIDE.md)

- [Architecture](ARCHITECTURE.md)
- [Frontend](FRONTEND.md)
- [Backend](BACKEND.md)
- [Business logic and workflows](BUSINESS_LOGIC.md)
- [Folder and file guide](CODEBASE_GUIDE.md)

## 3. Understanding the code

- [Code explanation overview](CODE_EXPLANATION.md)
- [Complete subsystem learning manual](LEARNING_MANUAL.md)
- [Detailed code explanations](code-explanations/INDEX.md)
- [Core runtime walkthroughs](CORE_CODE_WALKTHROUGHS.md)
- [Source-reviewed critical API contracts](API_VERIFIED_CONTRACTS.md), including [admin bookings](API_DOMAIN_CONTRACTS/admin-bookings.md) and [admin payments](API_DOMAIN_CONTRACTS/admin-payments.md)
- [API domain contract index](API_DOMAIN_CONTRACTS/INDEX.md)
- [Domain endpoint guides (all 629 mounted inventory entries)](API_ENDPOINT_GUIDE/INDEX.md)
- [Source file index (all 1,015 first-party source files)](SOURCE_FILE_INDEX.md)
- [Documentation coverage and known gaps](DOCUMENTATION_COVERAGE.md)
- [Source review classifications and reviewed scopes](SOURCE_REVIEW_REGISTRY.md)
- [Run the documentation coverage audit](../scripts/check-documentation-coverage.js): `node scripts/check-documentation-coverage.js`

Suggested learning order: overview → architecture → folder guide → frontend/backend → booking workflow → authentication/payment code walkthrough → API and database references.

## 4. API and database

- [API reference](API_REFERENCE.md)
- [Domain endpoint guides](API_ENDPOINT_GUIDE/INDEX.md)
- [Source-reviewed critical API contracts](API_VERIFIED_CONTRACTS.md)
- [Source-traced API domain contract index](API_DOMAIN_CONTRACTS/INDEX.md)
- [Admin booking contracts](API_DOMAIN_CONTRACTS/admin-bookings.md)
- [Admin payment and refund contracts](API_DOMAIN_CONTRACTS/admin-payments.md)
- [Database](DATABASE.md)

## 5. Security and payments

- [Security](SECURITY.md)
- [Payments and M-Pesa](PAYMENTS_AND_MPESA.md)

## 6. Testing and deployment

- [Testing](TESTING.md)
- [Deployment](DEPLOYMENT.md)
- [Engineering decisions](ENGINEERING_DECISIONS.md)

## 7. Troubleshooting

- [Troubleshooting guide](TROUBLESHOOTING.md)

## 8. Interview preparation

- [Project presentation](interview/PROJECT_PRESENTATION.md)
- [100 technical interview questions and answers](interview/TECHNICAL_INTERVIEW_QUESTIONS.md)
- [Code walkthrough](interview/CODE_WALKTHROUGH.md)
- [Three-level admin booking/payment interview deep dive](interview/ADMIN_BOOKING_PAYMENT_DEEP_DIVE.md)
- [Challenges and solutions](interview/CHALLENGES_AND_SOLUTIONS.md)
- [Project deep dive](interview/PROJECT_DEEP_DIVE.md)
- [Learning guide](interview/LEARNING_GUIDE.md)

Existing operations/readiness references remain available in this directory, including `MPESA_DARAJA_SANDBOX_READINESS.md`, `PRODUCTION_READINESS.md`, `KENYA_PRODUCTION_RUNBOOK.md`, and dated `READINESS_UPDATE_*.md` records. Prefer the dated evidence for claims about a particular deployment or test run.
