'use client';

import { useState } from 'react';
import styles from './PlaceholderImage.module.css';

interface PlaceholderImageProps {
  src?: string;
  alt: string;
  entityType?: 'hero' | 'dungeon' | 'skill' | 'generic';
  width?: number;
  height?: number;
  className?: string;
}

export function PlaceholderImage({
  src,
  alt,
  entityType = 'generic',
  width,
  height,
  className = '',
}: PlaceholderImageProps) {
  const [isLoading, setIsLoading] = useState(!!src);
  const [hasError, setHasError] = useState(false);

  const showPlaceholder = !src || hasError;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getSvgPlaceholder = () => {
    const svgProps = {
      width: '100%',
      height: '100%',
      viewBox: '0 0 200 200',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
    };

    switch (entityType) {
      case 'hero':
        return (
          <svg {...svgProps}>
            <rect width="200" height="200" fill="var(--color-bg-sunken)" />
            <circle cx="100" cy="80" r="30" fill="var(--color-border)" />
            <path
              d="M60 140 Q100 120 140 140 L140 180 L60 180 Z"
              fill="var(--color-border)"
            />
            <text
              x="100"
              y="195"
              textAnchor="middle"
              fill="var(--color-text-tertiary)"
              fontSize="12"
            >
              Hero
            </text>
          </svg>
        );

      case 'dungeon':
        return (
          <svg {...svgProps}>
            <rect width="200" height="200" fill="var(--color-bg-sunken)" />
            <rect
              x="50"
              y="60"
              width="100"
              height="120"
              fill="var(--color-border)"
              rx="4"
            />
            <rect
              x="80"
              y="100"
              width="40"
              height="80"
              fill="var(--color-bg-sunken)"
            />
            <rect
              x="90"
              y="70"
              width="20"
              height="20"
              fill="var(--color-bg-sunken)"
            />
            <text
              x="100"
              y="195"
              textAnchor="middle"
              fill="var(--color-text-tertiary)"
              fontSize="12"
            >
              Dungeon
            </text>
          </svg>
        );

      case 'skill':
        return (
          <svg {...svgProps}>
            <rect width="200" height="200" fill="var(--color-bg-sunken)" />
            <circle cx="100" cy="100" r="50" fill="var(--color-border)" />
            <path
              d="M100 60 L110 90 L140 90 L115 110 L125 140 L100 120 L75 140 L85 110 L60 90 L90 90 Z"
              fill="var(--color-bg-sunken)"
            />
            <text
              x="100"
              y="195"
              textAnchor="middle"
              fill="var(--color-text-tertiary)"
              fontSize="12"
            >
              Skill
            </text>
          </svg>
        );

      case 'generic':
      default:
        return (
          <svg {...svgProps}>
            <rect width="200" height="200" fill="var(--color-bg-sunken)" />
            <rect
              x="50"
              y="50"
              width="100"
              height="100"
              fill="var(--color-border)"
              rx="8"
            />
            <circle cx="80" cy="80" r="10" fill="var(--color-bg-sunken)" />
            <path
              d="M60 120 Q100 100 140 120"
              stroke="var(--color-bg-sunken)"
              strokeWidth="4"
              fill="none"
            />
            <text
              x="100"
              y="195"
              textAnchor="middle"
              fill="var(--color-text-tertiary)"
              fontSize="12"
            >
              Image
            </text>
          </svg>
        );
    }
  };

  const containerStyle = {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : '100%',
  };

  return (
    <div
      className={`${styles.container} ${className}`}
      style={containerStyle}
    >
      {isLoading && <div className={styles.skeleton} />}

      {!showPlaceholder && (
        <img
          src={src}
          alt={alt}
          className={`${styles.image} ${isLoading ? styles.loading : ''}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}

      {showPlaceholder && (
        <div className={styles.placeholder}>{getSvgPlaceholder()}</div>
      )}
    </div>
  );
}
