# Badge/Enum Value Translations

## Date: 2026-01-26

## Summary
Added i18n support for badge/enum values displayed on entity cards and detail pages.

## Problem
Badge values like "legendary", "fire", "Tank" were displayed directly from the data without translation. These are enum values (rarity, element, role, tier, etc.) that need UI translations.

## Solution
Added enum translations to the UI message files and updated components to use them.

## Changes Made

### 1. Added Enum Translations to Message Files

**`messages/en.json`** and **`messages/zh.json`**:
- Added `enums` section with translations for all entity property values:
  - `rarity`: common, rare, epic, legendary, mythic
  - `element`: fire, ice, lightning, poison, holy, dark, nature, neutral
  - `role`: tank, control, assassin, dps, healer, support
  - `tier`: S, A, B, C
  - `skillType`: active, passive, ultimate
  - `targetType`: single, self, aoe, all
  - `dungeonType`: story, challenge, event, raid
  - `difficulty`: easy, normal, hard, expert, nightmare

### 2. Updated Category Page (`[categorySlug]/page.tsx`)
- Added `tEnums` translation function for enum values
- Updated badge displays to use translations:
  - Hero rarity, tier, element, role
  - Skill type, element, target type
  - Dungeon type, difficulty

### 3. Updated Item Detail Page (`[itemSlug]/page.tsx`)
- Added `tEnums` translation function for enum values
- Updated displays to use translations:
  - Hero quick stats (rarity, tier, element, role)
  - Skill meta info (type, element, target)
  - Dungeon meta info (type, difficulty)

## Translation Examples

| English | Chinese |
|---------|---------|
| Legendary | 传说 |
| Epic | 史诗 |
| Rare | 稀有 |
| Fire | 火 |
| Ice | 冰 |
| Tank | 坦克 |
| Assassin | 刺客 |
| DPS | 输出 |
| Active | 主动 |
| Passive | 被动 |
| Nightmare | 噩梦 |

## Build & Test Results
- Build: **Success** (131 static pages)
- Tests: **18 passed**
- Verified Chinese badge translations working via dev server
