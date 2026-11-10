# Source explanation: client/src/components/home/HeroSlider.jsx

**Source:** [client/src/components/home/HeroSlider.jsx](../../../client/src/components/home/HeroSlider.jsx)

## Purpose

A reusable UI component used by one or more pages/layouts. Props and callbacks form its input/output boundary.

## Imports and dependencies

- `useTenant` from `../../context/TenantContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/TenantContext](../../../client/src/context/TenantContext.jsx)
- `useSettings` from `../../context/SettingsContext`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/context/SettingsContext](../../../client/src/context/SettingsContext.jsx)
- `useEffect`, `useRef`, `useState` from `react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `useQuery` from `@tanstack/react-query`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Swiper`, `SwiperSlide` from `swiper/react`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Autoplay`, `EffectFade` from `swiper/modules`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `Link` from `react-router-dom`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
- `getHeroSlides` from `../../api/heroApi`. This dependency supplies the imported behavior; inspect the linked local module for its contract. [client/src/api/heroApi](../../../client/src/api/heroApi.js)
-  from `swiper/css`. This dependency supplies the imported behavior; inspect the linked local module for its contract.
-  from `swiper/css/effect-fade`. This dependency supplies the imported behavior; inspect the linked local module for its contract.

## Runtime declarations and data flow

### `HeroSlider` — lines 74–215

Parameters: none.
React hooks used: useState, useQuery, useEffect. Error control: try=false, catch=true, finally=false. 4 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 75:** `const { tenant } = useTenant() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 76:** `const { settings = {} } = useSettings() || {};` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 77:** `const tenantName = String(tenant?.name || tenant?.companyName || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 78:** `const configuredName = String(settings?.companyName || "").trim();` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 79:** `const companyName = tenantName || configuredName || "Hussein Mboya Tours";` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 80:** `const tenantKey = tenant?._id || tenant?.id || tenant?.slug || companyName;` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 81:** `const videoRefs = useRef([]);` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 82:** `const [heroReady, setHeroReady] = useState(false);` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 83:** `const [loadedVideos, setLoadedVideos] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 84:** `const [imageOverrides, setImageOverrides] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 85:** `const [imageAttempts, setImageAttempts] = useState({});` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 86:** `const { data: rawSlides = [] } = useQuery({` — Uses a React hook to manage component state, side effects, memoization, or server state.
- **Line 95:** `const normalizeBrand = (value) => {` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 96:** `if (typeof value !== "string") return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `return value` — Exits this function and supplies its result (or response short-circuit) to the caller.
- **Line 105:** `const apiSlides = Array.isArray(rawSlides) ? rawSlides.filter(Boolean).slice(0, 5) : [];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 106:** `const sourceSlides = apiSlides.length >= 2` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 112:** `const slides = sourceSlides.slice(0, 5).map((slide, index) => ({` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- Further statements are in the linked source; this walkthrough surfaces the main control/data boundaries.

### `normalizeBrand` — lines 95–101

Parameters: `value`.
1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 96:** `if (typeof value !== "string") return value;` — This branch gates the following work on a condition; test both true and false paths when changing it.
- **Line 97:** `return value` — Exits this function and supplies its result (or response short-circuit) to the caller.

### `markVideoLoaded` — lines 128–128

Parameters: `index`.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

### `playVideo` — lines 129–133

Parameters: `index`.
Error control: try=false, catch=true, finally=false. 1 branch/loop keywords are present; their source lines are listed below for path-by-path reading.

Key statements:
- **Line 130:** `const video = videoRefs.current[index];` — Executes the statement shown; follow the surrounding function's inputs, mutations and return path to understand its role.
- **Line 131:** `if (!video || !heroReady) return;` — This branch gates the following work on a condition; test both true and false paths when changing it.

### `pauseAllVideos` — lines 134–134

Parameters: none.
This named function is a local transformation/callback; its input parameters and return statements define its contract.

Key statements:

## Module-level declarations

- Line 13: `const HERO_IMAGE_CANDIDATES = [`.
- Line 26: `const FALLBACK_HERO_SLIDES = [`.
- Line 75: `const { tenant } = useTenant() || {};`.
- Line 76: `const { settings = {} } = useSettings() || {};`.
- Line 77: `const tenantName = String(tenant?.name || tenant?.companyName || "").trim();`.
- Line 78: `const configuredName = String(settings?.companyName || "").trim();`.
- Line 79: `const companyName = tenantName || configuredName || "Hussein Mboya Tours";`.
- Line 80: `const tenantKey = tenant?._id || tenant?.id || tenant?.slug || companyName;`.
- Line 81: `const videoRefs = useRef([]);`.
- Line 82: `const [heroReady, setHeroReady] = useState(false);`.
- Line 83: `const [loadedVideos, setLoadedVideos] = useState({});`.
- Line 84: `const [imageOverrides, setImageOverrides] = useState({});`.
- Line 85: `const [imageAttempts, setImageAttempts] = useState({});`.
- Line 86: `const { data: rawSlides = [] } = useQuery({`.
- Line 95: `const normalizeBrand = (value) => {`.
- Line 105: `const apiSlides = Array.isArray(rawSlides) ? rawSlides.filter(Boolean).slice(0, 5) : [];`.
- Line 106: `const sourceSlides = apiSlides.length >= 2`.
- Line 112: `const slides = sourceSlides.slice(0, 5).map((slide, index) => ({`.
- Line 124: `const timer = window.setTimeout(() => setHeroReady(true), 1200);`.
- Line 128: `const markVideoLoaded = (index) => setLoadedVideos((current) => ({ ...current, [index]: true }));`.
- Line 129: `const playVideo = (index) => {`.
- Line 130: `const video = videoRefs.current[index];`.
- Line 134: `const pauseAllVideos = () => videoRefs.current.forEach((video) => video?.pause());`.
- Line 157: `const slideKey = String(slide._id || index);`.
- Line 158: `const candidateImage = slide.image || HERO_IMAGE_CANDIDATES[index % HERO_IMAGE_CANDIDATES.length];`.
- Line 159: `const imageUrl = imageOverrides[slideKey] || candidateImage;`.
- Line 160: `const videoUrl = slide.video;`.
- Line 161: `const videoLoaded = Boolean(loadedVideos[index]);`.
- Line 174: `const attempts = imageAttempts[slideKey] || 0;`.
- Line 175: `const nextIndex = attempts + 1;`.

## Security, errors and performance checkpoints

No common security marker was detected statically; this does not prove the module has no security impact.
- Check every rejection path, unbounded list/query, external call timeout, and tenant/resource ownership rule in the linked source.

## How to read this file

The function line ranges and statement cues were extracted from the current AST; summaries are static-analysis hints and can miss dynamic calls, aliases, generated behavior and implicit framework contracts. Use the source link as the executable truth. The dedicated feature guides explain the most important end-to-end flows.
