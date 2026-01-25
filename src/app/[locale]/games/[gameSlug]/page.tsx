import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { loadGameMeta, loadEntities, loadAvailableGames } from '@/lib/data/loader';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import styles from './page.module.css';

interface GamePageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
  }>;
}

export async function generateStaticParams() {
  const games = await loadAvailableGames();
  return games.map((game) => ({
    gameSlug: game.slug,
  }));
}

export default async function GamePage({ params }: GamePageProps) {
  const { locale, gameSlug } = await params;
  const t = await getTranslations('game');

  let gameMeta;
  try {
    gameMeta = await loadGameMeta(gameSlug, locale);
  } catch {
    notFound();
  }

  // Load entity counts for each category
  const categoryCounts = await Promise.all(
    gameMeta.categories.map(async (category) => {
      try {
        const entities = await loadEntities(gameSlug, category.entityType, locale);
        return { categoryId: category.id, count: entities.length };
      } catch {
        return { categoryId: category.id, count: 0 };
      }
    })
  );

  const countMap = Object.fromEntries(
    categoryCounts.map((c) => [c.categoryId, c.count])
  );

  return (
    <div className={styles.container}>
      {/* Game Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.gameImageWrapper}>
            <PlaceholderImage
              alt={gameMeta.name}
              entityType="generic"
              className={styles.gameImage}
            />
          </div>
          <div className={styles.gameInfo}>
            <h1 className={styles.gameTitle}>{gameMeta.name}</h1>
            {gameMeta.description && (
              <p className={styles.gameDescription}>{gameMeta.description}</p>
            )}
            <div className={styles.quickLinks}>
              <Link
                href={`/games/${gameSlug}/events`}
                className={styles.eventsLink}
              >
                📅 {t('viewEvents')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Categories Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('categories')}</h2>
        <div className={styles.categoriesGrid}>
          {gameMeta.categories.map((category) => (
            <Link
              key={category.id}
              href={`/games/${gameSlug}/${category.slug}`}
              className={styles.categoryCard}
            >
              <div className={styles.categoryIcon}>
                {category.icon || '📁'}
              </div>
              <div className={styles.categoryContent}>
                <h3 className={styles.categoryName}>{category.name}</h3>
                {category.description && (
                  <p className={styles.categoryDescription}>
                    {category.description}
                  </p>
                )}
                <span className={styles.categoryCount}>
                  {countMap[category.id] || 0} {t('items')}
                </span>
              </div>
              <span className={styles.categoryArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Stats Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('statistics')}</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {gameMeta.categories.length}
            </span>
            <span className={styles.statLabel}>{t('totalCategories')}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {categoryCounts.reduce((sum, c) => sum + c.count, 0)}
            </span>
            <span className={styles.statLabel}>{t('totalItems')}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
