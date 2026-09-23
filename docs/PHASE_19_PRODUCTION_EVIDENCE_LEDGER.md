# Phase 19 — Production Evidence Ledger

## Purpose

Phase 19 adds a machine-checkable evidence manifest for the external production gates that source code cannot certify.

The manifest is an evidence index, not a place to store credentials, customer data, provider secrets or screenshots. Evidence remains in the approved evidence store; the manifest records a safe reference to it.

## Required checks

The validator requires PASS evidence for backup, restore, monitoring, payment, eTIMS, signed webhooks, browser acceptance, authenticated role acceptance and Firestore production integrity.

Each check must include id, status PASS, ISO-8601 verifiedAt and a non-secret evidenceRef. The deployment section must include the exact 40-character Git commit SHA, environment and verification timestamp.

## Validation

From server:

    PRODUCTION_EVIDENCE_MANIFEST=/secure/evidence/manifest.json npm run check:production:evidence

A missing manifest, missing check, non-PASS check, invalid commit SHA/timestamp, duplicate/unknown check or credential-like content fails validation.

## Certification rule

A passing manifest does not create evidence. It only proves that the supplied evidence register is complete and structurally safe.

Before using it for production certification:
1. Verify every referenced evidence item exists in the approved evidence store.
2. Verify timestamps and deployment SHA against the actual environment.
3. Retain provider/test-system evidence behind each reference.
4. Keep credentials outside Git and outside the manifest.
5. Use the manifest as the evidence index for the production go-live checklist.

Do not mark a check PASS because a source-code test exists. The referenced external acceptance must actually have completed.
