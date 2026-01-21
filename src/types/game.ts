/**
 * TypeScript interfaces for game data models
 */

// ============================================================================
// Game Metadata Types
// ============================================================================

export interface GameMeta {
  id: string;
  slug: string;
  name: string;
  description?: string;
  categories: CategoryDefinition[];
  relationships?: RelationshipDefinition[];
}

export interface CategoryDefinition {
  id: string;
  slug: string;
  name: string;
  entityType: string;
  displayFields: DisplayField[];
  icon?: string;
  description?: string;
}

export interface DisplayField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'badge' | 'image';
  required?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export interface RelationshipDefinition {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fieldName: string;
}

// ============================================================================
// Generic Entity Type (for flexible multi-game support)
// ============================================================================

export interface GameEntity {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  [key: string]: unknown; // Allow additional custom fields
}

// ============================================================================
// Wittle Defender Specific Types
// ============================================================================

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Element = 'fire' | 'ice' | 'lightning' | 'poison' | 'nature' | 'holy' | 'dark' | 'neutral';
export type Role = 'tank' | 'dps' | 'support' | 'healer' | 'control' | 'assassin';
export type Tier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface Hero extends GameEntity {
  rarity: Rarity;
  element: Element;
  role: Role;
  tier: Tier;
  stats: HeroStats;
  skills: string[]; // Skill IDs
  synergies?: string[]; // Hero IDs that synergize well
  counters?: string[]; // Hero IDs that counter this hero
  counteredBy?: string[]; // Hero IDs that are countered by this hero
}

export interface HeroStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate?: number;
  critDamage?: number;
}

export interface Dungeon extends GameEntity {
  type: 'story' | 'event' | 'challenge' | 'raid';
  difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'nightmare';
  recommendedLevel?: number;
  recommendedHeroes?: string[]; // Hero IDs
  rewards?: DungeonReward[];
  stages?: DungeonStage[];
}

export interface DungeonReward {
  itemId: string;
  itemName: string;
  quantity: number;
  dropRate?: number; // Percentage (0-100)
  rarity?: Rarity;
}

export interface DungeonStage {
  stageNumber: number;
  name: string;
  enemies: string[]; // Enemy hero IDs
  boss?: string; // Boss hero ID
  rewards: DungeonReward[];
}

export interface Skill extends GameEntity {
  type: 'active' | 'passive' | 'ultimate';
  element?: Element;
  cooldown?: number; // In seconds or turns
  manaCost?: number;
  effects: SkillEffect[];
  targetType: 'self' | 'single' | 'aoe' | 'all';
}

export interface SkillEffect {
  type: 'damage' | 'heal' | 'buff' | 'debuff' | 'shield' | 'summon' | 'control';
  value: number;
  duration?: number; // In turns for buffs/debuffs
  description: string;
}

export interface Mechanic extends GameEntity {
  category: 'combat' | 'progression' | 'roguelike' | 'social' | 'economy';
  relatedEntities?: {
    heroes?: string[];
    dungeons?: string[];
    skills?: string[];
  };
}

// ============================================================================
// Data Loading Types
// ============================================================================

export interface GameData {
  meta: GameMeta;
  entities: Record<string, GameEntity[]>;
}

export interface LoaderOptions {
  gameSlug: string;
  categorySlug?: string;
  entityId?: string;
}

export interface SearchFilters {
  rarity?: Rarity[];
  element?: Element[];
  role?: Role[];
  tier?: Tier[];
  query?: string;
}
