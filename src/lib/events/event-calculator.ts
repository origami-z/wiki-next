import { GameEvent, EventOccurrence, EventStatus } from '@/types/events';

/**
 * Check if the event is active at the given date
 */
export function isEventActive(event: GameEvent, date: Date = new Date()): boolean {
  const occurrence = getCurrentOccurrence(event, date);
  return occurrence.status === 'active';
}

/**
 * Get the status of the event at a given date
 */
export function getEventStatus(event: GameEvent, date: Date = new Date()): EventStatus {
  return getCurrentOccurrence(event, date).status;
}

/**
 * Calculate the current (or relevant) occurrence for an event relative to a date
 */
export function getCurrentOccurrence(event: GameEvent, date: Date = new Date()): EventOccurrence {
  const now = date.getTime();
  const start = new Date(event.startDate).getTime();

  // Handle one-time events
  if (event.type === 'one_time') {
    const end = event.endDate ? new Date(event.endDate).getTime() : start; // Default end?
    
    if (now < start) return { startDate: event.startDate, endDate: event.endDate || event.startDate, status: 'upcoming' };
    if (now > end) return { startDate: event.startDate, endDate: event.endDate || event.startDate, status: 'ended' };
    return { startDate: event.startDate, endDate: event.endDate || event.startDate, status: 'active' };
  }

  // Handle recurring events
  if (event.type === 'recurring' && event.recurrence) {
    const { intervalDays = 7, durationDays } = event.recurrence;
    const itemsPerCycle = intervalDays * 24 * 60 * 60 * 1000;
    
    // Calculate how many full cycles have passed since start
    const timeSinceStart = now - start;
    
    // If before start date
    if (timeSinceStart < 0) {
      return { 
        startDate: event.startDate, 
        endDate: new Date(start + durationDays * 24 * 60 * 60 * 1000).toISOString(), 
        status: 'upcoming' 
      };
    }

    const cyclesPassed = Math.floor(timeSinceStart / itemsPerCycle);
    const currentCycleStart = start + (cyclesPassed * itemsPerCycle);
    const currentCycleEnd = currentCycleStart + (durationDays * 24 * 60 * 60 * 1000);

    // Check if we are within the "active" duration of the current cycle
    const isWithinDuration = now >= currentCycleStart && now <= currentCycleEnd;

    if (isWithinDuration) {
      return {
        startDate: new Date(currentCycleStart).toISOString(),
        endDate: new Date(currentCycleEnd).toISOString(),
        status: 'active'
      };
    } else {
      // We are in the "downtime" of the current cycle, so show NEXT cycle info
      // OR we just show "upcoming" for next cycle.
      const nextCycleStart = currentCycleStart + itemsPerCycle;
      const nextCycleEnd = nextCycleStart + (durationDays * 24 * 60 * 60 * 1000);
      
      return {
        startDate: new Date(nextCycleStart).toISOString(),
        endDate: new Date(nextCycleEnd).toISOString(),
        status: 'upcoming'
      };
    }
  }

  // Fallback
  return { startDate: event.startDate, endDate: event.startDate, status: 'ended' };
}
