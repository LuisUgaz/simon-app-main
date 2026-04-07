# AGENTS CHECKLIST

## Purpose And Scope

- This file is the working agreement for autonomous agents contributing to the React Native SIMON app in this repo.
- Follow these notes before editing; assume prior human context lives in the Spanish documentation files in the repo root.
- The app targets Android and iOS with native builds, so always consider device-specific fallout when changing native code or dependencies.
- Security, encryption, and offline workflows are first-class features; never bypass adapters that enforce them.
- Keep user-facing copy in Spanish unless a screen already mixes languages.

## Toolchain Setup

- Use Node 18+ (enforced in `package.json` engines) and npm 9+; use `nvm use 18` if you hit native build errors.
- Install JS deps with `npm install`; reinstall Pods with `cd ios && pod install && cd -` whenever native deps change.
- Start Metro with `npm run start`; add `--reset-cache` when bundler types get stuck on SVG or env modules.
- Android build: `npm run android` (ensures Gradle sync, assumes emulator/device attached).
- iOS build: `npm run ios` or the `npm run start:ios` helper to target the default simulator in `package.json`.
- Do not edit `node_modules`, `android`, or `ios` by hand; use platform config files or scripts instead.

## Command Reference

- Lint everything with `npm run lint`; auto-fix explicitly with `npx eslint . --fix` only after reviewing each change.
- Run the full Jest suite with `npm test` (uses `react-native` preset from `jest.config.js`).
- Run a single test by pattern with `npm test -- --testNamePattern="ResolveQuestion"` or target a file `npx jest __tests__/App.test.tsx`.
- Watch mode: `npm test -- --watch` for iterative work; exit with `q` to avoid orphaned processes.
- Format check relies on Prettier defaults; run `npx prettier "src/**/*.{ts,tsx}" --check` before pushing when whitespace has churned.
- Metro handles SVG through `metro.config.js`; if you see missing SVG modules, restart bundler with `npm run start -- --assetExts` fallback removed.

## Repository Map

- `src/App.tsx` wires providers (Paper, Auth, Snackbar) and root guards (JailMonkey); touch this only when adding global wrappers.
- `src/core` hosts domain primitives (`constants`, `entities`, `actions`, `mappers`) and should stay framework-agnostic.
- `src/infraestructure` implements repositories, SQLite datasources, interfaces, and services such as `OfflineMonitoringService`.
- `src/presentation` contains components, screens, routes, Zustand stores, and theming; React-only logic lives here.
- `src/config` wraps adapters for API clients, AsyncStorage, and cryptography.
- `src/types` supplies ambient declarations; add new globals here so `tsconfig.json` `typeRoots` picks them up.
- `__tests__` keeps Jest tests; follow the `*.test.tsx` naming already in place.

## Formatting And Imports

- Prettier config (`.prettierrc.js`) enforces single quotes, trailing commas, compact object spacing, and `arrowParens: 'avoid'`; do not override inline.
- ESLint extends `@react-native`; fix warnings immediately to avoid regression since lint runs in CI and local scripts.
- Order imports: external packages first, then absolute aliases (`@env`, `react-native-paper`), then project paths grouped by layer (`src/config`, `src/core`, `src/presentation`).
- Keep side-effect imports (e.g., `'react-native-gesture-handler'`, dayjs plugins) at the very top.
- Prefer named exports for reusable utilities; default exports are reserved for components or service singletons already following that pattern.
- When importing assets, remember Metro treats SVGs as components because of `react-native-svg-transformer`; use `import Logo from '../assets/logo.svg';` and render as `<Logo />`.

## TypeScript, State, And Data Flow

- TS config inherits from `@react-native/typescript-config`; keep new compiler tweaks minimal and scoped to `tsconfig.json`.
- Strengthen types by extending domain models from `src/core/entities` rather than redefining shapes inside components.
- Zustand stores (`src/presentation/store/*.store.ts`) expose typed setters and async effects; always update state via `set` and reuse selectors to avoid extra renders.
- Persist anything that must survive restarts through `StorageAdapter`, which JSON-stringifies objects and handles AsyncStorage errors uniformly.
- When adding new env-backed constants, prefer exposing them through `src/core/constants` so presentation code does not reach into `@env` directly.
- Keep offline-first logic (SQLite repositories, file caches) inside infrastructure; presentation should only consume repository interfaces.

