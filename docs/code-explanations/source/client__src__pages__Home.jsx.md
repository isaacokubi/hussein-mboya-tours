# Source explanation: client/src/pages/Home.jsx

**Source:** [client/src/pages/Home.jsx](../../../client/src/pages/Home.jsx)

## Purpose

A route-level browser view. It renders user-facing workflow state and coordinates client API calls; backend authorization and validation remain authoritative.

## Imports and dependencies

- `lazy` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `ArrowRight`, `BadgeCheck`, `CalendarCheck2`, `CarFront`, `CheckCircle2`, `Compass`, `CreditCard`, `Hotel`, `ShieldCheck`, `Sparkles`, `UsersRound` from `lucide-react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `SEO` from `../components/seo/SEO`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/seo/SEO](../../../client/src/components/seo/SEO.jsx)
- `HeroSlider` from `../components/home/HeroSlider`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/home/HeroSlider](../../../client/src/components/home/HeroSlider.jsx)
- `HomeSearch` from `../components/home/HomeSearch`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/home/HomeSearch](../../../client/src/components/home/HomeSearch.jsx)
- `useSettings` from `../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useTenant` from `../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `DeferredSection` from `../components/common/DeferredSection`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/components/common/DeferredSection](../../../client/src/components/common/DeferredSection.jsx)

## Runtime declarations and data flow

### `Home` — lines 41–130

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:
- **Line 42:** `const { tenant = {} } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 43:** `const { companyName: configuredCompanyName = "", settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 44:** `const companyName = configuredCompanyName || tenant.name || tenant.companyName || "Hussein Mboya Tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 45:** `const sections = { ...DEFAULT_SECTIONS, ...(settings.homepageSections || {}) };` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 46:** `const seoTitle = settings.seoTitle || \`Kenya Safaris & Tours | ${companyName}\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 47:** `const seoDescription = settings.seoDescription || \`Discover Kenya with ${companyName}: safaris, wildlife, beach holidays, custom itineraries and seamless travel support.\`;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 49:** `return (` — Exits this function and supplies its result (or response short-circuit) to the caller.

## Module-level declarations

- Line 11: `const StatsSection = lazy(() => import("../components/home/StatsSection"));`.
- Line 12: `const FeaturedTours = lazy(() => import("../components/home/FeaturedTours"));`.
- Line 13: `const PublicPackages = lazy(() => import("../components/home/PublicPackages"));`.
- Line 14: `const DestinationsSection = lazy(() => import("../components/home/DestinationsSection"));`.
- Line 15: `const CategoriesSection = lazy(() => import("../components/home/CategoriesSection"));`.
- Line 16: `const TestimonialsSection = lazy(() => import("../components/home/TestimonialsSection"));`.
- Line 17: `const GallerySection = lazy(() => import("../components/home/GallerySection"));`.
- Line 18: `const WhyChooseUs = lazy(() => import("../components/home/WhyChooseUs"));`.
- Line 19: `const MpesaCTA = lazy(() => import("../components/home/MpesaCTA"));`.
- Line 20: `const NewsletterSection = lazy(() => import("../components/home/NewsletterSection"));`.
- Line 22: `const DEFAULT_SECTIONS = { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true }`.
- Line 23: `const JOURNEY = [`.
- Line 32: `const TRUST_POINTS = [["Kenya specialists", "Local knowledge from people who know the destinations.", Compass], ["Verified local support", "Guides, drivers and partners coordinated`.
- Line 34: `const SERVICES = [`.
- Line 42: `const { tenant = {} } = useTenant() || {};`.
- Line 43: `const { companyName: configuredCompanyName = "", settings = {} } = useSettings() || {};`.
- Line 44: `const companyName = configuredCompanyName || tenant.name || tenant.companyName || "Hussein Mboya Tours";`.
- Line 45: `const sections = { ...DEFAULT_SECTIONS, ...(settings.homepageSections || {}) };`.
- Line 46: `const seoTitle = settings.seoTitle || \`Kenya Safaris & Tours | ${companyName}\`;`.
- Line 47: `const seoDescription = settings.seoDescription || \`Discover Kenya with ${companyName}: safaris, wildlife, beach holidays, custom itineraries and seamless travel support.\`;`.

## Security, errors and performance checkpoints

- Payment/provider/webhook-related identifiers are present; distinguish request acceptance from verified financial state.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
