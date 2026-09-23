# Buyer Acquisition Audit — Repository Snapshot

**Repository:** isaacokubi/hussein-mboya-tours  
**Product:** Global Tours  
**Audit date:** 23 September 2026  
**Purpose:** buyer diligence and acquisition positioning

## Repository scale

The main branch contains approximately:

- **996 tracked files**
- **582 server-side files**
- **377 client-side files**
- **22 existing documentation files**
- **34 files matching test/spec naming patterns**
- GitHub Actions, deployment configuration, security documentation and environment templates

This is a substantial application codebase, not a brochure website.

## Architecture snapshot

### Client

The frontend is organized around:

- React/Vite application shell
- API layer
- authentication/context
- reusable components
- layouts
- pages
- routes
- services
- socket integration
- styles and utilities
- public travel media/assets

### Server

The backend includes:

- Express application
- controllers
- routes
- middleware
- models
- services
- tenancy
- authentication/security infrastructure
- socket support
- background/operational scripts
- seeds
- tests
- configuration
- production safeguards

### Business domains represented

The repository documentation and implementation cover:

- multi-tenancy
- users/RBAC
- customers
- tours/destinations
- bookings
- payments
- invoices
- accounting/finance
- suppliers/procurement
- profitability
- corporate accounts
- accommodation
- airport transfers
- compliance
- website/API integration
- webhooks
- eTIMS architecture
- operational monitoring and backups

## Verification evidence

The repository README records the following local verification baseline:

- server install: PASS
- server static checks: PASS
- backend automated tests: 95 tests, 92 passed, 0 failed, 3 intentionally skipped
- security tests: PASS
- tour-domain tests: PASS
- targeted regression tests: PASS
- RBAC normalization dry run: PASS
- client install: PASS
- client lint: PASS
- client production build: PASS
- production readiness contract: PASS

These are source-code/CI-level findings. They are **not** evidence that every external provider or production environment is currently accepted.

## Outstanding buyer acceptance work

A buyer should verify:

1. Current production deployment matches the intended release.
2. Tenant isolation works in the deployed environment.
3. M-Pesa callbacks and replay/idempotency behavior.
4. Payment → booking → invoice → accounting reconciliation.
5. Live eTIMS/KRA submission and receipt evidence.
6. Browser acceptance across all major roles.
7. Backup and restore procedures.
8. Production data integrity.
9. Security/dependency posture.
10. IP ownership and third-party licence compliance.

## eTIMS acquisition position

The platform contains a KRA OSCU integration foundation. KRA states that system-to-system integration can use OSCU or VSCU and that self-integrators and third-party integrators must go through the applicable development, testing, vetting and certification process before integration/production use. citeturn0search0turn0search4

Therefore the sales material must say:

**"eTIMS/OSCU integration foundation included; KRA certification remains a buyer completion item."**

It must not say:

**"KRA-certified eTIMS software."**

## Asset-sale readiness

Before signing an exclusive IP transfer, the seller should establish:

- code ownership/assignment chain
- contractor agreements
- open-source licence inventory
- third-party asset licences
- domain ownership
- cloud-account ownership
- payment-account ownership
- removal/rotation of secrets
- treatment of any personal/customer data
- exact assets included in the sale

## Recommended transaction package

The buyer should receive a controlled diligence package containing:

- sales prospectus
- acquisition overview
- product gap register
- technical due-diligence checklist
- architecture documentation
- test evidence
- deployment instructions
- eTIMS documentation
- IP/dependency schedule
- transition plan

Credentials and sensitive customer information should be transferred only under the definitive agreement and through secure channels.

## Commercial positioning

The platform should be marketed as:

**"An existing multi-tenant tour and travel management SaaS platform available for source-code/IP acquisition and buyer-led completion."**

It should not be marketed merely as:

**"A tour website for sale."**

## Pricing strategy

Do not publish a final price in the public repository.

Use a private asking price after the IP and technical audit is complete. The seller can then negotiate based on:

- amount of completed functionality
- remaining engineering effort
- clean IP ownership
- deployment reproducibility
- integration readiness
- documentation
- customer/revenue evidence, if any
- exclusivity
- included domains/brands/accounts
- strategic value to the buyer

## Buyer profile

The most relevant buyer categories are:

- Kenyan SaaS companies
- ERP/POS companies
- eTIMS integrators
- travel technology companies
- hospitality software companies
- ICT companies with an existing business-software customer base
- companies seeking a ready-made travel vertical

## Next commercial action

After the acquisition pack is approved, create a qualified buyer list, contact buyers under an NDA where appropriate, provide a controlled technical demo, and release deeper repository/IP information only during diligence.