## Networking, Encryption, And Tokens

- All HTTP calls must extend `AbstractApi` (`src/config/api/abstract.api.ts`) so request/response interception, encryption (`CryptAdapter`), and token refresh logic stay centralized.
- Never send plain JSON bodies; the interceptor wraps payloads inside `{Request: <encrypted>}` unless the content type is multipart or the base URL signals downloads.
- Authorization headers and cookie refresh tokens are injected automatically; avoid duplicating them downstream.
- Token refresh already guards concurrent requests via `failedQueue`; when extending the API class, reuse `processQueue` semantics and avoid manual retries.
- Whenever you need encryption outside of HTTP, instantiate `CryptAdapter` with the correct public key or reuse the singleton to keep AES/RSA behavior consistent.
- Logout flows must clear AsyncStorage keys defined in `src/core/constants/auth.types.ts` to keep the auth store and API interceptors in sync.

## UI, Forms, And Navigation

- React Navigation stack wiring lives in `src/presentation/routes/StackNavigator`; add screens there using descriptive route names and guard them in `useAuthStore.isAuthenticated` when needed.
- UI components should rely on React Native Paper primitives for consistency; wrap them via the theme context in `src/presentation/theme` when colors or typography diverge.
- Complex form inputs live under `src/presentation/simon/components`; keep them controlled by React Hook Form or the existing local state patterns.
- Snackbar notifications come from `useAppStore`; trigger UI feedback by setting `message`, `type`, and `visible` instead of sprinkling Alert dialogs.
- Respect the root `App` jailbreak/root checks (JailMonkey); do not short-circuit them when debugging—use real/simulated safe devices.
- Keep day/time math centralized with `dayjs`; register any new plugins beside the existing `dayjs.extend` calls in `App.tsx`.

## Offline And Persistence

- Offline monitoring writes through `OfflineMonitoringService`, which wraps a singleton SQLite repository; always call `initialize` before use and `close` on teardown hooks.
- Datasources live under `src/infraestructure/datasources/sqlite`; extend them with migrations rather than ad-hoc SQL scattered across components.
- DTO ↔ entity translations belong in `src/infraestructure/mappers`; update both mapper directions when contract fields change.
- File persistence and attachments rely on `offline-files.service` and react-native-fs/documents picker; respect platform permission flows already abstracted there.
- When caching menu or role data, encrypt values with `CryptAdapter.ecy` before storing them via `StorageAdapter` to match the existing `ROLSITE_CODE` handling.

## Error Handling And Logging

- Always wrap storage and network mutations in try/catch; log with contextual Spanish messages (see `auth.store.ts`) and surface user-safe errors through the Snackbar.
- If a function can recover, return typed fallbacks (`Promise<boolean>`, `[]`) like the auth store does; reserve throwing for unexpected states so callers must handle them.
- Keep console logging purposeful: use emojis and concise prefixes already present (`✅`, `❌`, `🔄`) to make device logs readable.
- For fatal API issues, call `AbstractApi.onLogout()` to trigger global sign-out rather than patching the auth store manually.
- Never swallow Axios errors silently; either rethrow or convert to domain errors so presentation can display a message.

## Testing Expectations

- Jest preset is `react-native`; mock or silence native modules (AsyncStorage, react-native-reanimated) if a test needs them—reuse community mocks where possible.
- Component tests belong in `__tests__` or beside the component with a `.test.tsx` suffix; keep imports relative to the tested file for clarity.
- Use `renderer.create` or React Testing Library depending on the component; follow the current snapshot style until the suite adds RTL.
- To focus on one test interactively: `npm test -- --runTestsByPath src/presentation/screens/YourScreen.test.tsx`.
- Keep tests deterministic; mock Date/dayjs when asserting formatted strings to avoid locale drift.
- Lint test files too—`eslint .` already includes `__tests__`.

## Native And Build Caveats

