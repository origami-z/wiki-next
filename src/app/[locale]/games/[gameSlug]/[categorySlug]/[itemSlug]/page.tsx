import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import {
  loadGameMeta,
  loadEntities,
  loadEntityBySlug,
  loadAvailableGames,
} from '@/lib/data/loader';
import { PlaceholderImage } from '@/components/shared/PlaceholderImage';
import type { GameEntity, Hero, Skill, Dungeon, Mechanic, HeroStats } from '@/types/game';
import styles from './page.module.css';

interface ItemPageProps {
  params: Promise<{
    locale: string;
    gameSlug: string;
    categorySlug: string;
    itemSlug: string;
  }>;
}

export async function generateStaticParams() {
  const games = await loadAvailableGames();
  const params: { gameSlug: string; categorySlug: string; itemSlug: string }[] = [];

  for (const game of games) {
    for (const category of game.categories) {
      try {
        const entities = await loadEntities(game.slug, category.entityType);
        for (const entity of entities) {
          params.push({
            gameSlug: game.slug,
            categorySlug: category.slug,
            itemSlug: entity.slug,
          });
        }
      } catch {
        // Skip if no entities
      }
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

export default async function ItemPage({ params }: ItemPageProps) {
  const { locale, gameSlug, categorySlug, itemSlug } = await params;
  const t = await getTranslations('item');

  let gameMeta;
  try {
    gameMeta = await loadGameMeta(gameSlug, locale);
  } catch {
    notFound();
  }

  const category = gameMeta.categories.find((c) => c.slug === categorySlug);
  if (!category) {
    notFound();
  }

  const entity = await loadEntityBySlug(gameSlug, category.entityType, itemSlug, locale);
  if (!entity) {
    notFound();
  }

  const entityType = getEntityType(categorySlug);

  // Type guards for specific entity types
  const isHero = entityType === 'hero';
  const isSkill = entityType === 'skill';
  const isDungeon = entityType === 'dungeon';
  const isMechanic = categorySlug === 'mechanics';

  const hero = isHero ? (entity as Hero) : null;
  const skill = isSkill ? (entity as Skill) : null;
  const dungeon = isDungeon ? (entity as Dungeon) : null;
  const mechanic = isMechanic ? (entity as Mechanic) : null;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href={`/games/${gameSlug}`} className={styles.breadcrumbLink}>
          {gameMeta.name}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <Link
          href={`/games/${gameSlug}/${categorySlug}`}
          className={styles.breadcrumbLink}
        >
          {category.name}
        </Link>
        <span className={styles.breadcrumbSeparator}>/</span>
        <span className={styles.breadcrumbCurrent}>{entity.name}</span>
      </nav>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Column - Image */}
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <PlaceholderImage
              src={entity.image}
              alt={entity.name}
              entityType={entityType}
              className={styles.image}
            />
          </div>

          {/* Hero Quick Stats */}
          {hero && (
            <div className={styles.quickStats}>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatLabel}>{t('rarity')}</span>
                <span className={`${styles.quickStatValue} ${styles[`rarity${hero.rarity.charAt(0).toUpperCase() + hero.rarity.slice(1)}`]}`}>
                  {hero.rarity}
                </span>
              </div>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatLabel}>{t('tier')}</span>
                <span className={`${styles.quickStatValue} ${styles[`tier${hero.tier}`]}`}>
                  {hero.tier}
                </span>
              </div>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatLabel}>{t('element')}</span>
                <span className={`${styles.quickStatValue} ${styles[`element${hero.element.charAt(0).toUpperCase() + hero.element.slice(1)}`]}`}>
                  {hero.element}
                </span>
              </div>
              <div className={styles.quickStatItem}>
                <span className={styles.quickStatLabel}>{t('role')}</span>
                <span className={styles.quickStatValue}>{hero.role}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details */}
        <div className={styles.detailsColumn}>
          <header className={styles.header}>
            <h1 className={styles.title}>{entity.name}</h1>
            {entity.description && (
              <p className={styles.description}>{entity.description}</p>
            )}
          </header>

          {/* Hero Stats */}
          {hero && hero.stats && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('stats')}</h2>
              <div className={styles.statsGrid}>
                <StatBar label={t('hp')} value={hero.stats.hp} max={15000} color="hp" />
                <StatBar label={t('attack')} value={hero.stats.attack} max={1200} color="attack" />
                <StatBar label={t('defense')} value={hero.stats.defense} max={1000} color="defense" />
                <StatBar label={t('speed')} value={hero.stats.speed} max={200} color="speed" />
                {hero.stats.critRate !== undefined && (
                  <StatBar label={t('critRate')} value={hero.stats.critRate} max={100} color="crit" suffix="%" />
                )}
                {hero.stats.critDamage !== undefined && (
                  <StatBar label={t('critDamage')} value={hero.stats.critDamage} max={300} color="crit" suffix="%" />
                )}
              </div>
            </section>
          )}

          {/* Skill Info */}
          {skill && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('skillInfo')}</h2>
              <div className={styles.skillMeta}>
                <div className={styles.skillMetaItem}>
                  <span className={styles.skillMetaLabel}>{t('skillType')}</span>
                  <span className={`${styles.skillMetaValue} ${styles.skillTypeBadge}`}>
                    {skill.type}
                  </span>
                </div>
                {skill.element && (
                  <div className={styles.skillMetaItem}>
                    <span className={styles.skillMetaLabel}>{t('element')}</span>
                    <span className={`${styles.skillMetaValue} ${styles[`element${skill.element.charAt(0).toUpperCase() + skill.element.slice(1)}`]}`}>
                      {skill.element}
                    </span>
                  </div>
                )}
                <div className={styles.skillMetaItem}>
                  <span className={styles.skillMetaLabel}>{t('target')}</span>
                  <span className={styles.skillMetaValue}>{skill.targetType}</span>
                </div>
                {skill.cooldown !== undefined && (
                  <div className={styles.skillMetaItem}>
                    <span className={styles.skillMetaLabel}>{t('cooldown')}</span>
                    <span className={styles.skillMetaValue}>{skill.cooldown} {t('turns')}</span>
                  </div>
                )}
                {skill.manaCost !== undefined && (
                  <div className={styles.skillMetaItem}>
                    <span className={styles.skillMetaLabel}>{t('manaCost')}</span>
                    <span className={styles.skillMetaValue}>{skill.manaCost}</span>
                  </div>
                )}
              </div>

              {/* Skill Effects */}
              {skill.effects && skill.effects.length > 0 && (
                <div className={styles.effectsList}>
                  <h3 className={styles.effectsTitle}>{t('effects')}</h3>
                  {skill.effects.map((effect, index) => (
                    <div key={index} className={styles.effectItem}>
                      <span className={`${styles.effectType} ${styles[`effect${effect.type.charAt(0).toUpperCase() + effect.type.slice(1)}`]}`}>
                        {effect.type}
                      </span>
                      <span className={styles.effectDescription}>{effect.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Dungeon Info */}
          {dungeon && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('dungeonInfo')}</h2>
              <div className={styles.dungeonMeta}>
                <div className={styles.dungeonMetaItem}>
                  <span className={styles.dungeonMetaLabel}>{t('dungeonType')}</span>
                  <span className={styles.dungeonMetaValue}>{dungeon.type}</span>
                </div>
                <div className={styles.dungeonMetaItem}>
                  <span className={styles.dungeonMetaLabel}>{t('difficulty')}</span>
                  <span className={`${styles.dungeonMetaValue} ${styles[`difficulty${dungeon.difficulty.charAt(0).toUpperCase() + dungeon.difficulty.slice(1)}`]}`}>
                    {dungeon.difficulty}
                  </span>
                </div>
                {dungeon.recommendedLevel !== undefined && (
                  <div className={styles.dungeonMetaItem}>
                    <span className={styles.dungeonMetaLabel}>{t('recommendedLevel')}</span>
                    <span className={styles.dungeonMetaValue}>{t('level')} {dungeon.recommendedLevel}</span>
                  </div>
                )}
              </div>

              {/* Dungeon Rewards */}
              {dungeon.rewards && dungeon.rewards.length > 0 && (
                <div className={styles.rewardsList}>
                  <h3 className={styles.rewardsTitle}>{t('rewards')}</h3>
                  <div className={styles.rewardsGrid}>
                    {dungeon.rewards.map((reward, index) => (
                      <div key={index} className={styles.rewardItem}>
                        <span className={styles.rewardName}>{reward.itemName}</span>
                        <span className={styles.rewardQuantity}>x{reward.quantity}</span>
                        {reward.dropRate !== undefined && (
                          <span className={styles.rewardDropRate}>{reward.dropRate}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Mechanic Info */}
          {mechanic && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>{t('mechanicInfo')}</h2>
              <div className={styles.mechanicMeta}>
                <div className={styles.mechanicMetaItem}>
                  <span className={styles.mechanicMetaLabel}>{t('mechanicCategory')}</span>
                  <span className={styles.mechanicMetaValue}>{mechanic.category}</span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Back Link */}
      <div className={styles.backLink}>
        <Link href={`/games/${gameSlug}/${categorySlug}`}>
          ← {t('backToList', { category: category.name })}
        </Link>
      </div>
    </div>
  );
}

// Stat Bar Component
function StatBar({
  label,
  value,
  max,
  color,
  suffix = '',
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={styles.statBar}>
      <div className={styles.statBarHeader}>
        <span className={styles.statBarLabel}>{label}</span>
        <span className={styles.statBarValue}>
          {value}{suffix}
        </span>
      </div>
      <div className={styles.statBarTrack}>
        <div
          className={`${styles.statBarFill} ${styles[`statBar${color.charAt(0).toUpperCase() + color.slice(1)}`]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
