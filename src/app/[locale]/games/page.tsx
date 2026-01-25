import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { loadAvailableGames } from '@/lib/data/loader';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import styles from './page.module.css';

interface GamesPageProps {
  params: Promise<{ locale: string }>;
}

export default async function GamesPage({ params }: GamesPageProps) {
  const { locale } = await params;
  const t = await getTranslations('games');
  const games = await loadAvailableGames(locale);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
      </header>

      {games.length > 0 ? (
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
              <div className={styles.gameContent}>
                <h2 className={styles.gameName}>{game.name}</h2>
                {game.description && (
                  <p className={styles.gameDescription}>{game.description}</p>
                )}
                <div className={styles.categoriesList}>
                  {game.categories.slice(0, 4).map((category) => (
                    <span key={category.id} className={styles.categoryTag}>
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </span>
                  ))}
                  {game.categories.length > 4 && (
                    <span className={styles.categoryMore}>
                      +{game.categories.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>{t('noGames')}</p>
        </div>
      )}
    </div>
  );
}
