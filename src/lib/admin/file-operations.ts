/**
 * File Operations for Admin System
 * Handles reading and writing JSON data files
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Base path for game data files
 */
const DATA_DIR = path.join(process.cwd(), 'src', 'data', 'games');

/**
 * Get the file path for an entity type
 */
function getEntityFilePath(gameSlug: string, entityType: string): string {
  return path.join(DATA_DIR, gameSlug, `${entityType}.json`);
}

/**
 * Read entity data from JSON file
 */
export async function readEntityData(
  gameSlug: string,
  entityType: string
): Promise<any[]> {
  try {
    const filePath = getEntityFilePath(gameSlug, entityType);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * Write entity data to JSON file
 */
export async function writeEntityData(
  gameSlug: string,
  entityType: string,
  data: any[]
): Promise<void> {
  const filePath = getEntityFilePath(gameSlug, entityType);

  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  // Write file with pretty formatting
  const jsonContent = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, jsonContent, 'utf-8');
}

/**
 * Get a single entity by ID
 */
export async function getEntityById(
  gameSlug: string,
  entityType: string,
  entityId: string
): Promise<any | null> {
  const data = await readEntityData(gameSlug, entityType);
  return data.find((entity) => entity.id === entityId) || null;
}

/**
 * Get a single entity by slug
 */
export async function getEntityBySlug(
  gameSlug: string,
  entityType: string,
  slug: string
): Promise<any | null> {
  const data = await readEntityData(gameSlug, entityType);
  return data.find((entity) => entity.slug === slug) || null;
}

/**
 * Create a new entity
 */
export async function createEntity(
  gameSlug: string,
  entityType: string,
  entityData: any
): Promise<void> {
  const data = await readEntityData(gameSlug, entityType);

  // Check if entity with same ID already exists
  if (data.some((entity) => entity.id === entityData.id)) {
    throw new Error(`Entity with ID ${entityData.id} already exists`);
  }

  // Check if entity with same slug already exists
  if (data.some((entity) => entity.slug === entityData.slug)) {
    throw new Error(`Entity with slug ${entityData.slug} already exists`);
  }

  // Add new entity
  data.push(entityData);

  // Write back to file
  await writeEntityData(gameSlug, entityType, data);
}

/**
 * Update an existing entity
 */
export async function updateEntity(
  gameSlug: string,
  entityType: string,
  entityId: string,
  entityData: any
): Promise<void> {
  const data = await readEntityData(gameSlug, entityType);

  // Find entity index
  const index = data.findIndex((entity) => entity.id === entityId);

  if (index === -1) {
    throw new Error(`Entity with ID ${entityId} not found`);
  }

  // Check if slug is unique (excluding current entity)
  if (
    entityData.slug !== data[index].slug &&
    data.some((entity) => entity.slug === entityData.slug)
  ) {
    throw new Error(`Entity with slug ${entityData.slug} already exists`);
  }

  // Update entity
  data[index] = { ...entityData, id: entityId }; // Preserve original ID

  // Write back to file
  await writeEntityData(gameSlug, entityType, data);
}

/**
 * Delete an entity
 */
export async function deleteEntity(
  gameSlug: string,
  entityType: string,
  entityId: string
): Promise<void> {
  const data = await readEntityData(gameSlug, entityType);

  // Filter out the entity to delete
  const filteredData = data.filter((entity) => entity.id !== entityId);

  if (filteredData.length === data.length) {
    throw new Error(`Entity with ID ${entityId} not found`);
  }

  // Write back to file
  await writeEntityData(gameSlug, entityType, filteredData);
}

/**
 * Search entities by query
 */
export async function searchEntities(
  gameSlug: string,
  entityType: string,
  query: string,
  searchFields: string[]
): Promise<any[]> {
  const data = await readEntityData(gameSlug, entityType);

  if (!query) {
    return data;
  }

  const lowerQuery = query.toLowerCase();

  return data.filter((entity) => {
    return searchFields.some((field) => {
      const value = entity[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      if (Array.isArray(value)) {
        return value.some(
          (item) =>
            typeof item === 'string' && item.toLowerCase().includes(lowerQuery)
        );
      }
      return false;
    });
  });
}

/**
 * Sort entities by field
 */
export function sortEntities(
  data: any[],
  sortField: string,
  sortOrder: 'asc' | 'desc' = 'asc'
): any[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    // Handle undefined values
    if (aValue === undefined && bValue === undefined) return 0;
    if (aValue === undefined) return sortOrder === 'asc' ? 1 : -1;
    if (bValue === undefined) return sortOrder === 'asc' ? -1 : 1;

    // Compare values
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortOrder === 'asc' ? comparison : -comparison;
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Fallback: compare as strings
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

/**
 * Check if admin mode is enabled
 */
export function isAdminEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get all available game slugs
 */
export async function getAvailableGames(): Promise<string[]> {
  try {
    const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    return [];
  }
}

/**
 * Get all entity types for a game
 */
export async function getEntityTypes(gameSlug: string): Promise<string[]> {
  try {
    const gamePath = path.join(DATA_DIR, gameSlug);
    const entries = await fs.readdir(gamePath);

    return entries
      .filter((file) => file.endsWith('.json') && !file.startsWith('_'))
      .map((file) => file.replace('.json', ''));
  } catch (error) {
    return [];
  }
}
