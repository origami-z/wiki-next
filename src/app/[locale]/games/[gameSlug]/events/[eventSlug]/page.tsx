import { getTranslations } from 'next-intl/server';
import { getGameEvent } from '@/lib/events/event-loader';
import { getCurrentOccurrence, getEventStatus } from '@/lib/events/event-calculator';
import { predictFutureOccurrences } from '@/lib/events/event-predictor';
import { EventCountdown } from '@/components/features/Events/EventCountdown';
import { EventStages } from '@/components/features/Events/EventStages';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface EventPageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
    eventSlug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { gameSlug, eventSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'events' });
  const event = await getGameEvent(gameSlug, eventSlug);

  if (!event) {
    notFound();
  }

  const status = getEventStatus(event);
  const occurrence = getCurrentOccurrence(event);
  const futureOccurrences = predictFutureOccurrences(event, 3);

  const startDate = new Date(occurrence.startDate);
  const endDate = new Date(occurrence.endDate);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link
        href={`/games/${gameSlug}/events`}
        className="text-sm text-gray-500 hover:text-blue-500 mb-6 inline-block"
      >
        ← {t('backToEvents')}
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border dark:border-gray-800 shadow-sm overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{event.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                  ${status === 'active' ? 'bg-green-100 text-green-700' :
                    status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {t(`status.${status}`)}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                {event.description}
              </p>

              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500 block">{t('starts')}</span>
                  <span className="font-medium">{startDate.toLocaleString()}</span>
                </div>
                <div>
                   <span className="text-gray-500 block">{t('ends')}</span>
                   <span className="font-medium">{endDate.toLocaleString()}</span>
                </div>
                {event.type === 'recurring' && event.recurrence?.intervalDays && (
                  <div className="col-span-2 pt-2 text-gray-500 italic">
                    * {t('repeatsEvery', { days: event.recurrence.intervalDays })}
                  </div>
                )}
              </div>
            </div>

            {(status === 'active' || status === 'upcoming') && (
              <div className="w-full md:w-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-6 min-w-[200px] flex flex-col items-center justify-center border dark:border-gray-700">
                <p className="text-sm text-gray-500 mb-2 uppercase tracking-tight">{status === 'active' ? t('endsIn').replace(':', '') : t('startsIn').replace(':', '')}</p>
                <EventCountdown targetDate={status === 'active' ? occurrence.endDate : occurrence.startDate} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Stages */}
        {event.stages && event.stages.length > 0 && (
          <EventStages stages={event.stages} />
        )}

        {/* Prediction for Recurring */}
        {event.type === 'recurring' && futureOccurrences.length > 0 && (
          <div className="rounded-xl border bg-gray-50 dark:bg-gray-900/30 p-6">
            <h3 className="text-lg font-bold mb-4">{t('futureDates')}</h3>
            <div className="space-y-3">
              {futureOccurrences.map((occ, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white dark:bg-gray-900 rounded border dark:border-gray-800">
                   <div className="text-sm">
                     <span className="block font-medium">{new Date(occ.startDate).toLocaleDateString()}</span>
                     <span className="text-xs text-gray-500">{new Date(occ.startDate).toLocaleTimeString()}</span>
                   </div>
                   <span className="text-gray-400">→</span>
                   <div className="text-sm text-right">
                     <span className="block font-medium">{new Date(occ.endDate).toLocaleDateString()}</span>
                     <span className="text-xs text-gray-500">{new Date(occ.endDate).toLocaleTimeString()}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
