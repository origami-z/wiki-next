'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import styles from './LocaleSwitch.module.css';

export function LocaleSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('locale');

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'zh' : 'en';
    router.replace(pathname, { locale: newLocale });
  };

  const getLocaleDisplay = () => {
    return locale === 'en' ? 'EN' : '中';
  };

  const getLocaleLabel = () => {
    return locale === 'en' ? t('english') : t('chinese');
  };

  return (
    <button
      className={styles.button}
      onClick={switchLocale}
      aria-label={t('switchLocale')}
      title={getLocaleLabel()}
    >
      <span className={styles.text}>{getLocaleDisplay()}</span>
    </button>
  );
}
