/**
 * JSON data loader with React cache for server-side data fetching
 * Loads game data from file-based JSON storage with i18n support
 */

import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';
import type { GameMeta, GameEntity, GameData } from '@/types/game';

// Data directory path
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'games');

// Default locale (used as base data)
const DEFAULT_LOCALE = 'en';

/**
 * Deep merge two objects, with source overriding target for matching keys
 * Only merges translatable text fields (name, description)
 */
function mergeTranslations<T>(target: T, source: Partial<T>): T {
  if (!source) return target;

  const result = { ...target } as T;

  // Only merge specific translatable fields
  const translatableFields = ['name', 'description'] as const;

  for (const field of translatableFields) {
    if (field in source && (source as Record<string, unknown>)[field] !== undefined) {
      (result as Record<string, unknown>)[field] = (source as Record<string, unknown>)[field];
    }
  }

  return result;
}

/**
 * Try to load a locale-specific file, returns null if not found
 */
async function tryLoadLocaleFile<T>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

/**
 * Load game metadata (_meta.json) with locale support
 * Cached per request for performance
 */
export const loadGameMeta = cache(async (gameSlug: string, locale: string = DEFAULT_LOCALE): Promise<GameMeta> => {
  const basePath = path.join(DATA_DIR, gameSlug, '_meta.json');
  const localePath = path.join(DATA_DIR, gameSlug, `_meta.${locale}.json`);

  try {
    const content = await fs.readFile(basePath, 'utf-8');
    const baseMeta = JSON.parse(content) as GameMeta;

    // If locale is default or same as base, return base data
    if (locale === DEFAULT_LOCALE) {
      return baseMeta;
    }

    // Try to load locale-specific overrides
    const localeOverrides = await tryLoadLocaleFile<Partial<GameMeta>>(localePath);

    if (localeOverrides) {
      // Merge locale overrides with base data
      const mergedMeta = mergeTranslations(baseMeta, localeOverrides);

      // Also merge category translations if present
      if (localeOverrides.categories && baseMeta.categories) {
        mergedMeta.categories = baseMeta.categories.map((baseCategory, index) => {
          const localeCategory = localeOverrides.categories?.[index];
          if (localeCategory) {
            return mergeTranslations(baseCategory, localeCategory);
          }
          return baseCategory;
        });
      }

      return mergedMeta;
    }

    return baseMeta;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Game metadata not found: ${gameSlug}`);
    }
    throw error;
  }
});

/**
 * Load entities of a specific type with locale support
 * Cached per request for performance
 */
export const loadEntities = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string,
    locale: string = DEFAULT_LOCALE
  ): Promise<T[]> => {
    const basePath = path.join(DATA_DIR, gameSlug, `${entityType}.json`);
    const localePath = path.join(DATA_DIR, gameSlug, `${entityType}.${locale}.json`);

    try {
      const content = await fs.readFile(basePath, 'utf-8');
      const baseEntities = JSON.parse(content) as T[];

      // If locale is default, return base data
      if (locale === DEFAULT_LOCALE) {
        return baseEntities;
      }

      // Try to load locale-specific overrides
      const localeOverrides = await tryLoadLocaleFile<Record<string, Partial<T>>>(localePath);

      if (localeOverrides) {
        // Merge locale overrides with base entities (keyed by id or slug)
        return baseEntities.map((entity) => {
          const override = localeOverrides[entity.id] || localeOverrides[entity.slug];
          if (override) {
            return mergeTranslations(entity, override);
          }
          return entity;
        });
      }

      return baseEntities;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Entity type not found: ${gameSlug}/${entityType}`);
      }
      throw error;
    }
  }
);

/**
 * Load a single entity by slug with locale support
 * Cached per request for performance
 */
export const loadEntityBySlug = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string,
    entitySlug: string,
    locale: string = DEFAULT_LOCALE
  ): Promise<T | null> => {
    const entities = await loadEntities<T>(gameSlug, entityType, locale);
    return entities.find((entity) => entity.slug === entitySlug) || null;
  }
);

/**
 * Load all game data (metadata + all entities) with locale support
 * Cached per request for performance
 */
export const loadGameData = cache(async (gameSlug: string, locale: string = DEFAULT_LOCALE): Promise<GameData> => {
  const meta = await loadGameMeta(gameSlug, locale);
  const entities: Record<string, GameEntity[]> = {};

  // Load all entity types defined in metadata
  await Promise.all(
    meta.categories.map(async (category) => {
      try {
        entities[category.entityType] = await loadEntities(
          gameSlug,
          category.entityType,
          locale
        );
      } catch (error) {
        console.warn(`Failed to load ${category.entityType}:`, error);
        entities[category.entityType] = [];
      }
    })
  );

  return { meta, entities };
});

/**
 * Get list of all available games with locale support
 * Scans the data directory for game folders
 * Cached per request for performance
 */
export const loadAvailableGames = cache(async (locale: string = DEFAULT_LOCALE): Promise<GameMeta[]> => {
  try {
    const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
    const gameMetaList: GameMeta[] = [];

    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          try {
            const meta = await loadGameMeta(entry.name, locale);
            gameMetaList.push(meta);
          } catch (error) {
            console.warn(`Failed to load game metadata for ${entry.name}:`, error);
          }
        })
    );

    return gameMetaList;
  } catch (error) {
    console.error('Failed to read games directory:', error);
    return [];
  }
});

/**
 * Search entities by query string with locale support
 * Searches in name and description fields
 */
export const searchEntities = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string,
    query: string,
    locale: string = DEFAULT_LOCALE
  ): Promise<T[]> => {
    const entities = await loadEntities<T>(gameSlug, entityType, locale);
    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      return entities;
    }

    return entities.filter(
      (entity) =>
        entity.name.toLowerCase().includes(normalizedQuery) ||
        entity.description?.toLowerCase().includes(normalizedQuery)
    );
  }
);

/**
 * Filter entities by custom predicate with locale support
 */
export const filterEntities = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string,
    predicate: (entity: T) => boolean,
    locale: string = DEFAULT_LOCALE
  ): Promise<T[]> => {
    const entities = await loadEntities<T>(gameSlug, entityType, locale);
    return entities.filter(predicate);
  }
);

/**
 * Get entity count for a specific type
 */
export const getEntityCount = cache(
  async (gameSlug: string, entityType: string): Promise<number> => {
    try {
      const entities = await loadEntities(gameSlug, entityType);
      return entities.length;
    } catch {
      return 0;
    }
  }
);

/**
 * Validate that a game exists
 */
export const gameExists = cache(async (gameSlug: string): Promise<boolean> => {
  try {
    await loadGameMeta(gameSlug);
    return true;
  } catch {
    return false;
  }
});

/**
 * Validate that an entity type exists for a game
 */
export const entityTypeExists = cache(
  async (gameSlug: string, entityType: string): Promise<boolean> => {
    try {
      await loadEntities(gameSlug, entityType);
      return true;
    } catch {
      return false;
    }
  }
);
