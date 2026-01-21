/**
 * Admin Layout Component
 * Provides navigation and layout structure for admin pages
 */

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  gameSlug?: string;
}

export function AdminLayout({ children, gameSlug = 'wittle-defender' }: AdminLayoutProps) {
  const pathname = usePathname();

  const entityTypes = [
    { slug: 'heroes', label: 'Heroes', icon: '⚔️' },
    { slug: 'dungeons', label: 'Dungeons', icon: '🏰' },
    { slug: 'skills', label: 'Skills', icon: '✨' },
    { slug: 'mechanics', label: 'Mechanics', icon: '⚙️' },
  ];

  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logo}>
            🛠️ Admin Panel
          </Link>
          <div className={styles.gameName}>Wittle Defender</div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Entities</div>
            <ul className={styles.navList}>
              {entityTypes.map((entity) => {
                const href = `/admin/${gameSlug}/${entity.slug}`;
                return (
                  <li key={entity.slug}>
                    <Link
                      href={href}
                      className={`${styles.navLink} ${
                        isActive(href) ? styles.navLinkActive : ''
                      }`}
                    >
                      <span className={styles.navIcon}>{entity.icon}</span>
                      <span>{entity.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.navSection}>
            <div className={styles.navSectionTitle}>Other</div>
            <ul className={styles.navList}>
              <li>
                <Link
                  href="/"
                  className={styles.navLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className={styles.navIcon}>🌐</span>
                  <span>View Site</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.envBadge}>
            <span className={styles.envDot}></span>
            Development Mode
          </div>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
