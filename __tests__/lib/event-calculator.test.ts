import {
  isEventActive,
  getEventStatus,
  getCurrentOccurrence,
} from '@/lib/events/event-calculator';
import { GameEvent } from '@/types/events';

describe('Event Calculator', () => {
  describe('isEventActive', () => {
    describe('One-time events', () => {
      const oneTimeEvent: GameEvent = {
        id: 'test-event',
        slug: 'test-event',
        name: 'Test Event',
        type: 'one_time',
        startDate: '2026-02-01T00:00:00Z',
        endDate: '2026-02-07T23:59:59Z',
      };

      it('should return false before event starts', () => {
        const testDate = new Date('2026-01-15T00:00:00Z');
        expect(isEventActive(oneTimeEvent, testDate)).toBe(false);
      });

      it('should return true during event', () => {
        const testDate = new Date('2026-02-03T12:00:00Z');
        expect(isEventActive(oneTimeEvent, testDate)).toBe(true);
      });

      it('should return false after event ends', () => {
        const testDate = new Date('2026-02-10T00:00:00Z');
        expect(isEventActive(oneTimeEvent, testDate)).toBe(false);
      });

      it('should return true on exact start time', () => {
        const testDate = new Date('2026-02-01T00:00:00Z');
        expect(isEventActive(oneTimeEvent, testDate)).toBe(true);
      });
    });

    describe('Recurring events', () => {
      const recurringEvent: GameEvent = {
        id: 'recurring-test',
        slug: 'recurring-test',
        name: 'Recurring Test',
        type: 'recurring',
        startDate: '2024-01-01T00:00:00Z',
        recurrence: {
          type: 'custom',
          intervalDays: 21,
          durationDays: 7,
        },
      };

      it('should return true during first cycle', () => {
        const testDate = new Date('2024-01-03T00:00:00Z');
        expect(isEventActive(recurringEvent, testDate)).toBe(true);
      });

      it('should return false during downtime of first cycle', () => {
        const testDate = new Date('2024-01-10T00:00:00Z'); // 9 days after start (past 7 day duration)
        expect(isEventActive(recurringEvent, testDate)).toBe(false);
      });

      it('should return true during second cycle', () => {
        // Second cycle starts at day 21 (Jan 22, 2024)
        const testDate = new Date('2024-01-23T00:00:00Z');
        expect(isEventActive(recurringEvent, testDate)).toBe(true);
      });

      it('should return false before event starts', () => {
        const testDate = new Date('2023-12-15T00:00:00Z');
        expect(isEventActive(recurringEvent, testDate)).toBe(false);
      });
    });
  });

  describe('getEventStatus', () => {
    describe('One-time events', () => {
      const event: GameEvent = {
        id: 'status-test',
        slug: 'status-test',
        name: 'Status Test',
        type: 'one_time',
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2026-03-07T23:59:59Z',
      };

      it('should return "upcoming" before event', () => {
        const testDate = new Date('2026-02-15T00:00:00Z');
        expect(getEventStatus(event, testDate)).toBe('upcoming');
      });

      it('should return "active" during event', () => {
        const testDate = new Date('2026-03-04T12:00:00Z');
        expect(getEventStatus(event, testDate)).toBe('active');
      });

      it('should return "ended" after event', () => {
        const testDate = new Date('2026-03-15T00:00:00Z');
        expect(getEventStatus(event, testDate)).toBe('ended');
      });
    });

    describe('Recurring events', () => {
      const event: GameEvent = {
        id: 'recurring-status',
        slug: 'recurring-status',
        name: 'Recurring Status',
        type: 'recurring',
        startDate: '2024-01-01T00:00:00Z',
        recurrence: {
          type: 'custom',
          intervalDays: 14,
          durationDays: 5,
        },
      };

      it('should return "active" during active phase', () => {
        const testDate = new Date('2024-01-03T00:00:00Z');
        expect(getEventStatus(event, testDate)).toBe('active');
      });

      it('should return "upcoming" during downtime (next cycle)', () => {
        const testDate = new Date('2024-01-08T00:00:00Z'); // After 5 days, before next 14-day cycle
        expect(getEventStatus(event, testDate)).toBe('upcoming');
      });
    });
  });

  describe('getCurrentOccurrence', () => {
    describe('One-time events', () => {
      const event: GameEvent = {
        id: 'occurrence-test',
        slug: 'occurrence-test',
        name: 'Occurrence Test',
        type: 'one_time',
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2026-04-15T23:59:59Z',
      };

      it('should return correct dates for upcoming event', () => {
        const testDate = new Date('2026-03-01T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('upcoming');
        expect(occurrence.startDate).toBe('2026-04-01T00:00:00Z');
        expect(occurrence.endDate).toBe('2026-04-15T23:59:59Z');
      });

      it('should return correct dates for active event', () => {
        const testDate = new Date('2026-04-10T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('active');
        expect(occurrence.startDate).toBe('2026-04-01T00:00:00Z');
        expect(occurrence.endDate).toBe('2026-04-15T23:59:59Z');
      });

      it('should return correct dates for ended event', () => {
        const testDate = new Date('2026-05-01T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('ended');
        expect(occurrence.startDate).toBe('2026-04-01T00:00:00Z');
        expect(occurrence.endDate).toBe('2026-04-15T23:59:59Z');
      });
    });

    describe('Recurring events', () => {
      const event: GameEvent = {
        id: 'recurring-occurrence',
        slug: 'recurring-occurrence',
        name: 'Recurring Occurrence',
        type: 'recurring',
        startDate: '2024-01-01T00:00:00Z',
        recurrence: {
          type: 'custom',
          intervalDays: 21,
          durationDays: 7,
        },
      };

      it('should return first cycle dates during first active period', () => {
        const testDate = new Date('2024-01-05T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('active');
        expect(occurrence.startDate).toBe('2024-01-01T00:00:00.000Z');
      });

      it('should return next cycle dates during downtime', () => {
        const testDate = new Date('2024-01-10T00:00:00Z'); // In downtime
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('upcoming');
        // Next cycle should start at day 21 (Jan 22, 2024)
        expect(new Date(occurrence.startDate).getTime()).toBeGreaterThan(
          new Date('2024-01-10T00:00:00Z').getTime()
        );
      });

      it('should calculate correct cycle for dates far in the future', () => {
        // Test date is 365 days after start (roughly cycle 17-18)
        const testDate = new Date('2025-01-01T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        // Should return valid occurrence
        expect(['active', 'upcoming']).toContain(occurrence.status);
        expect(occurrence.startDate).toBeTruthy();
        expect(occurrence.endDate).toBeTruthy();
      });

      it('should return upcoming for dates before event start', () => {
        const testDate = new Date('2023-12-01T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('upcoming');
        expect(occurrence.startDate).toBe('2024-01-01T00:00:00Z');
      });
    });

    describe('Edge cases', () => {
      it('should handle event without endDate', () => {
        const event: GameEvent = {
          id: 'no-end',
          slug: 'no-end',
          name: 'No End Date',
          type: 'one_time',
          startDate: '2026-05-01T00:00:00Z',
        };

        const testDate = new Date('2026-04-01T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('upcoming');
        expect(occurrence.startDate).toBe('2026-05-01T00:00:00Z');
      });

      it('should handle weekly recurring event', () => {
        const event: GameEvent = {
          id: 'weekly',
          slug: 'weekly',
          name: 'Weekly Event',
          type: 'recurring',
          startDate: '2024-01-01T00:00:00Z',
          recurrence: {
            type: 'weekly',
            intervalDays: 7,
            durationDays: 2,
          },
        };

        const testDate = new Date('2024-01-02T00:00:00Z');
        const occurrence = getCurrentOccurrence(event, testDate);

        expect(occurrence.status).toBe('active');
      });
    });
  });
});
