/**
 * Entity Schemas for Wittle Defender
 * Defines the structure and validation rules for each entity type
 */

import type { EntitySchema, GameSchemas } from '@/types/admin';

/**
 * Hero Schema
 */
const heroSchema: EntitySchema = {
  entityType: 'heroes',
  label: 'Hero',
  pluralLabel: 'Heroes',
  displayField: 'name',
  slugField: 'slug',
  searchFields: ['name', 'description', 'element', 'role', 'rarity'],
  sortField: 'tier',
  sortOrder: 'desc',
  fields: [
    {
      name: 'id',
      type: 'string',
      required: true,
      label: 'ID',
      description: 'Unique identifier (e.g., hero-001)',
      placeholder: 'hero-001',
    },
    {
      name: 'slug',
      type: 'string',
      required: true,
      label: 'Slug',
      description: 'URL-friendly identifier (e.g., ember-knight)',
      placeholder: 'ember-knight',
      validation: {
        pattern: '^[a-z0-9-]+$',
      },
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      label: 'Name',
      placeholder: 'Ember Knight',
      validation: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      label: 'Description',
      placeholder: 'A fearless warrior wielding flames...',
      validation: {
        minLength: 10,
        maxLength: 500,
      },
    },
    {
      name: 'image',
      type: 'url',
      required: false,
      label: 'Image URL',
      placeholder: '/images/heroes/ember-knight.png',
    },
    {
      name: 'rarity',
      type: 'select',
      required: true,
      label: 'Rarity',
      options: [
        { value: 'common', label: 'Common' },
        { value: 'rare', label: 'Rare' },
        { value: 'epic', label: 'Epic' },
        { value: 'legendary', label: 'Legendary' },
        { value: 'mythic', label: 'Mythic' },
      ],
    },
    {
      name: 'element',
      type: 'select',
      required: true,
      label: 'Element',
      options: [
        { value: 'fire', label: 'Fire' },
        { value: 'ice', label: 'Ice' },
        { value: 'lightning', label: 'Lightning' },
        { value: 'poison', label: 'Poison' },
        { value: 'holy', label: 'Holy' },
        { value: 'dark', label: 'Dark' },
        { value: 'nature', label: 'Nature' },
        { value: 'physical', label: 'Physical' },
      ],
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      label: 'Role',
      options: [
        { value: 'tank', label: 'Tank' },
        { value: 'dps', label: 'DPS' },
        { value: 'support', label: 'Support' },
        { value: 'healer', label: 'Healer' },
        { value: 'control', label: 'Control' },
      ],
    },
    {
      name: 'tier',
      type: 'select',
      required: true,
      label: 'Tier',
      options: [
        { value: 'S', label: 'S' },
        { value: 'A', label: 'A' },
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
        { value: 'D', label: 'D' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      required: true,
      label: 'Stats',
      description: 'JSON object with hp, attack, defense, speed, critRate, critDamage',
    },
    {
      name: 'skills',
      type: 'array',
      required: false,
      label: 'Skills',
      description: 'Array of skill IDs (e.g., ["skill-001", "skill-002"])',
    },
    {
      name: 'synergies',
      type: 'array',
      required: false,
      label: 'Synergies',
      description: 'Array of hero IDs that synergize well',
    },
    {
      name: 'counters',
      type: 'array',
      required: false,
      label: 'Counters',
      description: 'Array of hero IDs this hero counters',
    },
    {
      name: 'counteredBy',
      type: 'array',
      required: false,
      label: 'Countered By',
      description: 'Array of hero IDs that counter this hero',
    },
  ],
};

/**
 * Dungeon Schema
 */
const dungeonSchema: EntitySchema = {
  entityType: 'dungeons',
  label: 'Dungeon',
  pluralLabel: 'Dungeons',
  displayField: 'name',
  slugField: 'slug',
  searchFields: ['name', 'description', 'type', 'difficulty'],
  sortField: 'recommendedLevel',
  sortOrder: 'asc',
  fields: [
    {
      name: 'id',
      type: 'string',
      required: true,
      label: 'ID',
      placeholder: 'dungeon-001',
    },
    {
      name: 'slug',
      type: 'string',
      required: true,
      label: 'Slug',
      placeholder: 'ember-fortress',
      validation: {
        pattern: '^[a-z0-9-]+$',
      },
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      label: 'Name',
      placeholder: 'Ember Fortress',
      validation: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      label: 'Description',
      validation: {
        minLength: 10,
        maxLength: 500,
      },
    },
    {
      name: 'image',
      type: 'url',
      required: false,
      label: 'Image URL',
      placeholder: '/images/dungeons/ember-fortress.png',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Type',
      options: [
        { value: 'story', label: 'Story' },
        { value: 'challenge', label: 'Challenge' },
        { value: 'event', label: 'Event' },
        { value: 'raid', label: 'Raid' },
        { value: 'tower', label: 'Tower' },
      ],
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      label: 'Difficulty',
      options: [
        { value: 'easy', label: 'Easy' },
        { value: 'normal', label: 'Normal' },
        { value: 'hard', label: 'Hard' },
        { value: 'extreme', label: 'Extreme' },
        { value: 'nightmare', label: 'Nightmare' },
      ],
    },
    {
      name: 'recommendedLevel',
      type: 'number',
      required: true,
      label: 'Recommended Level',
      validation: {
        min: 1,
        max: 100,
      },
    },
    {
      name: 'recommendedHeroes',
      type: 'array',
      required: false,
      label: 'Recommended Heroes',
      description: 'Array of hero IDs',
    },
    {
      name: 'rewards',
      type: 'array',
      required: false,
      label: 'Rewards',
      description: 'Array of reward objects with itemId, itemName, quantity, dropRate, rarity',
    },
    {
      name: 'stages',
      type: 'array',
      required: false,
      label: 'Stages',
      description: 'Array of stage objects (for multi-stage dungeons)',
    },
  ],
};

/**
 * Skill Schema
 */
const skillSchema: EntitySchema = {
  entityType: 'skills',
  label: 'Skill',
  pluralLabel: 'Skills',
  displayField: 'name',
  slugField: 'slug',
  searchFields: ['name', 'description', 'element', 'type'],
  sortField: 'name',
  sortOrder: 'asc',
  fields: [
    {
      name: 'id',
      type: 'string',
      required: true,
      label: 'ID',
      placeholder: 'skill-001',
    },
    {
      name: 'slug',
      type: 'string',
      required: true,
      label: 'Slug',
      placeholder: 'flame-slash',
      validation: {
        pattern: '^[a-z0-9-]+$',
      },
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      label: 'Name',
      placeholder: 'Flame Slash',
      validation: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      label: 'Description',
      validation: {
        minLength: 10,
        maxLength: 500,
      },
    },
    {
      name: 'image',
      type: 'url',
      required: false,
      label: 'Image URL',
      placeholder: '/images/skills/flame-slash.png',
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Type',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'passive', label: 'Passive' },
        { value: 'ultimate', label: 'Ultimate' },
      ],
    },
    {
      name: 'element',
      type: 'select',
      required: true,
      label: 'Element',
      options: [
        { value: 'fire', label: 'Fire' },
        { value: 'ice', label: 'Ice' },
        { value: 'lightning', label: 'Lightning' },
        { value: 'poison', label: 'Poison' },
        { value: 'holy', label: 'Holy' },
        { value: 'dark', label: 'Dark' },
        { value: 'nature', label: 'Nature' },
        { value: 'physical', label: 'Physical' },
        { value: 'neutral', label: 'Neutral' },
      ],
    },
    {
      name: 'cooldown',
      type: 'number',
      required: false,
      label: 'Cooldown (turns)',
      validation: {
        min: 0,
        max: 10,
      },
    },
    {
      name: 'manaCost',
      type: 'number',
      required: false,
      label: 'Mana Cost',
      validation: {
        min: 0,
        max: 200,
      },
    },
    {
      name: 'targetType',
      type: 'select',
      required: false,
      label: 'Target Type',
      options: [
        { value: 'single', label: 'Single' },
        { value: 'aoe', label: 'AoE' },
        { value: 'all', label: 'All Enemies' },
        { value: 'self', label: 'Self' },
        { value: 'ally', label: 'Ally' },
        { value: 'allAllies', label: 'All Allies' },
      ],
    },
    {
      name: 'effects',
      type: 'array',
      required: false,
      label: 'Effects',
      description: 'Array of effect objects with type, value, duration, description',
    },
  ],
};

/**
 * Mechanics Schema
 */
const mechanicsSchema: EntitySchema = {
  entityType: 'mechanics',
  label: 'Mechanic',
  pluralLabel: 'Mechanics',
  displayField: 'name',
  slugField: 'slug',
  searchFields: ['name', 'description', 'category'],
  sortField: 'name',
  sortOrder: 'asc',
  fields: [
    {
      name: 'id',
      type: 'string',
      required: true,
      label: 'ID',
      placeholder: 'mechanic-001',
    },
    {
      name: 'slug',
      type: 'string',
      required: true,
      label: 'Slug',
      placeholder: 'elemental-advantage',
      validation: {
        pattern: '^[a-z0-9-]+$',
      },
    },
    {
      name: 'name',
      type: 'string',
      required: true,
      label: 'Name',
      placeholder: 'Elemental Advantage',
      validation: {
        minLength: 2,
        maxLength: 50,
      },
    },
    {
      name: 'description',
      type: 'text',
      required: true,
      label: 'Description',
      validation: {
        minLength: 10,
        maxLength: 1000,
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      label: 'Category',
      options: [
        { value: 'combat', label: 'Combat' },
        { value: 'progression', label: 'Progression' },
        { value: 'roguelike', label: 'Roguelike' },
        { value: 'strategy', label: 'Strategy' },
        { value: 'collection', label: 'Collection' },
      ],
    },
    {
      name: 'example',
      type: 'text',
      required: false,
      label: 'Example',
      description: 'Example of how this mechanic works',
    },
  ],
};

/**
 * Wittle Defender Game Schemas
 */
export const wittleDefenderSchemas: GameSchemas = {
  gameId: 'wittle-defender-001',
  gameSlug: 'wittle-defender',
  gameName: 'Wittle Defender',
  entities: {
    heroes: heroSchema,
    dungeons: dungeonSchema,
    skills: skillSchema,
    mechanics: mechanicsSchema,
  },
};

/**
 * Get all available game schemas
 * (In the future, this could load from multiple game schema files)
 */
export function getAllGameSchemas(): GameSchemas[] {
  return [wittleDefenderSchemas];
}

/**
 * Get schema for a specific game
 */
export function getGameSchema(gameSlug: string): GameSchemas | null {
  const allSchemas = getAllGameSchemas();
  return allSchemas.find((schema) => schema.gameSlug === gameSlug) || null;
}

/**
 * Get entity schema for a specific game and entity type
 */
export function getEntitySchema(
  gameSlug: string,
  entityType: string
): EntitySchema | null {
  const gameSchema = getGameSchema(gameSlug);
  if (!gameSchema) return null;

  return gameSchema.entities[entityType] || null;
}
