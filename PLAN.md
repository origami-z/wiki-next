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
│   │   │   ├── admin/         # Admin routes (dev only)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx   # Admin dashboard
│   │   │   │   └── [gameSlug]/
│   │   │   │       └── [entityType]/
│   │   │   │           ├── page.tsx        # Entity list
│   │   │   │           ├── new/page.tsx    # Create entity
│   │   │   │           └── [entityId]/page.tsx  # Edit entity
│   │   │   └── games/
│   │   │       ├── page.tsx   # Games listing
│   │   │       └── [gameSlug]/
│   │   │           ├── page.tsx              # Game overview
│   │   │           ├── events/
│   │   │           │   ├── page.tsx          # Events overview
│   │   │           │   └── [eventSlug]/page.tsx  # Event detail
│   │   │           └── [categorySlug]/
│   │   │               ├── page.tsx          # Category listing
│   │   │               └── [itemSlug]/page.tsx  # Item detail
│   │   └── globals.css
│   │   └── api/
│   │       └── admin/         # Admin API routes (dev only)
│   │           └── [gameSlug]/[entityType]/route.ts
│   ├── components/
│   │   ├── ui/                # Base UI wrappers (Button, Select, Dialog, Tabs)
│   │   ├── layout/            # Header, Footer, Sidebar, MobileNav
│   │   ├── features/          # ThemeToggle, LocaleSwitch, SearchDialog
│   │   │   └── Events/        # Event components
│   │   │       ├── EventCard/
│   │   │       ├── EventDetail/
│   │   │       ├── EventStages/
│   │   │       ├── EventCountdown/
│   │   │       └── EventTimeline/
│   │   ├── shared/            # PlaceholderImage, Badge, Card, Grid
│   │   └── admin/             # Admin components (dev only)
│   │       ├── AdminLayout/
│   │       ├── EntityForm/    # Dynamic form from schema
│   │       ├── EntityList/
│   │       └── JsonPreview/
│   ├── data/games/            # JSON data files per game
│   │   └── wittle-defender/
│   │       ├── _meta.json     # Game metadata & category definitions
│   │       ├── heroes.json
│   │       ├── dungeons.json
│   │       ├── skills.json
│   │       ├── mechanics.json
│   │       └── events.json    # Event data
│   ├── i18n/                  # next-intl configuration
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   ├── lib/
│   │   ├── data/              # JSON loaders with React cache
│   │   ├── hooks/             # useMediaQuery, useMounted
│   │   ├── events/            # Event system utilities
│   │   │   ├── event-calculator.ts  # isActive, getCurrentOccurrence
│   │   │   └── event-predictor.ts   # predictFutureOccurrences
│   │   └── admin/             # Admin utilities (dev only)
│   │       ├── schemas/       # Entity schemas per game
│   │       ├── validation.ts
│   │       └── file-operations.ts
│   ├── styles/themes/         # CSS variables for light/dark
│   └── types/                 # TypeScript interfaces
│       ├── game.ts
│       ├── events.ts          # Event type definitions
│       └── admin.ts           # Admin schema types
├── middleware.ts              # Locale detection + admin route blocking
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

### 7. Admin Page (Local Development Only)
Development-only interface for managing game data JSON files without manual editing.

**Access Control:**
- Middleware blocks `/admin` routes when `NODE_ENV !== 'development'`
- API routes return 404 in production
- Build excludes admin code in production

**Schema-Based Forms:**
```typescript
interface EntitySchema {
  entityType: string;           // 'hero', 'dungeon', 'skill', etc.
  fields: SchemaField[];        // Field definitions with types & validation
  displayField: string;         // Field to show in lists
  slugField: string;            // Field used for URL slug
}

interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'array';
  required: boolean;
  label: string;
  options?: { value: string; label: string }[];  // For select fields
  validation?: { min?: number; max?: number; pattern?: string };
}
```

**Features:**
- Dynamic form generation from entity schemas
- Real-time validation against schema
- JSON preview panel before saving
- CRUD operations via API routes that read/write JSON files

### 8. Game Event System
Track, display, and predict game events including cyclic/recurring events.

**Event Data Model:**
```typescript
interface GameEvent {
  id: string;
  slug: string;
  name: string;
  type: 'one_time' | 'recurring';
  startDate: string;           // ISO 8601 format
  endDate: string;
  recurrence?: {
    type: 'weekly' | 'biweekly' | 'custom';
    intervalDays?: number;     // e.g., 21 for "every 3 weeks"
    durationDays: number;      // e.g., 7 for "lasts 1 week"
  };
  stages?: EventStage[];
  category?: string;           // 'seasonal', 'weekly', 'special'
}

interface EventStage {
  id: string;
  name: string;
  order: number;
  requirements: { itemId: string; itemName: string; quantity: number }[];
  rewards: { itemId: string; itemName: string; quantity: number; rarity?: string }[];
}
```

