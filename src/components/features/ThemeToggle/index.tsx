'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations('theme');

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className={styles.button} aria-label="Theme toggle">
        <span className={styles.icon}>◐</span>
      </button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀';
      case 'dark':
        return '☾';
      case 'system':
      default:
        return '◐';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return t('light');
      case 'dark':
        return t('dark');
      case 'system':
      default:
        return t('system');
    }
  };

  return (
    <button
      className={styles.button}
      onClick={cycleTheme}
      aria-label={t('toggleTheme')}
      title={getLabel()}
    >
      <span className={styles.icon}>{getIcon()}</span>
    </button>
  );
}