- Pod or Gradle updates may regenerate files; never commit derived artifacts unless the user explicitly asks for the native diff.
- When adding native dependencies, install them via npm, run `pod install`, and double-check `android/app/build.gradle` auto-linking before editing native code.
- Keep `babel.config.js` plugin order (reanimated first, dotenv last) to avoid Metro crashes.
- Remember `react-native-reanimated/plugin` requires you to rebuild the app after config changes.
- For SVG or asset issues, clear caches: `watchman watch-del-all`, `rm -rf $TMPDIR/metro-*`, then restart Metro.

## Security And Secrets

- `.env` is consumed via `react-native-dotenv`; never hardcode API keys—reference them with `import {APIKEY} from '@env';`.
- Encrypt personally identifiable data before persisting locally, mirroring how the auth store encrypts `userData` and `ROLSITE_CODE`.
- Use `StorageAdapter` exclusively so encryption/logging stays centralized and exceptions surface properly.
- Do not log decrypted payloads or keys; rely on the cURL generator inside `AbstractApi` for debugging requests.
- Cursor or Copilot rules are not defined in this repo; follow this document plus the React Native community defaults.

## Contribution Workflow

- Create focused branches, keep commits scoped, and describe the "why" (e.g., "strengthen offline monitoring schema") rather than the "what" only.
- Before raising a PR, run `npm run lint` and `npm test`; run platform builds if you touched native configs.
- Document new flows in Spanish README variants if the change impacts business stakeholders.
- When touching complex modules (auth, monitoring, encryption), leave breadcrumb comments only when logic is non-obvious, mirroring the concise Spanish comments already present.
- Keep this AGENTS guide updated whenever workflows change; target roughly 150 lines (like now) to stay scannable yet thorough.

## Presentation Simon Module

- The migrated SIMON widgets live in `src/presentation/simon`; preserve its subfolders (`components`, `hooks`, `services`, `interfaces`, `utils`, `examples`) when adding new question types.
- Components expect props shaped by the interfaces in the same tree; extend those types instead of inventing ad-hoc objects in screens.
- Legacy Angular logic was ported verbatim; refactor gradually but avoid breaking the expected schema the backend delivers.
- Most Simon components are controlled inputs; wire them to React Hook Form's `control` prop or mimic the local `useState` patterns already checked into that folder.
- Keep UI copy, hints, and validation errors in Spanish until product approves a translation.

## State Stores And Feedback

- `AuthProvider` supplies context wrappers for navigation; rely on it rather than bypassing with manual token checks.
- `useAppStore` drives the global Snackbar; dispatch `showSnackbar({message, type})` instead of using `Alert.alert`.
- Global offline banners are handled by `OfflineStatusBar`; if you add new network watchers, route them through this component or a sibling provider.
- Avoid storing sensitive values in React state; encrypt before persisting via `StorageAdapter` like the logout attempts counter demonstrates.
- When touching `useAuthStore`, update both the local `set` calls and the persistence side effects so tokens, roles, and site selections stay synchronized.

## Documentation And Knowledge

- Business rules and historic rationales live in the Spanish PDFs/MD files at the repo root (`SIMON-*`, `DOCUMENTACION_MEJORAS_AUTH.md`); consult and update them when workflows change.
- Add architecture notes for new infrastructure services to `README copy.md` or create a sibling Spanish guide if the change targets non-technical stakeholders.
- Keep changelog-style bullet points in `README.md` focused on features, not implementation minutiae.
- When syncing with external teams, record assumptions or API contracts inside `src/infraestructure/interfaces/*` so future agents can trace them quickly.
- If you introduce automation scripts, document invocation steps under `tools/scripts/` with inline README snippets.

## Performance, Accessibility, And UX

- Favor FlatList/SectionList for long datasets; turn on `removeClippedSubviews` and provide stable `keyExtractor` values to avoid jank on low-end tablets.
- Ensure every interactive control is reachable via accessibility labels; Paper components expose `accessibilityLabel` props that should be populated in Spanish.
- Debounce expensive validators or search inputs; reuse the helper utilities inside `src/presentation/hooks` instead of reinventing them per screen.
- When adding animations, keep them declarative (Reanimated or Animated API) and prefer reduced-motion fallbacks triggered via platform accessibility settings.
- Profile slow renders with the React DevTools profiler before introducing caching layers; many stores already rely on Zustand selectors for memoization.