**Key Functions:**
- `isEventActive(event, date)` - Check if event is currently running
- `getCurrentOccurrence(event, date)` - Get current occurrence details for recurring events
- `predictFutureOccurrences(event, count)` - Predict next N occurrences for cyclic events

**Example: Wittle Defender Event (3-week cycle, 1-week duration):**
```json
{
  "id": "wittle-defender-challenge",
  "name": "Wittle Defender Challenge",
  "type": "recurring",
  "startDate": "2024-01-01T00:00:00Z",
  "recurrence": {
    "type": "custom",
    "intervalDays": 21,
    "durationDays": 7
  },
  "stages": [
    {
      "name": "Stage 1 - Gathering",
      "order": 1,
      "requirements": [{ "itemName": "Crystal Shard", "quantity": 50 }],
      "rewards": [{ "itemName": "Gold", "quantity": 5000 }]
    },
    {
      "name": "Stage 2 - Battle",
      "order": 2,
      "requirements": [{ "itemName": "Battle Token", "quantity": 25 }],
      "rewards": [{ "itemName": "Epic Hero Chest", "quantity": 1, "rarity": "epic" }]
    }
  ]
}
```

**UI Components:**
- EventCard: Display event with status badge (Active/Upcoming)
- EventCountdown: Live countdown timer to start/end
- EventStages: Show stages with requirements and rewards
- EventTimeline: Visual timeline of upcoming events
- RecurringEventPredictor: Display predicted future occurrences

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

### Phase 3.5: Admin System (Dev Only)
22. `src/types/admin.ts` - Schema interfaces
23. `src/lib/admin/schemas/wittle-defender.ts` - Entity schemas
24. `src/lib/admin/validation.ts` - Validation logic
25. `src/lib/admin/file-operations.ts` - JSON file read/write
26. `src/app/api/admin/[gameSlug]/[entityType]/route.ts` - CRUD API
27. `src/components/admin/AdminLayout/` - Admin layout with sidebar
28. `src/components/admin/EntityForm/` - Dynamic form from schema
29. `src/components/admin/EntityList/` - Entity list view
30. `src/components/admin/JsonPreview/` - JSON preview panel
31. `src/app/[locale]/admin/layout.tsx` - Admin layout
32. `src/app/[locale]/admin/page.tsx` - Admin dashboard
33. `src/app/[locale]/admin/[gameSlug]/[entityType]/page.tsx` - Entity list

### Phase 3.6: Event System
34. `src/types/events.ts` - Event interfaces
35. `src/lib/events/event-calculator.ts` - isActive, getCurrentOccurrence
36. `src/lib/events/event-predictor.ts` - predictFutureOccurrences
37. `src/lib/events/event-loader.ts` - Load and compute events
38. `src/data/games/wittle-defender/events.json` - Event data
39. `src/components/features/Events/EventCard/` - Event card component
40. `src/components/features/Events/EventCountdown/` - Countdown timer
41. `src/components/features/Events/EventStages/` - Stage requirements/rewards
42. `src/components/features/Events/EventTimeline/` - Visual timeline
43. `src/app/[locale]/games/[gameSlug]/events/page.tsx` - Events overview
44. `src/app/[locale]/games/[gameSlug]/events/[eventSlug]/page.tsx` - Event detail

### Phase 4: Pages
45. `src/app/[locale]/page.tsx` - Home
46. `src/app/[locale]/games/page.tsx` - Games list
47. `src/app/[locale]/games/[gameSlug]/page.tsx` - Game detail
48. `src/app/[locale]/games/[gameSlug]/[categorySlug]/page.tsx` - Category list
49. `src/app/[locale]/games/[gameSlug]/[categorySlug]/[itemSlug]/page.tsx` - Item detail

### Phase 5: Translations
50. `messages/en.json` - English translations (including event UI strings)
51. `messages/zh.json` - Simplified Chinese translations

## Verification Plan
1. Run `npm run dev` and verify home page loads
2. Test theme switching (light/dark/system)
3. Test locale switching (en/zh) with URL changes
4. Navigate through games → category → item detail
5. Verify responsive layout on mobile/tablet/desktop viewports
6. Verify placeholder images show when no image provided
7. Run `npm run build` to verify static generation works
8. Deploy to Vercel and test production build

### Admin Page Verification (Dev Only)
9. Verify admin page accessible at `/admin` in dev mode
10. Verify admin page returns 404 in production build
11. Test entity CRUD: create, read, update, delete operations
12. Verify schema validation catches invalid data
13. Confirm JSON files are updated correctly after saves

### Event System Verification
14. Verify events page shows active/upcoming/past events
15. Test countdown timer updates in real-time
16. Verify cyclic event prediction is accurate (e.g., 3-week interval)
17. Test event detail page shows stages with requirements/rewards
18. Confirm recurring events display next occurrence correctly
