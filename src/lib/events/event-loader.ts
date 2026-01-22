import { loadEntities } from '@/lib/data/loader';
import { GameEvent } from '@/types/events';

/**
 * Load events for a specific game
 */
export async function getGameEvents(gameSlug: string): Promise<GameEvent[]> {
  try {
    // Cast strict type as GameEvent might extend GameEntity but with different strictness
    // loadEntities returns Promise<T[]> where T extends GameEntity
    const events = await loadEntities<any>(gameSlug, 'events');
    return events as GameEvent[];
  } catch (e) {
    console.warn(`Failed to load events for ${gameSlug}`, e);
    return [];
  }
}

/**
 * Get a single event by slug
 */
export async function getGameEvent(gameSlug: string, eventSlug: string): Promise<GameEvent | null> {
  const events = await getGameEvents(gameSlug);
  return events.find(e => e.slug === eventSlug) || null;
}
