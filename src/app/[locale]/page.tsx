import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function HomePage() {
  const t = useTranslations('header');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 'var(--spacing-xl)',
      }}
    >
      <h1>{t('title')}</h1>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-lg)' }}>
        Welcome to the Game Wiki
      </p>
      <Link
        href="/games"
        style={{
          display: 'inline-block',
          padding: 'var(--spacing-md) var(--spacing-xl)',
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontWeight: '500',
        }}
      >
        {t('games')}
      </Link>
    </div>
  );
}
