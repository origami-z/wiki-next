export type EventType = 'one_time' | 'recurring';
export type RecurrenceType = 'weekly' | 'biweekly' | 'custom';
export type EventStatus = 'active' | 'upcoming' | 'ended';

export interface EventStage {
  id: string;
  name: string;
  order: number;
  requirements: {
    itemId?: string;
    itemName: string;
    quantity: number;
  }[];
  rewards: {
    itemId?: string;
    itemName: string;
    quantity: number;
    rarity?: string;
  }[];
}

export interface RecurrenceConfig {
  type: RecurrenceType;
  intervalDays?: number; // Total days in cycle (e.g., 21 for 3 weeks)
  durationDays: number;  // How long the event lasts within that cycle
}

export interface GameEvent {
  id: string;
  slug: string;
  name: string;
  description?: string;
  type: EventType;
  startDate: string; // ISO string
  endDate?: string;  // ISO string, for one-time events
  recurrence?: RecurrenceConfig;
  stages?: EventStage[];
  category?: string;
  image?: string;
}

export interface EventOccurrence {
  startDate: string; // ISO
  endDate: string;   // ISO
  status: EventStatus;
}
