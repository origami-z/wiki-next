import { predictFutureOccurrences } from '@/lib/events/event-predictor';
import { GameEvent } from '@/types/events';

describe('Event Predictor', () => {
  describe('predictFutureOccurrences', () => {
    const recurringEvent: GameEvent = {
      id: 'test-recurring',
      slug: 'test-recurring',
      name: 'Test Recurring Event',
      type: 'recurring',
      startDate: '2024-01-01T00:00:00Z',
      recurrence: {
        type: 'custom',
        intervalDays: 21, // 3 weeks
        durationDays: 7,  // 1 week duration
      },
    };

    it('should return empty array for one-time events', () => {
      const oneTimeEvent: GameEvent = {
        id: 'one-time',
        slug: 'one-time',
        name: 'One Time Event',
        type: 'one_time',
        startDate: '2026-01-01T00:00:00Z',
        endDate: '2026-01-07T00:00:00Z',
      };

      const predictions = predictFutureOccurrences(oneTimeEvent, 5);
      expect(predictions).toHaveLength(0);
    });

    it('should return empty array for events without recurrence config', () => {
      const noRecurrence: GameEvent = {
        id: 'no-recurrence',
        slug: 'no-recurrence',
        name: 'No Recurrence',
        type: 'recurring',
        startDate: '2024-01-01T00:00:00Z',
      };

      const predictions = predictFutureOccurrences(noRecurrence, 5);
      expect(predictions).toHaveLength(0);
    });

    it('should return requested number of occurrences', () => {
      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, 5, testDate);

      expect(predictions).toHaveLength(5);
    });

    it('should include current occurrence if active', () => {
      const testDate = new Date('2024-01-03T00:00:00Z'); // During first cycle
      const predictions = predictFutureOccurrences(recurringEvent, 3, testDate);

      // First prediction should be the current active occurrence
      expect(predictions[0].status).toBe('active');
      expect(predictions[0].cycleIndex).toBe(0);
    });

    it('should mark future occurrences as upcoming', () => {
      const testDate = new Date('2024-01-03T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, 3, testDate);

      // Subsequent predictions should be upcoming
      expect(predictions[1].status).toBe('upcoming');
      expect(predictions[2].status).toBe('upcoming');
    });

    it('should calculate correct interval between occurrences', () => {
      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, 3, testDate);

      const first = new Date(predictions[0].startDate).getTime();
      const second = new Date(predictions[1].startDate).getTime();
      const third = new Date(predictions[2].startDate).getTime();

      const msPerDay = 24 * 60 * 60 * 1000;
      const expectedInterval = 21 * msPerDay;

      expect(second - first).toBe(expectedInterval);
      expect(third - second).toBe(expectedInterval);
    });

    it('should calculate correct duration for each occurrence', () => {
      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, 2, testDate);

      const msPerDay = 24 * 60 * 60 * 1000;
      const expectedDuration = 7 * msPerDay;

      predictions.forEach((prediction) => {
        const start = new Date(prediction.startDate).getTime();
        const end = new Date(prediction.endDate).getTime();
        expect(end - start).toBe(expectedDuration);
      });
    });

    it('should include cycle index in predictions', () => {
      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, 5, testDate);

      expect(predictions[0].cycleIndex).toBe(0);
      expect(predictions[1].cycleIndex).toBe(1);
      expect(predictions[2].cycleIndex).toBe(2);
      expect(predictions[3].cycleIndex).toBe(3);
      expect(predictions[4].cycleIndex).toBe(4);
    });

    it('should skip past occurrences when starting from later date', () => {
      // Start from a date in cycle 10
      const testDate = new Date('2024-07-01T00:00:00Z'); // ~182 days after start
      const predictions = predictFutureOccurrences(recurringEvent, 3, testDate);

      // Should not include cycles that have already ended
      predictions.forEach((prediction) => {
        const endDate = new Date(prediction.endDate).getTime();
        expect(endDate).toBeGreaterThan(testDate.getTime());
      });
    });

    it('should handle weekly recurrence', () => {
      const weeklyEvent: GameEvent = {
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

      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(weeklyEvent, 4, testDate);

      expect(predictions).toHaveLength(4);

      // Verify 7-day interval
      const msPerDay = 24 * 60 * 60 * 1000;
      const first = new Date(predictions[0].startDate).getTime();
      const second = new Date(predictions[1].startDate).getTime();
      expect(second - first).toBe(7 * msPerDay);
    });

    it('should handle biweekly recurrence', () => {
      const biweeklyEvent: GameEvent = {
        id: 'biweekly',
        slug: 'biweekly',
        name: 'Biweekly Event',
        type: 'recurring',
        startDate: '2024-01-01T00:00:00Z',
        recurrence: {
          type: 'biweekly',
          intervalDays: 14,
          durationDays: 3,
        },
      };

      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(biweeklyEvent, 3, testDate);

      expect(predictions).toHaveLength(3);

      // Verify 14-day interval
      const msPerDay = 24 * 60 * 60 * 1000;
      const first = new Date(predictions[0].startDate).getTime();
      const second = new Date(predictions[1].startDate).getTime();
      expect(second - first).toBe(14 * msPerDay);
    });

    it('should use default count of 5 when not specified', () => {
      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, undefined, testDate);

      expect(predictions).toHaveLength(5);
    });

    it('should return valid ISO date strings', () => {
      const testDate = new Date('2024-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, 2, testDate);

      predictions.forEach((prediction) => {
        // Should be valid ISO strings
        expect(new Date(prediction.startDate).toISOString()).toBe(prediction.startDate);
        expect(new Date(prediction.endDate).toISOString()).toBe(prediction.endDate);
      });
    });

    it('should handle dates far in the future', () => {
      // Test from 5 years after event start
      const testDate = new Date('2029-01-01T00:00:00Z');
      const predictions = predictFutureOccurrences(recurringEvent, 5, testDate);

      expect(predictions).toHaveLength(5);

      // All predictions should be after the test date (or currently active)
      predictions.forEach((prediction) => {
        const endTime = new Date(prediction.endDate).getTime();
        expect(endTime).toBeGreaterThan(testDate.getTime());
      });
    });

    describe('3-week cycle accuracy (Wittle Defender pattern)', () => {
      it('should predict correct dates for 21-day cycle', () => {
        const testDate = new Date('2024-01-01T00:00:00Z');
        const predictions = predictFutureOccurrences(recurringEvent, 5, testDate);

        // Cycle 0: Jan 1-8
        expect(predictions[0].startDate).toBe('2024-01-01T00:00:00.000Z');

        // Cycle 1: Jan 22-29 (21 days after cycle 0)
        expect(predictions[1].startDate).toBe('2024-01-22T00:00:00.000Z');

        // Cycle 2: Feb 12-19 (42 days after cycle 0)
        expect(predictions[2].startDate).toBe('2024-02-12T00:00:00.000Z');

        // Cycle 3: Mar 4-11 (63 days after cycle 0)
        expect(predictions[3].startDate).toBe('2024-03-04T00:00:00.000Z');

        // Cycle 4: Mar 25 - Apr 1 (84 days after cycle 0)
        expect(predictions[4].startDate).toBe('2024-03-25T00:00:00.000Z');
      });
    });
  });
});
