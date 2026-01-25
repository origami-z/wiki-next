import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { loadGameMeta, loadEntities, loadAvailableGames } from '@/lib/data/loader';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import type { GameEntity, Hero, Skill, Dungeon } from '@/types/game';
import styles from './page.module.css';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
    categorySlug: string;
  }>;
}

export async function generateStaticParams() {
  const games = await loadAvailableGames();
  const params: { gameSlug: string; categorySlug: string }[] = [];

  for (const game of games) {
    for (const category of game.categories) {
      params.push({
        gameSlug: game.slug,
        categorySlug: category.slug,
      });
    }
  }

  return params;
}

function getEntityType(categorySlug: string): 'hero' | 'dungeon' | 'skill' | 'generic' {
  switch (categorySlug) {
    case 'heroes':
      return 'hero';
    case 'dungeons':
      return 'dungeon';
    case 'skills':
      return 'skill';
    default:
      return 'generic';
  }
}

function getBadgeClass(value: string, type: string): string {
  if (type === 'rarity') {
    return styles[`badge${value.charAt(0).toUpperCase() + value.slice(1)}`] || styles.badge;
  }
  if (type === 'tier') {
    return styles[`badgeTier${value}`] || styles.badge;
  }
  if (type === 'element') {
    return styles[`badge${value.charAt(0).toUpperCase() + value.slice(1)}`] || styles.badge;
  }
  return styles.badge;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { gameSlug, categorySlug } = await params;
  const t = await getTranslations('category');

  let gameMeta;
  try {
    gameMeta = await loadGameMeta(gameSlug);
  } catch {
    notFound();
  }

  const category = gameMeta.categories.find((c) => c.slug === categorySlug);
  if (!category) {
    notFound();
  }

  let entities: GameEntity[] = [];
  try {
    entities = await loadEntities(gameSlug, category.entityType);
  } catch {
    // Empty array if no entities
  }

  const entityType = getEntityType(categorySlug);

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href={`/games/${gameSlug}`} className={styles.breadcrumbLink}>
          {gameMeta.name}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{category.name}</span>
      </nav>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerIcon}>{category.icon || '📁'}</div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{category.name}</h1>
          {category.description && (
            <p className={styles.description}>{category.description}</p>
          )}
          <span className={styles.count}>
            {entities.length} {t('items')}
          </span>
        </div>
      </header>

      {/* Entity Grid */}
      {entities.length > 0 ? (
        <div className={styles.entityGrid}>
          {entities.map((entity) => {
            const hero = entity as Hero;
            const skill = entity as Skill;
            const dungeon = entity as Dungeon;

            return (
              <Link
                key={entity.id}
                href={`/games/${gameSlug}/${categorySlug}/${entity.slug}`}
                className={styles.entityCard}
              >
                <div className={styles.entityImageWrapper}>
                  <PlaceholderImage
                    src={entity.image}
                    alt={entity.name}
                    entityType={entityType}
                    className={styles.entityImage}
                  />
                  {/* Rarity badge for heroes */}
                  {hero.rarity && (
                    <span className={`${styles.rarityBadge} ${getBadgeClass(hero.rarity, 'rarity')}`}>
                      {hero.rarity}
                    </span>
                  )}
                </div>
                <div className={styles.entityContent}>
                  <h3 className={styles.entityName}>{entity.name}</h3>

                  {/* Hero specific badges */}
                  {hero.tier && hero.element && (
                    <div className={styles.badgeRow}>
                      <span className={`${styles.tierBadge} ${getBadgeClass(hero.tier, 'tier')}`}>
                        {hero.tier}
                      </span>
                      <span className={`${styles.elementBadge} ${getBadgeClass(hero.element, 'element')}`}>
                        {hero.element}
                      </span>
                      {hero.role && (
                        <span className={styles.roleBadge}>{hero.role}</span>
                      )}
                    </div>
                  )}

                  {/* Skill specific info */}
                  {skill.type && skill.targetType && !hero.tier && (
                    <div className={styles.badgeRow}>
                      <span className={styles.badge}>{skill.type}</span>
                      {skill.element && (
                        <span className={`${styles.elementBadge} ${getBadgeClass(skill.element, 'element')}`}>
                          {skill.element}
                        </span>
                      )}
                      <span className={styles.badge}>{skill.targetType}</span>
                    </div>
                  )}

                  {/* Dungeon specific info */}
                  {dungeon.type && dungeon.difficulty && !hero.tier && !skill.targetType && (
                    <div className={styles.badgeRow}>
                      <span className={styles.badge}>{dungeon.type}</span>
                      <span className={styles.badge}>{dungeon.difficulty}</span>
                    </div>
                  )}

                  {entity.description && (
                    <p className={styles.entityDescription}>{entity.description}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>{t('noItems')}</p>
        </div>
      )}
    </div>
  );
}
