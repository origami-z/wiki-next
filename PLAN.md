# Game Wiki App Implementation Plan

## Overview
Build a React wiki application for games using Next.js 15 App Router with TypeScript, hosted on Vercel with file-based JSON data storage.

## Tech Stack
- **Framework**: Next.js 15+ App Router, TypeScript
- **UI Library**: Base UI (`@base-ui/react`) - unstyled, accessible components
- **i18n**: next-intl (English default, Simplified Chinese)
- **Theming**: next-themes with CSS variables
- **Data**: File-based JSON (no external database)
- **Hosting**: Vercel

## Directory Structure
```
wiki-next/
├── public/images/              # Game images and placeholders
├── messages/                   # Translation files (en.json, zh.json)
├── src/
│   ├── app/
│   │   ├── [locale]/          # i18n routing
│   │   │   ├── layout.tsx     # Root layout with providers
│   │   │   ├── page.tsx       # Home page
│   │   │   └── games/
│   │   │       ├── page.tsx   # Games listing
│   │   │       └── [gameSlug]/
│   │   │           ├── page.tsx              # Game overview
│   │   │           └── [categorySlug]/
│   │   │               ├── page.tsx          # Category listing
│   │   │               └── [itemSlug]/page.tsx  # Item detail
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                # Base UI wrappers (Button, Select, Dialog, Tabs)
│   │   ├── layout/            # Header, Footer, Sidebar, MobileNav
│   │   ├── features/          # ThemeToggle, LocaleSwitch, SearchDialog
│   │   └── shared/            # PlaceholderImage, Badge, Card, Grid
│   ├── data/games/            # JSON data files per game
│   │   └── wittle-defender/
│   │       ├── _meta.json     # Game metadata & category definitions
│   │       ├── heroes.json
│   │       ├── dungeons.json
│   │       ├── skills.json
│   │       └── mechanics.json
│   ├── i18n/                  # next-intl configuration
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   ├── lib/
│   │   ├── data/              # JSON loaders with React cache
│   │   └── hooks/             # useMediaQuery, useMounted
│   ├── styles/themes/         # CSS variables for light/dark
│   └── types/                 # TypeScript interfaces
├── middleware.ts              # Locale detection middleware
├── next.config.ts
└── package.json
```

## Data Model (Flexible Multi-Game Support)

### Game Metadata (`_meta.json`)
Defines categories and their display fields dynamically:
```typescript
interface GameMeta {
  id: string;
  slug: string;
  name: string;
  categories: CategoryDefinition[];  // Heroes, Dungeons, Skills, etc.
  relationships: RelationshipDefinition[];  // Cross-entity links
}
```

### Wittle Defender Example Entities
- **Heroes**: 90+ with rarity, element, role, tier, skills, synergies
- **Dungeons**: Story/event/challenge types with difficulty, recommended heroes
- **Skills**: Elemental (fire/ice/lightning/poison) and support types
- **Mechanics**: Combat, progression, roguelike systems

## Key Implementation Details

### 1. Theme System
- CSS variables in `:root` and `[data-theme="dark"]`
- next-themes with `attribute="data-theme"` and `enableSystem`
- Three-way toggle: Light / Dark / System

### 2. i18n Setup
- Locales: `['en', 'zh']` with `localePrefix: 'as-needed'`
- URL structure: `/games/...` (English), `/zh/games/...` (Chinese)
- Translation keys for UI strings and game content names

### 3. Responsive Design
- Mobile-first CSS with breakpoints: 640px, 768px, 1024px, 1280px
- Mobile: Hamburger menu with slide-out navigation (Base UI Dialog)
- Desktop: Horizontal nav with dropdowns
- Grid: 1 col (mobile) → 2 col → 3 col → 4 col (desktop)

### 4. Base UI Portal Setup
Required in layout for popups/dialogs:
```tsx
<div className="root" style={{ isolation: 'isolate' }}>
  {children}
</div>
```

### 5. Placeholder Images
`PlaceholderImage` component with:
- Fallback SVG per entity type (hero, dungeon, skill, generic)
- Loading skeleton state
- Error handling with automatic fallback

### 6. Static Generation
All pages statically generated at build time using `generateStaticParams()` for optimal Vercel performance.

## Files to Create

### Phase 1: Project Setup
1. `package.json` - Dependencies
2. `next.config.ts` - Next.js + next-intl plugin
3. `tsconfig.json` - TypeScript config
4. `middleware.ts` - Locale routing middleware
5. `src/i18n/routing.ts` - Locale configuration
6. `src/i18n/request.ts` - Request config
7. `src/styles/themes/variables.css` - CSS design tokens

### Phase 2: Layout & Components
8. `src/app/[locale]/layout.tsx` - Root layout with providers
9. `src/app/globals.css` - Global styles + Base UI portal setup
10. `src/components/providers/ThemeProvider.tsx`
11. `src/components/layout/Header/` - Responsive header
12. `src/components/layout/Footer/`
13. `src/components/features/ThemeToggle/`
14. `src/components/features/LocaleSwitch/`
15. `src/components/shared/PlaceholderImage/`

### Phase 3: Data Layer
16. `src/types/game.ts` - TypeScript interfaces
17. `src/lib/data/loader.ts` - JSON file loader with cache
18. `src/data/games/wittle-defender/_meta.json`
19. `src/data/games/wittle-defender/heroes.json`
20. `src/data/games/wittle-defender/dungeons.json`
21. `src/data/games/wittle-defender/skills.json`

### Phase 4: Pages
22. `src/app/[locale]/page.tsx` - Home
23. `src/app/[locale]/games/page.tsx` - Games list
24. `src/app/[locale]/games/[gameSlug]/page.tsx` - Game detail
25. `src/app/[locale]/games/[gameSlug]/[categorySlug]/page.tsx` - Category list
26. `src/app/[locale]/games/[gameSlug]/[categorySlug]/[itemSlug]/page.tsx` - Item detail

### Phase 5: Translations
27. `messages/en.json` - English translations
28. `messages/zh.json` - Simplified Chinese translations

## Verification Plan
1. Run `npm run dev` and verify home page loads
2. Test theme switching (light/dark/system)
3. Test locale switching (en/zh) with URL changes
4. Navigate through games → category → item detail
5. Verify responsive layout on mobile/tablet/desktop viewports
6. Verify placeholder images show when no image provided
7. Run `npm run build` to verify static generation works
8. Deploy to Vercel and test production build
