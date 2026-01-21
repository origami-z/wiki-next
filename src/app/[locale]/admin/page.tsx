/**
 * Admin Dashboard
 * Overview of the admin system
 */

import Link from 'next/link';
import styles from './page.module.css';

export default function AdminPage() {
  const games = [
    {
      slug: 'wittle-defender',
      name: 'Wittle Defender',
      entities: [
        { slug: 'heroes', label: 'Heroes', icon: '⚔️' },
        { slug: 'dungeons', label: 'Dungeons', icon: '🏰' },
        { slug: 'skills', label: 'Skills', icon: '✨' },
        { slug: 'mechanics', label: 'Mechanics', icon: '⚙️' },
      ],
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <p className={styles.description}>
          Manage game data and entities. Select a game and entity type to get started.
        </p>
      </div>

      <div className={styles.games}>
        {games.map((game) => (
          <div key={game.slug} className={styles.game}>
            <h2 className={styles.gameName}>{game.name}</h2>

            <div className={styles.entities}>
              {game.entities.map((entity) => (
                <Link
                  key={entity.slug}
                  href={`/admin/${game.slug}/${entity.slug}`}
                  className={styles.entityCard}
                >
                  <div className={styles.entityIcon}>{entity.icon}</div>
                  <div className={styles.entityLabel}>{entity.label}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.info}>
        <h3 className={styles.infoTitle}>Development Mode Only</h3>
        <p className={styles.infoText}>
          This admin panel is only accessible in development mode
          (NODE_ENV=development). In production, all admin routes return 404.
        </p>
      </div>
    </div>
  );
}
