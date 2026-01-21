/**
 * JSON data loader with React cache for server-side data fetching
 * Loads game data from file-based JSON storage
 */

import { cache } from 'react';
import fs from 'fs/promises';
import path from 'path';
import type { GameMeta, GameEntity, GameData } from '@/types/game';

// Data directory path
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'games');

/**
 * Load game metadata (_meta.json)
 * Cached per request for performance
 */
export const loadGameMeta = cache(async (gameSlug: string): Promise<GameMeta> => {
  const metaPath = path.join(DATA_DIR, gameSlug, '_meta.json');

  try {
    const content = await fs.readFile(metaPath, 'utf-8');
    return JSON.parse(content) as GameMeta;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Game metadata not found: ${gameSlug}`);
    }
    throw error;
  }
});

/**
 * Load entities of a specific type (heroes.json, dungeons.json, etc.)
 * Cached per request for performance
 */
export const loadEntities = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string
  ): Promise<T[]> => {
    const entityPath = path.join(DATA_DIR, gameSlug, `${entityType}.json`);

    try {
      const content = await fs.readFile(entityPath, 'utf-8');
      return JSON.parse(content) as T[];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Entity type not found: ${gameSlug}/${entityType}`);
      }
      throw error;
    }
  }
);

/**
 * Load a single entity by slug
 * Cached per request for performance
 */
export const loadEntityBySlug = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string,
    entitySlug: string
  ): Promise<T | null> => {
    const entities = await loadEntities<T>(gameSlug, entityType);
    return entities.find((entity) => entity.slug === entitySlug) || null;
  }
);

/**
 * Load all game data (metadata + all entities)
 * Cached per request for performance
 */
export const loadGameData = cache(async (gameSlug: string): Promise<GameData> => {
  const meta = await loadGameMeta(gameSlug);
  const entities: Record<string, GameEntity[]> = {};

  // Load all entity types defined in metadata
  await Promise.all(
    meta.categories.map(async (category) => {
      try {
        entities[category.entityType] = await loadEntities(
          gameSlug,
          category.entityType
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
 * Get list of all available games
 * Scans the data directory for game folders
 * Cached per request for performance
 */
export const loadAvailableGames = cache(async (): Promise<GameMeta[]> => {
  try {
    const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
    const gameMetaList: GameMeta[] = [];

    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          try {
            const meta = await loadGameMeta(entry.name);
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
 * Search entities by query string
 * Searches in name and description fields
 */
export const searchEntities = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string,
    query: string
  ): Promise<T[]> => {
    const entities = await loadEntities<T>(gameSlug, entityType);
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
 * Filter entities by custom predicate
 */
export const filterEntities = cache(
  async <T extends GameEntity = GameEntity>(
    gameSlug: string,
    entityType: string,
    predicate: (entity: T) => boolean
  ): Promise<T[]> => {
    const entities = await loadEntities<T>(gameSlug, entityType);
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
