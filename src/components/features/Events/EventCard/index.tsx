import Link from "next/link";
import { GameEvent, EventStatus } from "@/types/events";
import { EventCountdown } from "../EventCountdown";
import { getCurrentOccurrence } from "@/lib/events/event-calculator";

interface EventCardProps {
  gameSlug: string;
  event: GameEvent;
}

export function EventCard({ gameSlug, event }: EventCardProps) {
  const occurrence = getCurrentOccurrence(event);
  const { status, startDate, endDate } = occurrence;

  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    upcoming: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    ended: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  };

  return (
    <Link 
      href={`/games/${gameSlug}/events/${event.slug}`}
      className="block group relative overflow-hidden rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          {event.type === 'recurring' && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Recurring
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {event.name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="mt-auto">
          {status === 'active' ? (
            <div className="text-sm">
              <p className="text-gray-500 mb-1">Ends in:</p>
              <EventCountdown targetDate={endDate} />
            </div>
          ) : status === 'upcoming' ? (
             <div className="text-sm">
              <p className="text-gray-500 mb-1">Starts in:</p>
              <EventCountdown targetDate={startDate} />
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Ended on {new Date(endDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
