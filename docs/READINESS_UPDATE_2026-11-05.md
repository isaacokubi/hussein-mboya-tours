# Readiness update — 2026-11-05

## Source and scope

The follow-up branch `codex/complete-readiness-2026-11-05` was squash-merged by PR #224. Current `main` is `4085201b3d70c66afa749ee04fe4b7b995f8f937`. No production deployment, payment, credential change, seed, or production database write was performed. The owner-authorized fake-data `husseindb` was used only for the tenant-isolation regression; its uniquely named records were removed in teardown. Transactional acceptance used disposable MongoDB 8 replica sets.

## Current-main workflow findings

- **FIXED AND TESTED:** CI run [41960879516](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41960879516) showed MongoDB 8's kernel compatibility guard on the latest hosted runner. MongoDB's [8.0 release notes](https://www.mongodb.com/docs/v8.0/release-notes/8.0/) describe the affected kernel range. Ubuntu 24.04 reproduced startup failure; Ubuntu 22.04 allowed the image to start. The final CI test container is started explicitly with `docker run` so MongoDB replica-set arguments are passed to `mongod`, not Docker `create`.
- **FIXED IN WORKING TREE:** the tour replica-set job had an unbounded readiness loop. It now has a 120-second bound, captures container logs on failure, uses a disposable namespace accepted by the URI safety helper, and has a job timeout.
- **TESTED:** the latest main release gate succeeded in run `41960879467`.
- **TESTED:** PR #224 commit `da92c4dd28763b197aec4b75540273740967736d` passed CI run [41969409132](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41969409132): server checks, live tenant isolation plus health/first-tenant acceptance, tour lifecycle integration, and client lint/build all succeeded. Three-phase release gate [41969409044](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41969409044) passed all phases.
- **TESTED, MERGED:** current `main` commit `4085201b3d70c66afa749ee04fe4b7b995f8f937` passed post-merge CI [41971013763](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41971013763) and release gate [41971013788](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41971013788).
- **FAILED, PRODUCTION BLOCKER:** post-merge production smoke [41971013760](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41971013760) timed out three times, then received HTTP 503 from the configured API readiness endpoint; the public website check was skipped. No production change was made. The deployed SHA/runtime is unknown, so the remaining action is to identify and remediate the external deployment/runtime cause, then rerun smoke.
- **TESTED, EARLIER MONITORING:** run [41963125543](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41963125543), on the previous main SHA, passed production API readiness and website latency and closed issues #221 and #145. It does not supersede the failing post-merge smoke evidence.
- **NOT PASSED, LATER RECOVERED:** production smoke run [41960879541](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41960879541) got HTTP 503 from the configured API. The later monitoring run passed. The deployed SHA was not established.
- **BLOCKED EXTERNALLY:** backup run [41613200034](https://github.com/isaacokubi/hussein-mboya-tours/actions/runs/41613200034) dumped the configured `husseindb` archive, then failed because temporary MongoDB validation did not become ready; artifact upload did not run. The old workflow produced no container diagnostics. Runner/kernel incompatibility is the likely shared cause, inferred from the MongoDB 8 startup error in CI. Backup and restore jobs now use `ubuntu-22.04`; the protected archive still requires a successful workflow rerun.

## Changes in this follow-up

- CI, backup, and restore jobs that start MongoDB 8 are pinned to `ubuntu-22.04`; application integration tests remain on MongoDB 8.
- MongoDB replica-set readiness is bounded and emits container logs on failure. CI now runs the first-tenant acceptance suite using only its temporary Mongo service.
- The first PR CI attempt revealed first-tenant provisioning requires MongoDB transactions; its service was a standalone server. CI now configures that disposable service as a replica set, initializes it with a bounded wait, and passes replica-set URIs to the acceptance and health suites.
- The first-tenant test now uses the payment method enabled by fresh-tenant defaults. It still does not initiate a provider payment.
- The comprehensive demo seed refuses the application database `husseindb`; Atlas seed opt-in is limited to `global_tours_test`. No seed ran.
- The security/production contract test asserts the runner, database namespace, first-tenant step, bounded wait and backup/restore runner configuration.

## Verification evidence

| Verification | Result |
|---|---|
| `cd server && npm test` | **311 passed, 0 failed, 5 skipped** (316 total). Skipped database cases were run separately below. |
| `cd server && npm run check:all` | **PASS**. |
| Database-backed health, first-tenant, tour, airport transfer and accounting rollback suites against a temporary MongoDB 8 replica set | **8 passed, 0 failed, 0 skipped**. First tenant created and removed its `fta_*` disposable database contents. |
| Live tenant isolation against owner-authorized fake-data `husseindb` | **17 passed, 0 failed**; the script removed only its fixtures. |
| Client ESLint | **PASS**. |
| Client production build with nonproduction API/socket URLs | **PASS**. |
| Mobile dashboard and checkout Playwright suite | **10 passed** using system Chrome. |
| Tour editor Playwright suite | **5 passed** using local Vite and mocked APIs. |
| Read-only public catalogue smoke on production | **1 passed**. |
| Read-only desktop/mobile public performance smoke | **2 passed**. One sample measured catalogue API responses at about 2.6–3.1 seconds; this was not compared against a published SLA. |
| Synthetic encrypted backup and isolated restore using disposable MongoDB 8 containers | **PASS**. Checksum, encryption/decryption, gzip integrity, six restored collections, tenant references, indexes and application-model reads were checked. No production archive was used. |
| `npm audit` | Server **0 critical/0 high/2 moderate**; client **0 critical/0 high/8 moderate/2 low**. Audit commands return nonzero for the remaining advisories. |
| Workflow YAML parse, contract tests and `git diff --check` | **PASS** on the merged workflow fix. |

Playwright's downloaded Chromium could not install on the local Ubuntu 20.04 host, so the successful local browser runs used the installed system Chrome binary. Staging account acceptance was not run because no isolated staging account credentials were available. No shared test password was used.

## External acceptance and remaining limits

- **TESTED:** GitHub CI and release gate pass on merged main `4085201`.
- **BLOCKED EXTERNALLY:** post-merge production smoke is failing with API timeouts and HTTP 503; determine the deployed SHA and runtime/readiness cause, deploy only with approval, and rerun API and website smoke.
- **BLOCKED EXTERNALLY:** rerun protected production backup/restore with current credentials and verify the actual archive. Synthetic restore is not production archive evidence.
- **TESTED, EARLIER:** monitoring passed on prior main and recovered alerts. **NOT VERIFIED:** current deployment SHA and rollback. The post-merge smoke failed as described above.
- **NOT TESTED:** genuine Daraja Sandbox OAuth/STK/callback/refund/reconciliation; no credentials or public isolated callback were used.
- **NOT TESTED:** KRA/eTIMS production acceptance, webhook consumer delivery, production database least-privilege role, and authenticated multi-role production browser acceptance.
- **NOT TESTED:** exhaustive end-to-end acceptance across every finance, SaaS, hotel, fleet, supplier and AI workflow. Existing unit/contract coverage does not establish all those business workflows.
- **NOT TESTED:** full patch review of every unrelated open PR. Reviewed overlap notes are in [master progress](MASTER_REMEDIATION_PROGRESS.md); unsafe, duplicate, broad, or unnecessary changes were not merged.

## Verdict

**NOT PRODUCTION READY.** Post-merge production smoke returned HTTP 503 after timeouts. Protected archive restore, deployed SHA, least-privilege access, and provider/regulatory acceptance remain outstanding.
