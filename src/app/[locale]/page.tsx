import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { loadAvailableGames } from '@/lib/data/loader';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import styles from './page.module.css';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const t = await getTranslations('home');
  const games = await loadAvailableGames(locale);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>{t('title')}</h1>
        <p className={styles.heroSubtitle}>{t('subtitle')}</p>
        <Link href="/games" className={styles.heroButton}>
          {t('browseGames')}
        </Link>
      </section>

      {/* Featured Games Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t('featuredGames')}</h2>
          <Link href="/games" className={styles.viewAllLink}>
            {t('viewAll')} →
          </Link>
        </div>

        <div className={styles.gamesGrid}>
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/games/${game.slug}`}
              className={styles.gameCard}
            >
              <div className={styles.gameImageWrapper}>
                <PlaceholderImage
                  alt={game.name}
                  entityType="generic"
                  className={styles.gameImage}
                />
              </div>
              <div className={styles.gameInfo}>
                <h3 className={styles.gameName}>{game.name}</h3>
                {game.description && (
                  <p className={styles.gameDescription}>{game.description}</p>
                )}
                <div className={styles.gameMeta}>
                  <span className={styles.categoryCount}>
                    {game.categories.length} {t('categories')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {games.length === 0 && (
          <p className={styles.emptyState}>{t('noGames')}</p>
        )}
      </section>

      {/* Features Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('features')}</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📖</div>
            <h3 className={styles.featureTitle}>{t('featureGuides')}</h3>
            <p className={styles.featureDescription}>
              {t('featureGuidesDesc')}
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚔️</div>
            <h3 className={styles.featureTitle}>{t('featureHeroes')}</h3>
            <p className={styles.featureDescription}>
              {t('featureHeroesDesc')}
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>📅</div>
            <h3 className={styles.featureTitle}>{t('featureEvents')}</h3>
            <p className={styles.featureDescription}>
              {t('featureEventsDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
