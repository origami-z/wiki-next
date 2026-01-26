import { useTranslations } from "next-intl";
import { GameEvent } from "@/types/events";
import { getCurrentOccurrence } from "@/lib/events/event-calculator";

interface EventTimelineProps {
  events: GameEvent[];
}

export function EventTimeline({ events }: EventTimelineProps) {
  const t = useTranslations('events');
  const sortedEvents = [...events].sort((a, b) => {
    const occA = getCurrentOccurrence(a);
    const occB = getCurrentOccurrence(b);
    return new Date(occA.startDate).getTime() - new Date(occB.startDate).getTime();
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold">{t('upcomingTimeline')}</h3>
      <div className="relative border-l-2 border-gray-200 dark:border-gray-800 ml-3 space-y-8 py-2">
        {sortedEvents.map((event) => {
          const occ = getCurrentOccurrence(event);
          const start = new Date(occ.startDate);
          const daysUntilStart = Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

          return (
            <div key={event.id} className="relative pl-6">
              <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 ring-4 ring-white dark:ring-gray-950 dark:border-gray-900" />
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {occ.status === 'active' ? t('activeNow') : t('startsInDays', { days: daysUntilStart })}
                </span>
              </div>
              <h4 className="font-medium">{event.name}</h4>
              <p className="text-sm text-gray-500">{event.type === 'recurring' ? t('recurringEvent') : t('limitedEvent')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
