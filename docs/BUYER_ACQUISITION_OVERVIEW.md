# Global Tours — Software Acquisition Overview

## Purpose

This document is the technical-commercial overview for a prospective buyer evaluating acquisition of the Global Tours / Hussein Mboya Tours software platform.

The proposed transaction is an **asset/source-code acquisition**, not a request for the buyer to continue developing the seller's personal project. The intended buyer may rename, rebrand, modify, deploy, commercialize and operate the platform after a completed IP/source-code transfer agreement.

## Product

Global Tours is a Kenya-focused, multi-tenant tours and travel management SaaS platform intended for tour operators and related travel businesses.

The platform has been developed as a substantial business-management system rather than a marketing website.

### Core capabilities

- Multi-tenant organization and tenant isolation
- User accounts, roles and permissions
- Customer management
- Tours and destinations
- Bookings and tour lifecycle
- Payment architecture
- M-Pesa payment integration
- Stripe/card payment architecture
- Invoicing
- Finance and accounting workflows
- Supplier and purchase-order workflows
- Tour-cost and profitability workflows
- Hotel/accommodation foundations
- Airport-transfer foundations
- Corporate-account workflows
- Website booking capture/API integration
- Developer APIs and webhooks
- Compliance workflows
- Security, audit and operational safeguards
- Production deployment configuration
- Firestore/Firebase backend architecture
- KRA eTIMS/OSCU integration foundation

## Current engineering position

The repository has undergone production-hardening work and automated verification. The current README records passing local server/client checks and a production-readiness contract.

Important distinction: **local source-code verification is not the same thing as live production certification.**

The platform still requires buyer-led technical acceptance and provider/regulatory acceptance before the buyer represents the product as production-certified.

## eTIMS position

The repository contains an OSCU integration foundation including:

- KRA OSCU initialization flow
- encrypted communication-key storage
- invoice-to-KRA mapping boundary
- eTIMS invoice state persistence
- retry/failure handling
- KRA receipt/control/QR evidence persistence
- item-code and classification-code requirements

The implementation is **not represented as KRA-certified**.

KRA sandbox testing, taxpayer/device configuration, item and tax mapping, certification/vetting where applicable, and production acceptance remain buyer-side completion work.

## Technology

### Frontend

- React
- Vite

### Backend

- Node.js
- Express
- Firebase/Firestore

### Integrations / infrastructure

- M-Pesa
- Stripe
- KRA eTIMS/OSCU integration boundary
- SMTP
- Cloudinary support
- Webhooks
- Background jobs
- Production deployment configuration

## Proposed acquisition deliverables

A completed transaction should transfer, subject to the definitive agreement:

1. Source-code repository
2. Git history
3. Application documentation
4. Architecture documentation
5. Deployment configuration/templates
6. Test and verification documentation
7. eTIMS integration documentation
8. Database/schema documentation
9. Build and deployment instructions
10. Known-issues and completion roadmap
11. Technical handover sessions
12. Relevant domain/brand assets if specifically included
13. Relevant cloud/provider accounts if specifically included and legally transferable
14. Intellectual-property rights expressly assigned in the definitive agreement

## What is not automatically included

Unless expressly listed in the sale agreement:

- third-party software licences
- third-party API accounts
- KRA taxpayer credentials
- M-Pesa credentials
- Stripe credentials
- cloud billing accounts
- customer personal data
- customer contracts
- trademarks or business names
- domains
- confidential information belonging to third parties

## Buyer opportunity

The buyer can use the existing platform as a starting point for a commercial tours/travel SaaS, internal tour-operator platform, vertical ERP, or broader hospitality/travel management product.

The buyer controls the final product roadmap and may replace the current branding and extend the system.

## Important transaction condition

The seller should complete an IP chain-of-title review before representing the source code as fully transferable. Every employee, contractor, agency, open-source dependency and third-party asset that materially contributes to the product should be reviewed for ownership/licensing terms.

The definitive sale agreement should be reviewed by qualified legal counsel.

## Suggested buyer evaluation process

1. NDA
2. Technical demo
3. Repository review
4. Architecture review
5. Dependency/security review
6. eTIMS implementation review
7. Verification of deployment and test evidence
8. IP/ownership due diligence
9. Commercial negotiation
10. Definitive asset/IP purchase agreement
11. Payment against agreed milestones
12. Repository and account handover
13. Buyer acceptance
14. Optional transition support

## Current valuation discussion

This document intentionally does not state a guaranteed market value.

The seller can test the market with an asking price and negotiate based on:

- completeness of the existing modules
- technical quality
- remaining development effort
- clean IP ownership
- documentation quality
- working integrations
- deployment readiness
- customer/revenue evidence, if any
- buyer's strategic use of the platform
- exclusivity and transfer scope

A buyer acquiring the complete IP has a materially different proposition from a client paying a developer to finish the software.
