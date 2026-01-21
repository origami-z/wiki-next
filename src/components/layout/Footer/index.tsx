import { useTranslations } from 'next-intl';
import styles from './Footer.module.css';

export function Footer() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          {t('copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
}
