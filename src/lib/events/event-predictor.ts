import { GameEvent, EventOccurrence } from '@/types/events';

interface PredictedOccurrence extends EventOccurrence {
  cycleIndex: number;
}

/**
 * Predict future occurrences of an event
 */
export function predictFutureOccurrences(
  event: GameEvent, 
  count: number = 5, 
  fromDate: Date = new Date()
): PredictedOccurrence[] {
  if (event.type !== 'recurring' || !event.recurrence) {
    return [];
  }

  const occurrences: PredictedOccurrence[] = [];
  const { intervalDays = 7, durationDays } = event.recurrence;
  const cycleMs = intervalDays * 24 * 60 * 60 * 1000;
  const durationMs = durationDays * 24 * 60 * 60 * 1000;
  
  const startMs = new Date(event.startDate).getTime();
  const nowMs = fromDate.getTime();

  // Determine the starting cycle index relative to event start
  // We want to start predicting from the "current" or "next" cycle
  let currentCycleIndex = 0;
  
  if (nowMs > startMs) {
    currentCycleIndex = Math.floor((nowMs - startMs) / cycleMs);
  }

  // Generate 'count' future occurrences
  // We start looking from the current cycle. 
  // If the current cycle is already past (ended), we might want to skip it?
  // Let's just generate the next N VALID ones from 'now'.
  
  let found = 0;
  let attempt = currentCycleIndex;

  while (found < count) {
    const cycleStart = startMs + (attempt * cycleMs);
    const cycleEnd = cycleStart + durationMs;

    // If this occurrence ends in the future (or is active now), include it
    if (cycleEnd > nowMs) {
      occurrences.push({
        startDate: new Date(cycleStart).toISOString(),
        endDate: new Date(cycleEnd).toISOString(),
        status: (nowMs >= cycleStart && nowMs <= cycleEnd) ? 'active' : 'upcoming',
        cycleIndex: attempt
      });
      found++;
    }
    attempt++;
    
    // Safety break
    if (attempt > currentCycleIndex + count + 100) break;
  }

  return occurrences;
}
