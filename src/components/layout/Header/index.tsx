'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ThemeToggle } from '@/components/features/ThemeToggle';
import { LocaleSwitch } from '@/components/features/LocaleSwitch';
import styles from './Header.module.css';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslations('header');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Logo / Brand */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>{t('title')}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <Link href="/games" className={styles.navLink}>
            {t('games')}
          </Link>
        </nav>

        {/* Actions (Theme + Locale) */}
        <div className={styles.actions}>
          <ThemeToggle />
          <LocaleSwitch />

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
            aria-expanded={isMobileMenuOpen}
          >
            <span className={styles.hamburger}>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
              <span className={styles.hamburgerLine}></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className={styles.mobileNav}>
          <Link
            href="/games"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('games')}
          </Link>
        </nav>
      )}
    </header>
  );
}
