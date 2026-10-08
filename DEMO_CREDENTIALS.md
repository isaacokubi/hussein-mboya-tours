# Demo accounts

The authoritative login list is `TEST_LOGIN_EMAILS` in `server/seeds/completeTestDemoSeed.js`. It contains one tenantless platform account and 12 accounts for each of `hussein-mboya`, `amani-trails`, and `demo-safari`.

| Scope | Canonical login addresses |
|---|---|
| Platform | `superadmin1@husseinmboya.com` |
| Hussein Mboya Tours | `admin1@husseinmboya.com`, `tourmanager1@husseinmboya.com`; `agent1` and `agent2`, `guide1` and `guide2`, `driver1` and `driver2`, `customer1` through `customer4` at `@husseinmboya.com` |
| Amani Trails Safaris | `admin1@amanitrails.com`, `tourmanager1@amanitrails.com`; `agent1` and `agent2`, `guide1` and `guide2`, `driver1` and `driver2`, `customer1` through `customer4` at `@amanitrails.com` |
| Demo Safari Adventures | `admin1@demosafari.com`, `tourmanager1@demosafari.com`; `agent1` and `agent2`, `guide1` and `guide2`, `driver1` and `driver2`, `customer1` through `customer4` at `@demosafari.com` |

Use the same privately supplied `SEED_DEMO_PASSWORD` environment value for the seed and password-reset workflows. The password is intentionally absent from source, documentation, and committed environment files.

Tenant users authenticate into the tenant matching their email domain. The platform account has role `super_admin`, `tenantId: null`, and remains in platform context until an explicit tenant action is taken.
