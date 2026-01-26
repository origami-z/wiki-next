import { getTranslations } from 'next-intl/server';
import { getGameEvents } from '@/lib/events/event-loader';
import { EventCard } from '@/components/features/Events/EventCard';
import { EventTimeline } from '@/components/features/Events/EventTimeline';
import { getEventStatus } from '@/lib/events/event-calculator';
import { notFound } from 'next/navigation';

interface EventsPageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
  }>;
}

export default async function EventsPage({ params }: EventsPageProps) {
  const { gameSlug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'events' });
  const events = await getGameEvents(gameSlug);

  if (!events) {
    notFound(); // Or just show empty state
  }

  const activeEvents = events.filter(e => getEventStatus(e) === 'active');
  const upcomingEvents = events.filter(e => getEventStatus(e) === 'upcoming');
  const pastEvents = events.filter(e => getEventStatus(e) === 'ended');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Active Events */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
              {t('activeEvents')}
            </h2>
            {activeEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {activeEvents.map(event => (
                  <EventCard key={event.id} gameSlug={gameSlug} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">{t('noActiveEvents')}</p>
            )}
          </section>

          {/* Upcoming Events */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-600 dark:text-blue-400">{t('upcomingEvents')}</h2>
            {upcomingEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                {upcomingEvents.map(event => (
                  <EventCard key={event.id} gameSlug={gameSlug} event={event} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">{t('noUpcomingEvents')}</p>
            )}
          </section>

           {/* Past Events (Collapsible or simple list?) */}
           {pastEvents.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-500">{t('pastEvents')}</h2>
               <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 opacity-75 grayscale hover:grayscale-0 transition-all">
                {pastEvents.map(event => (
                  <EventCard key={event.id} gameSlug={gameSlug} event={event} />
                ))}
              </div>
            </section>
           )}
        </div>

        {/* Sidebar / Timeline */}
        <div className="hidden lg:block">
           <div className="sticky top-24 p-6 rounded-xl border bg-gray-50 dark:bg-gray-900/50 dark:border-gray-800">
             <EventTimeline events={[...activeEvents, ...upcomingEvents]} />
           </div>
        </div>
      </div>
    </div>
  );
}
