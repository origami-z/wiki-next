/**
 * JSON Preview Component
 * Displays formatted JSON data with syntax highlighting
 */

'use client';

import styles from './JsonPreview.module.css';

interface JsonPreviewProps {
  data: any;
  title?: string;
}

export function JsonPreview({ data, title = 'JSON Preview' }: JsonPreviewProps) {
  const jsonString = JSON.stringify(data, null, 2);

  function handleCopy() {
    navigator.clipboard.writeText(jsonString);
    // Could add a toast notification here
    alert('JSON copied to clipboard!');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <button onClick={handleCopy} className={styles.copyButton}>
          📋 Copy
        </button>
      </div>
      <pre className={styles.preview}>
        <code className={styles.code}>{jsonString}</code>
      </pre>
    </div>
  );
}
