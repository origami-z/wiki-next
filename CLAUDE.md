# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with TypeScript, featuring internationalization (i18n) support and theming. The project uses the App Router architecture with React 19.

## Key Technologies

- **Next.js 15**: App Router with React Server Components
- **next-intl**: Internationalization with support for English (en) and Chinese (zh)
- **next-themes**: Dark/light theme switching with system preference support
- **@base-ui/react**: Base UI components library
- **Testing**: Jest for unit tests, Playwright for E2E tests

## Commands

### Development
```bash
npm run dev              # Start development server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Testing
```bash
npm test                 # Run Jest unit tests
npm run test:watch       # Run Jest in watch mode
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright E2E tests (auto-starts dev server)
npm run test:e2e:ui      # Run Playwright with UI mode
npm run test:e2e:headed  # Run Playwright in headed mode (visible browser)
npm run test:all         # Run all tests (unit + E2E)
```

### Test Configuration
- Unit tests: Located in `__tests__/` directory, must match `*.test.ts` or `*.test.tsx`
- E2E tests: Located in `e2e/` directory as `*.spec.ts`
- Jest uses `@/` path alias for imports (mapped to `src/`)

## Development Practices

### Git Commits
When creating commits, always include changes from the `./claude-logs` folder along with your code changes. These logs provide valuable context about the development process.

### Bug Fixes and Testing
When fixing a bug or resolving a problem, always add corresponding tests to prevent regression:

- **Unit tests** for logic bugs, utility functions, or component behavior issues
- **E2E tests** for user-facing bugs or routing/navigation issues
- Tests should verify the bug is fixed and prevent it from reoccurring

See `__tests__/middleware-location.test.ts` as an example of comprehensive testing for a critical configuration issue.

## Architecture

### Internationalization (i18n)

The app uses next-intl with a carefully configured middleware setup:

1. **Routing Configuration** (`src/i18n/routing.ts`):
   - Supported locales: `en` (default), `zh`
   - Uses `localePrefix: 'as-needed'` - English URLs have no prefix (e.g., `/games`), Chinese URLs use `/zh` prefix (e.g., `/zh/games`)
   - Provides navigation wrappers: `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`

2. **Request Configuration** (`src/i18n/request.ts`):
   - Loads locale messages from `messages/{locale}.json`
   - Validates locale and falls back to default if invalid

3. **Middleware** (`src/middleware.ts`):
   - **CRITICAL**: Middleware MUST be at `src/middleware.ts` (not project root)
   - Handles i18n routing using next-intl middleware
   - Blocks `/admin` routes in production (rewrites to 404)
   - Matcher pattern: `["/", "/(zh|en)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"]`
   - Excludes `api`, `_next`, `_vercel` paths and files with extensions

4. **Translation Files**: `messages/en.json` and `messages/zh.json`

### Theming System

Uses next-themes with CSS custom properties:

- Theme attribute: `data-theme` (set on `<html>` element)
- Default: System preference with automatic detection
- Theme definitions in `src/styles/themes/variables.css`
- Provider: `ThemeProvider` wraps the app in root layout
- `suppressHydrationWarning` on `<html>` prevents theme flash

### Component Organization

```
src/components/
├── providers/         # Context providers (ThemeProvider)
├── layout/           # Layout components (Header, Footer)
├── features/         # Feature-specific components (ThemeToggle, LocaleSwitch)
└── shared/           # Reusable components (PlaceholderImage)
```

Each component has:
- `index.tsx` - Component implementation
- `{Component}.module.css` - CSS Module styles

### Layout Structure

Root layout (`src/app/[locale]/layout.tsx`):
1. Validates locale parameter
2. Loads messages via `getMessages()`
3. Wraps app with `NextIntlClientProvider` and `ThemeProvider`
4. Uses isolation context for Base UI portals (`style={{ isolation: 'isolate' }}`)
5. Standard layout: Header → Main Content → Footer

### Path Aliases

- `@/*` maps to `src/*` (configured in `tsconfig.json` and `jest.config.js`)

## Important Implementation Notes

### Middleware Location
The middleware file MUST be at `src/middleware.ts`, not in the project root. This is validated by unit tests and critical for Next.js App Router with i18n to function correctly.

### Admin Route Protection
Admin routes are blocked in production via middleware rewrite to 404. In development, admin routes are accessible.

### Base UI Portals
The root element requires `isolation: 'isolate'` CSS property for Base UI portals to work correctly.

### Theme Hydration
The `<html>` element needs `suppressHydrationWarning` to prevent Next.js warnings about theme attribute mismatches during hydration.
